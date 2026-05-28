from rest_framework.permissions import BasePermission, SAFE_METHODS


<<<<<<< HEAD
class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "EMPLOYER"


class IsJobOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.employer.user == request.user


class IsApplicationJobOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.job.employer.user == request.user
=======
class IsOwnerOrReadOnly(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.employer.user == request.user


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == "EMPLOYER"
>>>>>>> origin/frontend/login_register
