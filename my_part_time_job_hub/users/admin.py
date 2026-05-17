# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import mark_safe
from .models import User, Profile

# Inline


class ProfileInline(admin.StackedInline):
    model = Profile
    extra = 0
    fields = ["address", "dob", "cityzenID"]


# User
class CustomUserAdmin(UserAdmin):
    inlines = [ProfileInline]
    list_display = [
        "username",
        "email",
        "full_name",
        "role_badge",
        "phone_num",
        "is_active",
        "avatar_preview",
    ]
    list_filter = ["role", "is_active", "is_staff"]
    search_fields = ["username", "email", "phone_num"]
    readonly_fields = ["avatar_preview", "date_joined", "last_login"]

    # Kế thừa fieldsets của UserAdmin và thêm fields mới
    fieldsets = UserAdmin.fieldsets + (
        (
            "Thông tin bổ sung",
            {
                "fields": ("phone_num", "avatar", "avatar_preview", "role"),
            },
        ),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Thông tin bổ sung",
            {
                "fields": ("email", "phone_num", "role"),
            },
        ),
    )

    def full_name(self, obj):
        return obj.get_full_name() or "—"

    full_name.short_description = "Họ tên"

    def role_badge(self, obj):
        colors = {
            User.UserStatus.USER: ("blue", "Người dùng"),
            User.UserStatus.EMPLOYER: ("purple", "Nhà tuyển dụng"),
        }
        color, label = colors.get(obj.role, ("gray", obj.role))
        return mark_safe(
            f'<span style="color:{color};font-weight:bold">{label} or — </span>',
        )

    role_badge.short_description = "Vai trò"

    def avatar_preview(self, obj):
        if obj.avatar:
            return mark_safe(
                f'<img src="{obj.avatar.url}" height="60" style="border-radius:50%;object-fit:cover"/>',
            )
        return "Chưa có avatar"

    avatar_preview.short_description = "Avatar"

    # Action đổi role hàng loạt
    actions = ["make_employer", "make_user"]

    def make_employer(self, request, queryset):
        updated = queryset.update(role=User.UserStatus.EMPLOYER)
        self.message_user(request, f"Đã đổi {updated} user thành Nhà tuyển dụng.")

    make_employer.short_description = "Đổi thành Nhà tuyển dụng"

    def make_user(self, request, queryset):
        updated = queryset.update(role=User.UserStatus.USER)
        self.message_user(request, f"Đã đổi {updated} user thành Người dùng.")

    make_user.short_description = "Đổi thành Người dùng"


# Profile
class ProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "address", "dob", "cityzenID"]
    search_fields = ["user__username", "user__email", "cityzenID"]
    readonly_fields = ["user"]
