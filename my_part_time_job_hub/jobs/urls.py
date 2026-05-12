from django.urls import path, include
from rest_framework.routers import DefaultRouter
from jobs import views

r = DefaultRouter()
r.register('jobs', views.JobViewSet, 'job')
r.register('industrys', views.IndustryViewSet, 'industry')
urlpatterns = [
    path('', include(r.urls)),
]