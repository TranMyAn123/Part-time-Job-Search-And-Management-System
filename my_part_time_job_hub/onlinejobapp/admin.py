from django.contrib import admin
from django.urls import path
from jobs.admin import (
    EmployerAdmin,
    IndustryAdmin,
    JobAdmin,
    ApplicationAdmin,
    CommentAdmin,
    CompanyFollowAdmin,
    JobNotificationAdmin,
)
from jobs.models import *

from users.admin import CustomUserAdmin, ProfileAdmin
from users.models import *

from oauth2_provider.models import (
    Application as OAuthApplication,
    AccessToken,
    RefreshToken,
)
from django.template.response import TemplateResponse
from django.db.models import Count


# Register your models here.
class MyAdminSite(admin.AdminSite):
    site_header = "Hệ thống tìm kiếm việc làm bán thời gian"

    def stats_view(self, request):
        context = {
            "title": "Thống kê hệ thống",
            "total_jobs": Job.objects.count(),
            "total_employers": Employer.objects.count(),
            "total_applications": Application.objects.count(),
            "total_candidates": User.objects.filter(my_applications__isnull=False)
            .distinct()
            .count(),
            "jobs_by_status": Job.objects.values("status").annotate(count=Count("id")),
            "applications_by_status": Application.objects.values("status").annotate(
                count=Count("id")
            ),
            "top_industries": Industry.objects.annotate(job_count=Count("jobs"))
            .order_by("-job_count")[:5]
            .values("name", "job_count"),
        }
        return TemplateResponse(request, "admin/job-stats.html", context)

    def get_urls(self):
        return [
            path("job-stats/", self.stats_view),
        ] + super().get_urls()


admin_site = MyAdminSite()

admin_site.register(Employer, EmployerAdmin)
admin_site.register(Industry, IndustryAdmin)
admin_site.register(Job, JobAdmin)
admin_site.register(Application, ApplicationAdmin)
admin_site.register(Comment, CommentAdmin)
admin_site.register(CompanyFollow, CompanyFollowAdmin)
admin_site.register(JobNotification, JobNotificationAdmin)

admin_site.register(User, CustomUserAdmin)
admin_site.register(Profile, ProfileAdmin)


admin_site.register(OAuthApplication)
admin_site.register(AccessToken)
admin_site.register(RefreshToken)
