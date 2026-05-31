import threading
from .models import JobNotification, Job, CompanyFollow
from jobs.services.emails import send_job_opening_notification


def create_notifications_for_job(job: Job):
    follows = CompanyFollow.objects.filter(
        employer=job.employer,
        notify_email=True,
    ).select_related("candidate")

    notifications = [JobNotification(follow=follow, job=job) for follow in follows]
    JobNotification.objects.bulk_create(
        notifications,
        ignore_conflicts=True,
    )


def _send_async(notification_id):
    from jobs.models import JobNotification

    try:
        notification = JobNotification.objects.select_related(
            "follow__candidate", "job__employer"
        ).get(pk=notification_id)
        send_job_opening_notification(notification)
    except Exception as e:
        import logging

        logging.getLogger(__name__).error(f"Async send error: {e}")


def process_pending_notifications(job=None):
    qs = JobNotification.objects.filter(
        status=JobNotification.Status.PENDING  # ← cần giữ trạng thái PENDING
    ).select_related("follow__candidate", "job__employer")

    if job:
        qs = qs.filter(job=job)

    for notification in qs:
        t = threading.Thread(target=_send_async, args=(notification.id,))
        t.daemon = True
        t.start()
