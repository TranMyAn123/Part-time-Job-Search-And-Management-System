from users.models import *
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


class UserSerializer(SimpleUserSerializer):
    address = serializers.SerializerMethodField()
    dob = serializers.SerializerMethodField()
    cityzenID = serializers.SerializerMethodField()

    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + [
            "id",
            "username",
            "password",
            "email",
            "address",
            "dob",
            "cityzenID",
        ]
        extra_kwargs = {"password": {"write_only": True}}

    def get_address(self, obj):
        try:
            return obj.profile.address
        except:
            return None

    def get_dob(self, obj):
        try:
            return str(obj.profile.dob) if obj.profile.dob else None
        except:
            return None

    def get_cityzenID(self, obj):
        try:
            return obj.profile.cityzenID
        except:
            return None


class ProfileSerializer(SimpleUserSerializer):
    address = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    dob = serializers.DateField(required=False, allow_null=True)
    cityzenID = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = SimpleUserSerializer.Meta.model
        fields = SimpleUserSerializer.Meta.fields + ["address", "dob", "cityzenID"]

    def update(self, instance, validated_data):
        address = validated_data.pop('address', None)
        dob = validated_data.pop('dob', None)
        cityzenID = validated_data.pop('cityzenID', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        profile, _ = Profile.objects.get_or_create(user=instance)
        if address is not None:
            profile.address = address
        if dob is not None:
            profile.dob = dob
        if cityzenID is not None:
            profile.cityzenID = cityzenID
        profile.save()

        return instance

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
        fields = ["username", "email", "password", "first_name", "last_name"]

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
