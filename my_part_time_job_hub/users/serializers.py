from users.models import *
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
import re

class AvatarSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        if instance.avatar:
            data['avatar'] = instance.avatar.url
    
class SimpleUserSerializer(AvatarSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar', "phone_num"]
        
class UserSerializer(SimpleUserSerializer):
    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['id', 'username', 'password', 'email']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

class ProfileSerializer(SimpleUserSerializer):
    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ['address', 'dob', 'cityzenID']
        
        
class LoginSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'password']
        
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        user = authenticate(username=username, password=password)
        
        if not user:
            raise AuthenticationFailed("Sai tài khoản hoặc mật khẩu!")
        if not user.is_active:
            raise AuthenticationFailed("Tài khoản bị khóa")
        
        attrs['user'] = user

        return attrs
        
        
class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }
    
    def validate_username(self, value):
        username = value
        if not re.match(r'^[A-Za-z][0-9A-Za-z]{5,15}$', username):
            raise AuthenticationFailed( 
                 "Username chỉ có nhiều hơn 6 ký tự và bao gồm cả chữ, số"
            )
            
        if User.objects.filter(username=username).exists():
            raise AuthenticationFailed("Username đã tồn tại")
        return value
    
    def validate_password(self, value):
        password = value
        if not re.match(r'^[A-Za-z](?=.*?[0-9])(?=.*?[A-Za-z]).{8,24}$', password):
            raise AuthenticationFailed(
                "Password phải >=8 ký tự, gồm chữ và số"
            )
        return value
        
    def validate_email(self, value):
        email = value
        if not re.match(r'^\S+@\S+\.\S+$', email):
            raise AuthenticationFailed(
                "Sai định dạng email"
            )
        
        if User.objects.filter(email=email).exists():
            raise AuthenticationFailed("Email đã tồn tại")
        return value
    
    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        user.set_password(user.password)
        
        user.save()
        return user