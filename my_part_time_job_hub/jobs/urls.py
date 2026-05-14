from django.urls import path, include
from rest_framework.routers import DefaultRouter
from jobs import views

router = DefaultRouter()
router.register("jobs", views.JobViewSet, basename="jobs")
router.register("employer", views.EmployerViewSet, basename="employer")
urlpatterns = [path("", include(router.urls))]
