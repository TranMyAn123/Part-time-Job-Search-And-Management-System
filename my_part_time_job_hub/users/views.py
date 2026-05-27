import requests
from django.utils import timezone
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from users.models import User, Profile
from users import serializers
from users.services import auth_services
from rest_framework.exceptions import AuthenticationFailed, ValidationError, NotFound
from django.conf import settings
from oauth2_provider.models import AccessToken, Application
from jobs.serializers import ApplicationSerializer
from jobs.models import Application as JobApplication
from django.http import HttpResponse
from django.shortcuts import redirect


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    @action(
        methods=["get", "patch"],
        url_path="me",
        detail=False,
        permission_classes=[permissions.IsAuthenticated],
    )
    def me(self, request):
        u = request.user
        if request.method.__eq__("PATCH"):

            if "avatar" in request.data:
                s = serializers.UserSerializer(u, data=request.data, partial=True)
            else:
                profile, _ = Profile.objects.get_or_create(user=u)
                s = serializers.ProfileSerializer(
                    profile, data=request.data, partial=True
                )
            s.is_valid(raise_exception=True)
            s.save()
        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

    @action(
        methods=["patch"],
        url_path="me/change_password",
        detail=False,
        permission_classes=[permissions.IsAuthenticated],
    )
    def change_password(self, request):
        u = request.user
        s = serializers.ChangePasswordSerializer(
            u, data=request.data, context={"request": request}
        )
        s.is_valid(raise_exception=True)
        s.save()
        return Response(
            {"message": "Đổi mật khẩu thành công!"}, status=status.HTTP_202_ACCEPTED
        )

    @action(
        methods=["get"],
        url_path="me/applications",
        detail=False,
        permission_classes=[permissions.IsAuthenticated],
    )
    def applications(self, request):
        u = request.user
        applications = JobApplication.objects.filter(candidate=u).order_by(
            "-apply_date"
        )
        return Response(
            ApplicationSerializer(
                applications, many=True, context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )


class AuthViewSet(viewsets.ViewSet):
    @action(
        methods=["post"],
        url_path="logout",
        detail=False,
        permission_classes=[permissions.IsAuthenticated],
    )
    def logout_user(self, request):
        try:
            token = request.data.get("access_token")
            result = auth_services.logout(token)
            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except NotFound as e:
            return Response({"message": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(methods=["post"], url_path="login", detail=False)
    def login_user(self, request):
        data = request.data
        print("BODY:", data)
        print("CONTENT TYPE:", request.content_type)
        print("POST:", request.POST)

        if not data:
            return Response(
                {"message": "Request is required !"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            serializer = serializers.LoginSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            token_url = request.build_absolute_uri("/o/token/")

            data_send_oauth = {
                "grant_type": "password",
                "username": validated_data["username"],
                "password": validated_data["password"],
                "client_id": settings.CLIENT_KEY,
                "client_secret": settings.CLIENT_SECRET,
            }

            response = requests.post(token_url, json=data_send_oauth)

            if response.status_code == 200:
                user = validated_data.get("user")
                if user:
                    user.last_login = timezone.now()
                    user.save(update_fields=["last_login"])

            return Response(response.json(), status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["post"], url_path="register", detail=False)
    def register_user(self, request):
        data = request.data

        if not data:
            return Response(
                {"message": "Request is required !"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            serializer = serializers.RegisterSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response(
                {
                    "message": "Sign up succeed !",
                },
                status=status.HTTP_201_CREATED,
            )
        except AuthenticationFailed as e:
            return Response({"message": e.detail}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=["get"], url_path="google/login", detail=False)
    def google_login_redirect(self, request):
        url = auth_services.build_google_auth_url()
        return redirect(url)

    @action(methods=["get"], url_path="google/callback", detail=False)
    def google_callback(self, request):
        code = request.GET.get("code")
        print(code)
        if not code:
            return Response(
                {"error": "Missing code"}, status=status.HTTP_400_BAD_REQUEST
            )

        token_data = auth_services.exchange_google_code(code)

        if not token_data:
            return Response(
                {"error": "Token exchange failed"}, status=status.HTTP_400_BAD_REQUEST
            )

        access_token = token_data["access_token"]

        user_info = auth_services.get_google_user(access_token)

        if not user_info:
            return Response({"error": "Cannot get user info"}, status=400)

        user, created = auth_services.create_user_from_social_login(
            user_info.get("email"),
            user_info.get("given_name", ""),
            user_info.get("family_name", ""),
        )

        app = Application.objects.first()

        if not app:
            return Response(
                {"error": "OAuth application not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Xóa token cũ nếu có thay vì báo lỗi
        AccessToken.objects.filter(user=user).delete()

        access_token_sys, refresh_token = auth_services.create_token_from_social_login(
            user, app
        )
        return HttpResponse(
            status=status.HTTP_302_FOUND,
            headers={
                "Location": f"partimejobapp://auth?access_token={access_token_sys}&refresh_token={refresh_token}"
            },
        )

    # @action(methods=["post"], url_path="facebook/login", detail=False)
    # def facebook_login(self, request):
    #     code = request.data.get("code")

    #     if not code:
    #         return Response({"error": "Code không tồn tại"}, status=400)
    #     access_token_from_facebook = auth_services.change_code_to_token(
    #         "facebook", code
    #     )
    #     if not access_token_from_facebook:
    #         return Response(
    #             {"Token của google chưa tồn tại"}, status=status.HTTP_404_NOT_FOUND
    #         )
