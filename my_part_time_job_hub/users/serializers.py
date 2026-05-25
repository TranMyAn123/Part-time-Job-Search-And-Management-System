from users.models import *
from jobs.models import Employer
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from users.utils import validators
import re


class AvatarSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        data = super().to_representation(instance)

        if instance.avatar:
            data["avatar"] = instance.avatar.url

        return data


class SimpleUserSerializer(AvatarSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "avatar", "phone_num"]
        extra_kwargs = {"phone_num": {"validators": []}}

    def validate_phone_num(self, value):
        user = self.instance

        if user and User.objects.filter(phone_num=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Số điện thoại đã được sử dụng!")
        return value


class ProfileSerializer(serializers.ModelSerializer):
    user = SimpleUserSerializer(required=False, write_only=True)

    class Meta:
        model = Profile
        fields = ["user", "address", "dob", "cityzenID"]

    def update(self, instance, validated_data):
        user = validated_data.pop("user", {})

        if user:
            user_serializer = SimpleUserSerializer(
                instance=instance.user, data=user, partial=True, context=self.context
            )
            user_serializer.is_valid(raise_exception=True)
            user_serializer.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class UserSerializer(SimpleUserSerializer):
    profile = ProfileSerializer(read_only=True)
    employer = serializers.SerializerMethodField()

    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + [
            "id",
            "username",
            "password",
            "email",
            "profile",
            "last_login",
            "employer",
            "role"
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def update(self, instance, validated_data):
        avatar = validated_data.pop("avatar", None)
        if avatar is not None:
            instance.avatar = avatar
        instance.save()
        return instance

    def get_employer(self, obj):
        return Employer.objects.filter(user=obj).exists()


class LoginSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "password"]

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(username=username, password=password)

        if not user:
            raise AuthenticationFailed("Sai tài khoản hoặc mật khẩu!")
        if not user.is_active:
            raise AuthenticationFailed("Tài khoản bị khóa")

        attrs["user"] = user

        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name", "role"]

        extra_kwargs = {"password": {"write_only": True}}

    def validate_username(self, value):
        username = value
        if not re.match(r"^[A-Za-z][0-9A-Za-z]{5,15}$", username):
            raise AuthenticationFailed(
                "Username chỉ có nhiều hơn 6 ký tự và bao gồm cả chữ, số"
            )

        if User.objects.filter(username=username).exists():
            raise AuthenticationFailed("Username đã tồn tại")
        return value

    def validate_password(self, value):
        password = value
        if not validators.validation_password(password):
            raise AuthenticationFailed("Password phải >=8 ký tự, gồm chữ và số")
        return value

    def validate_email(self, value):
        email = value
        if not re.match(r"^\S+@\S+\.\S+$", email):
            raise AuthenticationFailed("Sai định dạng email")

        if User.objects.filter(email=email).exists():
            raise AuthenticationFailed("Email đã tồn tại")
        return value

    def create(self, validated_data):
        user = User.objects.create(**validated_data)
        user.set_password(user.password)
        user.avatar = "https://res.cloudinary.com/duxz5ias9/image/upload/v1779191141/default_avatar_izym3f.png"
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context["request"].user

        if not user.check_password(value):
            raise serializers.ValidationError("Mật khẩu cũ không đúng!")

        return value

    def validate_new_password(self, value):
        if not validators.validation_password(value):
            raise serializers.ValidationError("Password phải >=8 ký tự, gồm chữ và số")

        return value

    def validate(self, attrs):
        old_password = attrs.get("old_password")
        new_password = attrs.get("new_password")

        if old_password == new_password:
            raise serializers.ValidationError(
                {"new_password": "Không được trùng mật khẩu trước đó!"}
            )

        return attrs

    def update(self, instance, validated_data):
        instance.set_password(validated_data["new_password"])
        instance.save()
        return instance
