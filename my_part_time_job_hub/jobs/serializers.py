from rest_framework import serializers
from jobs.models import Job, Application, Employer
from jobs.utils import validators


class JobSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = "__all__"


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "title",
            "requirement",
            "salary_min",
            "status",
            "salary_max",
            "benefic",
            "location",
            "available_date",
            "industry",
            "description",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        return Job.objects.create(employer=user.employer_profile, **validated_data)


class EmployerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employer
        fields = ["company_name", "logo_company", "description"]

    def validate(self, attrs):
        company_name = attrs.get("company_name")
        logo_company = attrs.get("logo_company")
        description = attrs.get("description")

        if not validators.check_strip(company_name):
            raise serializers.ValidationError(
                {"company_name": "Tên công ty không được để trống"}
            )

        if not validators.check_strip(logo_company):
            raise serializers.ValidationError(
                {"logo_company": "Logo công ty không được để trống"}
            )

        if not validators.check_strip(description):
            raise serializers.ValidationError(
                {"description": "Mô tả không được để trống"}
            )
        return attrs


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["job"]

    def create(self, validated_data):
        validated_data["candidate"] = self.context["request"].user
        return super().create(validated_data)


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)  # hiện thông tin job luôn

    class Meta:
        model = Application
        fields = ["id", "job", "apply_date", "status"]
        read_only_fields = fields


class ApplicationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status", "evaluation", "note"]
