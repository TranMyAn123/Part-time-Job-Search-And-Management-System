
from oauth2_provider.models import AccessToken, RefreshToken
from rest_framework.exceptions import ValidationError, NotFound
import requests

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


def get_google_user(access_token):
    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    res = requests.get("https://www.googleapis.com/oauth2/v3/userinfo", headers=headers)

    if res.status_code != 200:
        raise Exception("Invalid Google access_token")

    return res.json()


