from django.db import models

from onlinejobapp.models import BaseActiveModel
from users.models import User

from jobs.models import Job

'''
Service, Transaction, PaymentUsage
'''

class Service(models.Model):
    name = models.CharField(max_length=150)
    type = models.CharField(max_length=150)
    price = models.DecimalField(decimal_places=2, max_digits=10)
    description = models.TextField()

class Transaction(models.Model):
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Chờ'
        SUCCESS = 'SUCCESS', 'Thành công'
        FAILED = 'FAILED', 'Thất bại'
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, on_delete=models.PROTECT)
    payment_method = models.CharField(max_length=150)
    amount = models.DecimalField(decimal_places=2, max_digits=10)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    note = models.TextField(null=True, blank=True)

class PaymentUsage(BaseActiveModel):
    transaction = models.OneToOneField(Transaction, on_delete=models.CASCADE, primary_key=True)
    job = models.ForeignKey(Job, on_delete=models.CASCADE)



