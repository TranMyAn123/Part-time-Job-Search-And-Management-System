# jobs/admin.py
from django.contrib import admin
from django.utils.html import mark_safe

from .models import (
    Job,
    Application,
    Comment,
    JobNotification,
)


# Inline──
class JobInlineAdmin(admin.TabularInline):
    model = Job
    extra = 0
    fields = [
        "title",
        "status",
        "location",
        "salary_min",
        "salary_max",
        "available_date",
    ]
    readonly_fields = ["status"]
    show_change_link = True


class ApplicationInlineAdmin(admin.TabularInline):
    model = Application
    extra = 0
    fields = ["candidate", "status", "apply_date", "evaluation"]
    readonly_fields = ["apply_date"]
    show_change_link = True


class CommentInlineAdmin(admin.TabularInline):
    model = Comment
    extra = 0
    fields = ["user", "parent", "content", "created_at"]
    readonly_fields = ["created_at"]


class JobNotificationInlineAdmin(admin.TabularInline):
    model = JobNotification
    extra = 0
    fields = ["job", "status", "sent_at"]
    readonly_fields = ["sent_at"]


# Employer
class EmployerAdmin(admin.ModelAdmin):
    list_display = [
        "company_name",
        "user",
        "tax_code",
        "verified_badge",
        "follower_count",
    ]

    list_filter = ["is_verified"]
    search_fields = ["company_name", "tax_code", "user__email"]
    readonly_fields = [
        "logo_preview",
        "verified_badge",
    ]

    inlines = [JobInlineAdmin]

    fieldsets = (
        (
            "Thông tin công ty",
            {
                "fields": (
                    "user",
                    "company_name",
                    "tax_code",
                    "is_verified",
                    "verified_badge",
                )
            },
        ),
        (
            "Hình ảnh & Mô tả",
            {
                "fields": (
                    "logo_preview",
                    "description",
                ),
                "classes": ("collapse",),
            },
        ),
    )

    def verified_badge(self, obj):
        if obj.is_verified:
            return mark_safe(
                f'<span style="color:green">✔ Đã xác minh</span>',
            )
        return mark_safe(
            f'<span style="color:red">⏳Chờ xác minh</span>',
        )

    verified_badge.short_description = "Trạng thái"

    def follower_count(self, obj):
        return obj.followers.count()

    follower_count.short_description = "Followers"

    def logo_preview(self, obj):
        if obj.logo_company:
            return mark_safe(
                f'<img src="{obj.logo_company.url}" width="150"/>',
            )

        return "Chưa có logo"

    logo_preview.short_description = "Logo preview"


# Industry
class IndustryAdmin(admin.ModelAdmin):
    list_display = ["name", "job_count"]
    search_fields = ["name"]

    def job_count(self, obj):
        return obj.job_set.count()

    job_count.short_description = "Số job"


# Job
class SalaryRangeFilter(admin.SimpleListFilter):
    title = "Mức lương"
    parameter_name = "salary_range"

    def lookups(self, request, model_admin):
        return [
            ("low", "Dưới 10 triệu"),
            ("mid", "10 – 30 triệu"),
            ("high", "Trên 30 triệu"),
        ]

    def queryset(self, request, queryset):
        if self.value() == "low":
            return queryset.filter(salary_max__lt=10_000_000)
        if self.value() == "mid":
            return queryset.filter(
                salary_min__gte=10_000_000, salary_max__lte=30_000_000
            )
        if self.value() == "high":
            return queryset.filter(salary_min__gt=30_000_000)


class JobAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "employer",
        "industry",
        "status_badge",
        "location",
        "salary_range_display",
        "available_date",
        "is_expired",
    ]
    list_filter = ["status", "industry", "location", SalaryRangeFilter]
    search_fields = ["title", "employer__company_name", "location"]
    readonly_fields = ["created_at", "updated_at"]
    inlines = [ApplicationInlineAdmin, CommentInlineAdmin]

    fieldsets = (
        (
            "Thông tin cơ bản",
            {"fields": ("employer", "industry", "title", "status", "location")},
        ),
        (
            "Lương & Yêu cầu",
            {"fields": ("salary_min", "salary_max", "requirement", "available_date")},
        ),
        (
            "Chi tiết",
            {
                "fields": ("description", "benefic"),
                "classes": ("collapse",),
            },
        ),
        (
            "Timestamps",
            {
                "fields": ("created_at", "updated_at"),
                "classes": ("collapse",),
            },
        ),
    )

    # Duyệt job hàng loạt
    actions = ["approve_jobs", "close_jobs"]

    def approve_jobs(self, request, queryset):
        updated = 0
        for job in queryset.filter(status=Job.Status.PENDING):
            try:
                job.transition_to(Job.Status.OPENING)
                updated += 1
            except ValueError:
                pass
        self.message_user(request, f"Đã duyệt {updated} job.")

    approve_jobs.short_description = "Duyệt các job đã chọn"

    def close_jobs(self, request, queryset):
        updated = 0
        for job in queryset.exclude(status=Job.Status.CLOSED):
            try:
                job.transition_to(Job.Status.CLOSED)
                updated += 1
            except ValueError:
                pass
        self.message_user(request, f"Đã đóng {updated} job.")

    close_jobs.short_description = "Đóng các job đã chọn"

    def status_badge(self, obj):
        colors = {
            Job.Status.PENDING: "orange",
            Job.Status.OPENING: "green",
            Job.Status.CLOSED: "red",
        }
        color = colors.get(obj.status, "gray")
        return mark_safe(
            f'<span style="color:{color};font-weight:bold">{obj.get_status_display()}</span>',
        )

    status_badge.short_description = "Trạng thái"

    def salary_range_display(self, obj):
        return f"{obj.salary_min:,.0f} – {obj.salary_max:,.0f}"

    salary_range_display.short_description = "Lương (VNĐ)"

    def is_expired(self, obj):
        expired = obj.is_expired()
        color = "red" if expired else "green"
        text = "Hết hạn" if expired else "Còn hạn"

        return mark_safe(
            f'<span style="color:{color}">{text}</span>',
        )

    is_expired.short_description = "Hạn nộp"


# Application
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ["candidate", "job", "status_badge", "apply_date", "evaluation"]
    list_filter = ["status"]
    search_fields = ["candidate__email", "job__title"]
    readonly_fields = ["apply_date", "cv_link"]

    def status_badge(self, obj):
        colors = {
            Application.Status.REVIEWING: "blue",
            Application.Status.INTERVIEW: "purple",
            Application.Status.ACCEPTED: "green",
            Application.Status.REJECTED: "red",
            Application.Status.WITHDRAWN: "gray",
            Application.Status.CANCELLED: "gray",
        }
        color = colors.get(obj.status, "black")
        return mark_safe(
            f'<span style="color:{color};font-weight:bold">{obj.get_status_display()}</span>',
        )

    status_badge.short_description = "Trạng thái"

    def cv_link(self, obj):
        if obj.cv_file:
            return mark_safe(f'<a href="{obj.cv_file.url}" target="_blank">Xem CV</a>')
        return "Chưa có CV"

    cv_link.short_description = "CV"


# Comment
class CommentAdmin(admin.ModelAdmin):
    list_display = ["user", "job", "short_content", "parent", "created_at"]
    search_fields = ["user__email", "job__title", "content"]
    readonly_fields = ["created_at"]
    list_filter = ["created_at"]

    def short_content(self, obj):
        return (
            obj.content[:60] + "..."
            if obj.content and len(obj.content) > 60
            else obj.content
        )

    short_content.short_description = "Nội dung"


# CompanyFollow
class CompanyFollowAdmin(admin.ModelAdmin):
    list_display = ["candidate", "employer", "notify_email", "created_at"]
    list_filter = ["notify_email"]
    search_fields = ["candidate__email", "employer__company_name"]
    readonly_fields = ["created_at"]


# JobNotification
class JobNotificationAdmin(admin.ModelAdmin):
    list_display = ["get_candidate", "get_company", "job", "status_badge", "sent_at"]
    list_filter = ["status"]
    search_fields = ["follow__candidate__email", "job__title"]
    readonly_fields = ["sent_at"]
    actions = ["retry_failed"]

    def get_candidate(self, obj):
        return obj.follow.candidate.email

    get_candidate.short_description = "Ứng viên"

    def get_company(self, obj):
        return obj.follow.employer.company_name

    get_company.short_description = "Công ty"

    def status_badge(self, obj):
        colors = {
            JobNotification.Status.PENDING: "orange",
            JobNotification.Status.SENT: "green",
            JobNotification.Status.FAILED: "red",
        }
        color = colors.get(obj.status, "gray")
        return mark_safe(
            f'<span style="color:{color};font-weight:bold">{obj.get_status_display()}</span>',
        )

    status_badge.short_description = "Trạng thái"

    def retry_failed(self, request, queryset):
        """Reset FAILED → PENDING để worker gửi lại."""
        updated = queryset.filter(status=JobNotification.Status.FAILED).update(
            status=JobNotification.Status.PENDING
        )
        self.message_user(request, f"Đã reset {updated} notification để gửi lại.")

    retry_failed.short_description = "Thử gửi lại các notification lỗi"
