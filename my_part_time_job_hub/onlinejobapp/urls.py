from rest_framework.routers import DefaultRouter
from django.urls import path, include
from jobs import views as job_views
from users import views as user_views

router = DefaultRouter()

# jobs app
router.register("jobs", job_views.JobViewSet, basename="jobs")
router.register("employers", job_views.EmployerViewSet, basename="employers")
router.register("applications", job_views.ApplicationViewSet, basename="applications")
router.register("industries", job_views.IndustryViewSet, basename="industries")
router.register("comments", job_views.CommentViewSet, basename="comments")
# users app
router.register("users", user_views.UserViewSet, basename="users")
router.register("auth", user_views.AuthViewSet, basename="auth")

urlpatterns = [path("", include(router.urls))]
