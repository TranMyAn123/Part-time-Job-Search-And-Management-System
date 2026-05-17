from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField

"""
User, Profile
"""


class User(AbstractUser):
    class UserStatus(models.TextChoices):
        USER = "USER", "Người dùng"
        EMPLOYER = "EMPLOYER", "Nhà tuyển dụng"

    email = models.EmailField(unique=True)
    phone_num = models.CharField(max_length=10, null=True, blank=True, unique=True)
    avatar = CloudinaryField("avatar", null=True)
    role = models.CharField(
        max_length=20, choices=UserStatus.choices, default=UserStatus.USER
    )

    def __str__(self):
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.username


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    address = models.CharField(max_length=120, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    cityzenID = models.CharField(max_length=120, null=True, blank=True, unique=True)

    def __str__(self):
        return self.user.username
