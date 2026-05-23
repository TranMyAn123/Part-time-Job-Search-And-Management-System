from rest_framework import viewsets, generics, permissions, status, request
from rest_framework.response import Response
from jobs import serializers
from jobs.models import Job, Application, Comment, Employer, Industry, CompanyFollow
from jobs.utils import search
from rest_framework.decorators import action
from jobs.perms import IsOwnerOrReadOnly, IsEmployer
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.db.models import Count
from django.shortcuts import get_object_or_404
from jobs.paginators import CommentPaginator, ItemPaginator


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

    @action(methods=["post", "get"], url_path="comments", detail=True)
    def comments(self, request, pk):
        if request.method.__eq__("POST"):
            self.get_object()

            s = serializers.CommentSerializer(
                data=request.data, context={"request": request, "job_id": pk}
            )
            s.is_valid(raise_exception=True)
            comment = s.save()
            return Response(
                serializers.CommentSerializer(comment).data,
                status=status.HTTP_201_CREATED,
            )

        comments = (
            Comment.objects.filter(job_id=pk, parent__isnull=True)
            .select_related("user")
            .annotate(reply_count=Count("relies"))
            .order_by("created_at")
        )
        p = CommentPaginator()

        page = p.paginate_queryset(comments, request)
        if page is not None:
            serializer = serializers.CommentSerializer(page, many=True)
            return p.get_paginated_response(serializer.data)

        return Response(
            serializers.CommentSerializer(comments, many=True).data,
            status=status.HTTP_200_OK,
        )


class EmployerViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = Employer.objects.filter(is_verified=True)
    serializer_class = serializers.EmployerSerializer

    @action(methods=["post"], url_path="follow", detail=True)
    def follow(self, request, pk):
        fl, created = CompanyFollow.objects.get_or_create(
            employer=self.get_object(), candidate=request.user
        )

        if not created:
            fl.active = not fl.active

        fl.save()
        return Response(
            serializers.EmployerSerializer(
                self.get_object(), context={"request": request}
            ).data
        )

    @action(methods=["get", "patch"], url_path="profile", detail=False)
    def profile(self, request):
        employer = Employer.objects.get(user=request.user)

        if request.method == "PATCH":
            serializer = serializers.EmployerSerializer(
                employer, data=request.data, partial=True, context={"request": request}
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializers.EmployerSerializer(employer, context={"request": request}).data
        )

class IndustryViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Industry.objects.filter(active=True)
    serializer_class = serializers.IndustrSerializer


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
        if getattr(self, 'swagger_fake_view', False):
            return Application.objects.none()

        user = self.request.user
        return Application.objects.filter(candidate=user)


class CommentViewSet(viewsets.ViewSet):
    @action(methods=["get"], detail=True, url_path="replies")
    def replies(self, request, pk=None):
        get_object_or_404(Comment, pk=pk)
        replies = (
            Comment.objects.filter(parent_id=pk)
            .select_related("user")
            .order_by("created_at")
        )
        return Response(serializers.CommentSerializer(replies, many=True).data)
