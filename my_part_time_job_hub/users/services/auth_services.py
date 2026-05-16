from oauth2_provider.models import AccessToken, RefreshToken
from rest_framework.exceptions import ValidationError, NotFound
import requests
from users.models import User
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
from oauthlib.common import generate_token


def logout(token):
    if not token:
        raise ValidationError("Token là bắt buộc!")

    access_token = AccessToken.objects.filter(token=token).first()
    if not access_token:
        raise NotFound("Token không tồn tại!")
    RefreshToken.objects.filter(access_token=access_token).delete()

    access_token.delete()

    return {"message": "Đăng xuất thành công!"}


# services/google.py
def change_code_to_token(provider, code, redirect_uri):
    if provider == "google":
        response = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    elif provider == "facebook":
        response = requests.get(
            "https://graph.facebook.com/v22.0/oauth/access_token",
            params={
                "client_id": settings.FACEBOOK_APP_ID,
                "client_secret": settings.FACEBOOK_APP_SECRET,
                "redirect_uri": redirect_uri,
                "code": code,
            },
        )

    else:
        raise Exception("Provider không hợp lệ")

    return response.json()


def get_google_user(access_token):
    headers = {"Authorization": f"Bearer {access_token}"}
    res = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers=headers)
    return res.json()


def create_user_from_social_login(email, firstname, lastname):
    email = email
    first_name = firstname
    last_name = lastname
    user, created = User.objects.get_or_create(
        username=email,
        email=email,
        defaults={
            "last_login": timezone.now(),
            "first_name": first_name,
            "last_name": last_name,
        },
    )
    if created:
        user.set_unusable_password()

    user.save()
    return user, created


def create_token_from_social_login(user, app):
    access_token = generate_token()
    refresh_token_value = generate_token()
    access_token = AccessToken.objects.create(
        user=user,
        application=app,
        token=access_token,
        expires=timezone.now() + timedelta(hours=2),
        scope="read write",
    )
    refresh_token = RefreshToken.objects.create(
        user=user, token=refresh_token_value, application=app, access_token=access_token
    )
    return access_token, refresh_token
