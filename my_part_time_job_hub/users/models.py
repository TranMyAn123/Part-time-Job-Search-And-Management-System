from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField
'''
User, Profile
'''

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_num = models.CharField(max_length=10, null=True, blank=True, unique=True)
    avatar = CloudinaryField('avatar', null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    address = models.CharField(max_length=120, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    cityzenID = models.CharField(max_length=120, null=True, blank=True, unique=True)

    def __str__(self):
        return self.user.username
