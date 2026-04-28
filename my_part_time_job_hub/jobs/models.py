from django.db import models
from onlinejobapp.models import BaseActiveModel, TimeStampedModel

from users.models import User
from cloudinary.models import CloudinaryField
'''
Employer, Industry, Job, Comment, Application
'''
class Employer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='employer_profile')
    company_name = models.CharField(max_length=150)
    logo_company = CloudinaryField('image', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)

class Industry(models.Model):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(null=True, blank=True)

class Job(BaseActiveModel, TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = 'PENDING','Chờ duyệt'
        OPENING = 'OPENING','Đã duyệt'
        CLOSED = 'CLOSED', 'Hết hạn'
    employer = models.ForeignKey(Employer, on_delete=models.CASCADE, related_name='jobs')
    industry = models.ForeignKey(Industry, on_delete=models.SET_NULL, null=True)
    title = models.CharField(max_length=150)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    requirement = models.TextField(null=False, blank=False)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2)
    benefits = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=150)
    available_date = models.DateField()
    is_premium = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)

class Application(models.Model):
    class Status(models.TextChoices):
        REVIEWING = 'REVIEWING', "Chờ xét duyệt"
        INTERVIEW = 'INTERVIEW', "Hẹn phỏng vấn"
        ACCEPTED = 'ACCEPTED', "Trúng tuyển"
        REJECTED = 'REJECTED', "Trượt"
    job = models.ForeignKey(Job, on_delete=models.SET_NULL, null=True, blank=True, related_name='applications')
    candidate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_applications')
    apply_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REVIEWING)
    evaluation = models.CharField(max_length=50, null=True, blank=True)
    note = models.TextField(null=True, blank=True)

    class Meta:
        unique_together = ('job', 'candidate')

class Comment(TimeStampedModel):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='relies')
    content = models.TextField(null=True, blank=True)
