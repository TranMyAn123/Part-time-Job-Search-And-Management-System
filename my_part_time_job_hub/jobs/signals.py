from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Job
from .tasks import create_notifications_for_job, process_pending_notifications


@receiver(pre_save, sender=Job)
def on_job_status_change(sender, instance, **kwargs):
    """
    Khi Job chuyển từ PENDING → OPENING thì tạo + gửi notification.
    """
    if not instance.pk:
        return  # job mới tạo, chưa có status cũ

    try:
        old = Job.objects.get(pk=instance.pk)
    except Job.DoesNotExist:
        return

    just_opened = (
        old.status != Job.Status.OPENING and instance.status == Job.Status.OPENING
    )

    if just_opened:
        from django.db import transaction

        transaction.on_commit(lambda: _notify(instance))


def _notify(job):
    create_notifications_for_job(job)
    process_pending_notifications(job)
