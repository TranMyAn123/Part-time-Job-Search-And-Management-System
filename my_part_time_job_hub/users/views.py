import requests
from rest_framework import viewsets, generics, status, parsers, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from users.models import User
from users import serializers
from users import serializers
from oauth2_provider.models import AccessToken, RefreshToken
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings

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
        token = request.data.get('access_token')
        
        if not token:
            return Response({
                "message": "Token là bắt buộc!"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            access_token = AccessToken.objects.get(token=token)
            
            try:
                refresh_token = RefreshToken.object.get(access_token=access_token)
                refresh_token.revoke()
            except RefreshToken.DoesNotExist:
                pass
            
            access_token.revoke()
            
            return Response({
                "message": "Đăng xuất thành công!"
            }, status=status.HTTP_200_OK)
            
        except AccessToken.DoesNotExist:
            return Response({
                "message": "Token không tồn tại!" 
            },status=status.HTTP_400_BAD_REQUEST)
            
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

            # token_url = 'http://127.0.0.1:8000/o/token/'
            token_url = 'http://192.168.1.12:8000/o/token/'

            data_send_oauth = {
                "grant_type": "password",
                "username": validated_data['username'],
                "password": validated_data['password'],
                "client_id": settings.CLIENT_KEY,
                "client_secret": settings.CLIENT_SECRET,
            }

            response = requests.post(token_url, data=data_send_oauth)
            return Response(response.json(), status=status.HTTP_200_OK)
        except (AuthenticationFailed) as e:
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
        except (AuthenticationFailed) as e:
            return Response({
                'message': e.detail
            }, status=status.HTTP_400_BAD_REQUEST)
        
    
    
        
                