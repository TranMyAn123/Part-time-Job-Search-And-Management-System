from .models import JobNotification, Job, CompanyFollow
from jobs.services.emails import send_job_opening_notification


def create_notifications_for_job(job: Job):

    follows = CompanyFollow.objects.filter(
        employer=job.employer,
        notify_email=True,
    ).select_related("candidate")

    # Bulk create, ignore nếu đã tồn tại (unique_together bảo vệ)
    notifications = [JobNotification(follow=follow, job=job) for follow in follows]
    JobNotification.objects.bulk_create(
        notifications,
        ignore_conflicts=True,
    )


def process_pending_notifications(job=None):
    qs = JobNotification.objects.filter(
        status=JobNotification.Status.PENDING
    ).select_related(
        "follow__candidate",
        "job__employer",
    )
    if job:
        qs = qs.filter(job=job)
    for notification in qs:
        send_job_opening_notification(notification)
