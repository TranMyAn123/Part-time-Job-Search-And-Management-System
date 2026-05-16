from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from ..models import JobNotification


def send_job_opening_notification(notification: JobNotification):
    candidate = notification.follow.candidate
    job = notification.job
    employer = job.employer

    try:
        html_body = render_to_string(
            "send_email_template.html",
            {
                "candidate_name": candidate.get_full_name() or candidate.email,
                "company_name": employer.company_name,
                "job_title": job.title,
                "job_location": job.location,
                "salary_min": job.salary_min,
                "salary_max": job.salary_max,
                "available_date": job.available_date,
            },
        )
        send_mail(
            subject=f"[{employer.company_name}] Có việc làm mới: {job.title}",
            message="",
            from_email="trankhanha53@gmail.com",
            recipient_list=[candidate.email],
            html_message=html_body,
            fail_silently=False,
        )
        notification.status = JobNotification.Status.SENT
        notification.sent_at = timezone.now()
        notification.save(update_fields=["status", "sent_at"])
        return True
    except Exception as e:
        notification.status = JobNotification.Status.FAILED
        notification.save(update_fields=["status"])
        import logging

        logging.getLogger(__name__).error(
            f"Failed to send notification id={notification.id}: {e}"
        )
        return False
