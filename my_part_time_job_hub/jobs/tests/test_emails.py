# jobs/tests/test_emails.py
from django.test import TestCase
from unittest.mock import patch, MagicMock
from jobs.models import JobNotification
from jobs.services.emails import send_job_opening_notification
from jobs.tasks import create_notifications_for_job


class SendJobNotificationTest(TestCase):

    def setUp(self):
        # Setup user, employer, job, follow... dùng factory hoặc tạo thẳng
        from users.models import User
        from jobs.models import Employer, Job, CompanyFollow

        self.candidate = User.objects.create_user(
            email="candidate@test.com",
            username="kimnganbikhung123",
            password="123",
            first_name="Kim Ngân",
            last_name="bị khùng",
            role="USER",
        )
        employer_user = User.objects.create_user(
            email="employer@test.com",
            username="kimnganbidien123",
            password="123",
            role="EMPLOYER",
        )
        self.employer = Employer.objects.create(
            user=employer_user,
            company_name="Công ty ABC",
            tax_code="1234567890",
        )
        self.job = Job.objects.create(
            employer=self.employer,
            title="Backend Developer",
            status=Job.Status.OPENING,
            requirement="2 years exp",
            salary_min=10_000_000,
            salary_max=20_000_000,
            location="HCM",
            available_date="2025-12-31",
        )
        self.follow = CompanyFollow.objects.create(
            candidate=self.candidate,
            employer=self.employer,
            notify_email=True,
        )
        self.notification = JobNotification.objects.create(
            follow=self.follow,
            job=self.job,
        )

    @patch("jobs.services.emails.send_mail")
    def test_xem_kim_ngan_co_bi_khung(self, mock_send_mail):
        mock_send_mail.return_value = 1  # giả lập gửi ok

        result = send_job_opening_notification(self.notification)

        # Kiểm tra send_mail có được gọi không
        self.assertTrue(mock_send_mail.called)

        # Kiểm tra gửi đúng email
        args, kwargs = mock_send_mail.call_args
        self.assertEqual(kwargs["recipient_list"], ["candidate@test.com"])
        self.assertIn("Backend Developer", kwargs["subject"])

        # Kiểm tra status được cập nhật
        self.notification.refresh_from_db()
        self.assertEqual(self.notification.status, JobNotification.Status.SENT)
        self.assertIsNotNone(self.notification.sent_at)

        self.assertTrue(result)

    @patch("jobs.emails.send_mail", side_effect=Exception("SMTP lỗi"))
    def test_gui_that_bai(self, mock_send_mail):
        result = send_job_opening_notification(self.notification)

        self.notification.refresh_from_db()
        self.assertEqual(self.notification.status, JobNotification.Status.FAILED)
        self.assertFalse(result)

    @patch("jobs.emails.send_mail")
    def test_khong_gui_neu_notify_email_false(self, mock_send_mail):
        self.follow.notify_email = False
        self.follow.save()

        # create_notifications_for_job không tạo notif cho follow này
        JobNotification.objects.all().delete()
        create_notifications_for_job(self.job)

        self.assertEqual(JobNotification.objects.count(), 0)
        mock_send_mail.assert_not_called()
