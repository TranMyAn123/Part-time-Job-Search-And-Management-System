from rest_framework import viewsets, permissions
from jobs.models import Job, Industry
from jobs.serializers import JobSerializer, IndustrySerializer

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.is_staff:
            return Job.objects.all()
        return Job.objects.filter(active=True)

class IndustryViewSet(viewsets.ModelViewSet):
    queryset = Industry.objects.all()
    serializer_class = IndustrySerializer