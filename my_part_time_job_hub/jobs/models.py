from django.db import models
from onlinejobapp.models import BaseActiveModel, TimeStampedModel
from django.utils import timezone
from users.models import User
from cloudinary.models import CloudinaryField

"""
Employer, Industry, Job, Comment, Application
"""


class Employer(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="employer_profile",
    )
    company_name = models.CharField(max_length=150)
    logo_company = CloudinaryField(null=True, blank=True)
    tax_code = models.CharField(max_length=14, unique=True)
    is_verified = models.BooleanField(default=False)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.company_name


class WorkplaceImage(models.Model):
    employer = models.ForeignKey(
        Employer, on_delete=models.CASCADE, related_name="workplace_images"
    )
    image = CloudinaryField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image of {self.employer.company_name}"


class Industry(BaseActiveModel, TimeStampedModel):
    name = models.CharField(max_length=150, unique=True)
    description = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.name


class Job(BaseActiveModel, TimeStampedModel):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Chờ duyệt"
        OPENING = "OPENING", "Đã duyệt"
        CLOSED = "CLOSED", "Hết hạn"

    VALID_TRANSITIONS = {
        Status.PENDING: [Status.OPENING, Status.CLOSED],
        Status.OPENING: [Status.CLOSED],
<<<<<<< HEAD
        Status.CLOSED: [],
=======
        Status.CLOSED: [Status.OPENING],
>>>>>>> origin/frontend/login_register
    }

    employer = models.ForeignKey(
        Employer, on_delete=models.CASCADE, related_name="jobs"
    )
    industry = models.ForeignKey(
        Industry, on_delete=models.SET_NULL, null=True, related_name="jobs"
    )
    title = models.CharField(max_length=150)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    requirement = models.CharField(max_length=150)
    salary_min = models.DecimalField(max_digits=12, decimal_places=2)
    salary_max = models.DecimalField(max_digits=12, decimal_places=2)
    benefits = models.TextField(null=True, blank=True)
    location = models.CharField(max_length=150)
    available_date = models.DateField()
<<<<<<< HEAD
    max_applicants = models.IntegerField()
=======
>>>>>>> origin/frontend/login_register
    description = models.TextField(null=True, blank=True)

    def is_expired(self):
        return self.available_date < timezone.now().date()

    def get_status_display(self):
        return self.Status(self.status).label

    def transition_to(self, new_status: Status):
        if new_status not in self.VALID_TRANSITIONS[self.status]:
            raise ValueError(
                f"Cannot switch from '{self.get_status_display()}' "
                f"to '{self.Status(new_status).label}'"
            )
        self.status = new_status
        self.save()

<<<<<<< HEAD
    @property
    def remaining_slots(self):
        applicants = self.applications.count()
        return self.max_applicants - applicants

=======
>>>>>>> origin/frontend/login_register
    def __str__(self):
        return self.title


class Application(TimeStampedModel):
    class Status(models.TextChoices):
        REVIEWING = "REVIEWING", "Chờ xét duyệt"
        INTERVIEW = "INTERVIEW", "Hẹn phỏng vấn"
        ACCEPTED = "ACCEPTED", "Trúng tuyển"
        REJECTED = "REJECTED", "Trượt"
        WITHDRAWN = "WITHDRAWN", "Ứng viên rút đơn"
        CANCELLED = "CANCELLED", "Đã hủy"

    VALID_TRANSITIONS = {
        Status.REVIEWING: [
            Status.INTERVIEW,
            Status.REJECTED,
            Status.WITHDRAWN,
            Status.CANCELLED,
        ],
        Status.INTERVIEW: [
            Status.ACCEPTED,
            Status.REJECTED,
            Status.WITHDRAWN,
            Status.CANCELLED,
        ],
        Status.ACCEPTED: [Status.CANCELLED, Status.WITHDRAWN],
        Status.REJECTED: [],
        Status.WITHDRAWN: [],
        Status.CANCELLED: [],
    }
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="applications")
    candidate = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="my_applications"
    )
    apply_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.REVIEWING
    )
    evaluation = models.CharField(max_length=25, null=True, blank=True)
    cv_file = CloudinaryField(resource_type="auto", blank=True, null=True)
<<<<<<< HEAD

=======
>>>>>>> origin/frontend/login_register
    note = models.TextField(null=True, blank=True)

    def get_status_display(self):
        return self.Status(self.status).label

    def transition_to(self, new_status: Status, user: User):
        if user.role != "EMPLOYER":
            if new_status != "WITHDRAWN":
                raise ValueError(f"No permission to perform this action!")
        else:
            if new_status == "WITHDRAWN":
                raise ValueError(f"You cannot perform this action!")

        if new_status not in self.VALID_TRANSITIONS[self.status]:
            raise ValueError(
                f"Cannot switch from '{self.get_status_display()}' to '{self.Status(new_status).label}'"
            )
        self.status = new_status
        self.save()


class Comment(TimeStampedModel):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="relies"
    )
    content = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Comment của {self.user} có id là {self.pk}"


class CompanyFollow(BaseActiveModel, TimeStampedModel):
    candidate = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="following_companies",
        limit_choices_to={"role": "USER"},
    )
    employer = models.ForeignKey(
        Employer,
        on_delete=models.CASCADE,
        related_name="followers",
    )
    notify_email = models.BooleanField(default=False)

    class Meta:
        unique_together = ("candidate", "employer")
        indexes = [
            models.Index(fields=["employer"]),
        ]


class JobNotification(models.Model):
    class Status(models.TextChoices):
        PENDING = "PENDING", "Chờ gửi"
        SENT = "SENT", "Đã gửi"
        FAILED = "FAILED", "Lỗi"

    follow = models.ForeignKey(
        CompanyFollow,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    status = models.CharField(
        max_length=10, choices=Status.choices, default=Status.PENDING
    )
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("follow", "job")
