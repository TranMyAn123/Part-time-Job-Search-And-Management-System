import json
from oauth2_provider.views import TokenView
from django.conf import settings
from firebase_admin import auth as firebase_auth
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response


class CustomTokenView(TokenView):
    def post(self, request, *args, **kwargs):

        try:
            data = json.loads(request.body)
        except:
            data = {}

        print("PARSED:", data)

        data["client_id"] = settings.CLIENT_KEY
        data["client_secret"] = settings.CLIENT_SECRET
        request._body = json.dumps(data).encode("utf-8")

        print("FINAL BODY:", request._body)

        return super().post(request, *args, **kwargs)


class ChatViewSet(viewsets.ViewSet):
    @action(
        methods=["get"],
        url_path="firebase-token",
        detail=False,
        permission_classes=[permissions.IsAuthenticated],
    )
    def get_firebase_token(self, request):
        user = request.user
        firebase_token = firebase_auth.create_custom_token(str(user.id))
        return Response({"firebase_token": firebase_token.decode("utf-8")})
