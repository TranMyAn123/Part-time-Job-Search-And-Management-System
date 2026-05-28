from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "EMPLOYER"


class IsJobOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.employer.user == request.user


class IsApplicationJobOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.job.employer.user == request.user
