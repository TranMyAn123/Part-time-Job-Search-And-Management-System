from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from jobs import serializers
from jobs.models import Job, Application
from jobs.utils import search
from rest_framework.decorators import action
from jobs.perms import IsOwnerOrReadOnly, IsEmployer
from rest_framework.permissions import IsAuthenticatedOrReadOnly


class JobViewSet(
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.CreateAPIView,
    generics.RetrieveAPIView,
    generics.DestroyAPIView,
    generics.UpdateAPIView,
):
    queryset = Job.objects.filter(active=True)
    permission_classes = [IsAuthenticatedOrReadOnly, IsEmployer, IsOwnerOrReadOnly]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return serializers.JobCreateSerializer
        return serializers.JobSerializer

    def get_queryset(self):
        queryset = self.queryset
        keyword = self.request.query_params.get("q")
        if keyword:
            fields = [
                "title",
                "employer__company_name",
                "location",
                "industry__name",
            ]
            q = search.create_search_query(keyword, fields)
            queryset = queryset.filter(q)

        min_salary = self.request.query_params.get("min_salary")
        max_salary = self.request.query_params.get("max_salary")

        if min_salary:
            queryset = queryset.filter(salary_min__gte=min_salary)

        if max_salary:
            queryset = queryset.filter(salary_max__lte=max_salary)
        return queryset

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(methods=["get"], url_path="applications", detail=True)
    def applications(self, request, pk):
        job = self.get_object()
        applications = job.application.select_related("candidate").all()

        return Response(
            serializers.ApplicationSerializer(applications, many=True).data,
            status=status.HTTP_200_OK,
        )


class EmployerViewSet(viewsets.ViewSet, generics.CreateAPIView):
    serializer_class = serializers.EmployerSerializer


class ApplicationViewSet(
    viewsets.ViewSet,
    generics.ListAPIView,
    generics.CreateAPIView,
    generics.RetrieveAPIView,
    generics.UpdateAPIView,
):
    def get_serializer_class(self):
        if self.action == "create":
            return serializers.ApplicationCreateSerializer
        if self.action in ["update", "partial_update"]:
            return serializers.ApplicationReviewSerializer
        return serializers.ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        return Application.objects.filter(candidate=user)
