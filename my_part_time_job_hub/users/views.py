import requests
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from users.models import User
from users import serializers
from users.services import auth_services
from rest_framework.exceptions import AuthenticationFailed, ValidationError, NotFound
from django.conf import settings
from oauth2_provider.models import AccessToken, RefreshToken, Application
from django.utils import timezone
from datetime import timedelta
from google.oauth2 import id_token
from google.auth.transport import requests
from oauthlib.common import generate_token
from rest_framework.decorators import api_view

class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.filter(is_active=True)
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]

    @action(methods=['get', 'patch'], url_path='current_user', detail=False,
            permission_classes = [permissions.IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method.__eq__('PATCH'):
            s = serializers.ProfileSerializer(u, data=request.data)
            s.is_valid(raise_exception=True)
            u = s.save()

        return Response(serializers.UserSerializer(u).data, status=status.HTTP_200_OK)

class AuthViewSet(viewsets.ViewSet):
    @action(methods=['post'], url_path="logout", detail=False,
            permission_classes = [permissions.IsAuthenticated])
    def logout_user(self, request):
        try:
            token = request.data.get('access_token')
            result = auth_services.logout(token)
            return Response(result, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except NotFound as e:
            return Response({
                'message': str(e)
            }, status=status.HTTP_404_NOT_FOUND)

    @action(methods=['post'], url_path="login", detail=False)
    def login_user(self, request):
        data = request.data

        if not data:
            return Response({
                "message": "Yêu cầu là bắt buộc"
            }, status=status.HTTP_400_BAD_REQUEST)
        try:
            serializer =  serializers.LoginSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data

            token_url = 'http://127.0.0.1:8000/o/token/'

            data_send_oauth = {
                "grant_type": "password",
                "username": validated_data['username'],
                "password": validated_data['password'],
                "client_id": settings.CLIENT_KEY,
                "client_secret": settings.CLIENT_SECRET,
            }

            response = requests.post(token_url, data=data_send_oauth)
            return Response(response.json(), status=status.HTTP_200_OK)
        except AuthenticationFailed as e:
            return Response({
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], url_path="register", detail=False)
    def register_user(self, request):
        data = request.data

        if not data:
            return Response({
                "message": "Yêu cầu là bắt buộc"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            serializer = serializers.RegisterSerializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            return Response({
                'message': 'Đăng ký thành công',
            }, status=status.HTTP_201_CREATED)
        except AuthenticationFailed as e:
            return Response({
                'message': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
            
    @action(methods=['post'], url_path='google/login', detail=False)
    def google_login(self, request):
        access_token_from_google = request.data.get("access_token_from_google")
        if not access_token_from_google:
            return Response({"Token của google chưa tồn tại"}, status=400)

        data = auth_services.get_google_user(access_token_from_google)

        email = data["email"]
        first_name = data["given_name"]
        last_name = data["family_name"]

        # 2. create or get user (FIXED)
        user, created = User.objects.get_or_create(
            username=email,   # an toàn hơn prefix
            email= email,
            last_login=timezone.now(),
            defaults={
                "first_name": first_name,
                "last_name": last_name,
            }
        )

        if created:
            user.set_unusable_password()
            user.save()

        app = Application.objects.first()
        if not app:
            return Response({"error": "OAuth application not configured"}, status=500)

        # 4. create token
        if AccessToken.objects.filter(user=user).exists():
            return Response({"message": "Đã tồn tại token"}, status=status.HTTP_400_BAD_REQUEST)
        access_token = generate_token()
        refresh_token_value = generate_token()
        
        access_token = AccessToken.objects.create(
            user=user,
            application=app,
            token=access_token,
            expires=timezone.now() + timedelta(hours=2),
            scope="read write"
        )
        
        refresh_token = RefreshToken.objects.create(
            user=user,
            token=refresh_token_value,
            application=app,
            access_token=access_token
        )
        return Response({
            "access_token": access_token,
            "refresh_token": refresh_token
        })
        
    # @action(methods=['post'], url_path='facebook/login', detail=False)
    # def facebook_login(self, request):
            


    