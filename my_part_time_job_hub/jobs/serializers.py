from rest_framework import serializers
from jobs.models import Job, Application, Employer, Comment
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
        fields = ["company_name", "logo_company", "description", "tax_code"]

    def validate_tax_code(self, value):
        if Employer.objects.filter(tax_code=value).exists():
            raise serializers.ValidationError("Company's tax code is available!")
        return value

    def validate(self, attrs):
        company_name = attrs.get("company_name")
        logo_company = attrs.get("logo_company")
        description = attrs.get("description")

        if not validators.check_strip(company_name):
            raise serializers.ValidationError(
                {"company_name": "Company name can not empty!"}
            )

        if not validators.check_strip(logo_company):
            raise serializers.ValidationError(
                {"logo_company": "Logo company can not empty!"}
            )

        if not validators.check_strip(description):
            raise serializers.ValidationError(
                {"description": "Description can not empty!"}
            )
        return attrs

    def to_representation(self, instance):
        data = super().to_representation(instance)

        request = self.context["request"]
        if request and request.user and request.user.is_authenticated:
            data["is_followed"] = instance.followers.filter(
                user=request.user, active=True
            ).exists()
        return data


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["job"]

    def create(self, validated_data):
        validated_data["candidate"] = self.context["request"].user
        return super().create(validated_data)


class ApplicationSerializer(serializers.ModelSerializer):
    job = JobSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "job", "apply_date", "status"]
        read_only_fields = fields


class ApplicationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["status", "evaluation", "note"]

    def update(self, instance, validated_data):
        status = validated_data.get("status")
        user = self.context["request"].user
        try:
            instance.transition_to(status, user)
        except ValueError as e:
            raise serializers.ValidationError(str(e))
        return instance


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    user = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ["id", "user", "content", "created_at", "replies"]

    def get_replies(self, obj):
        children = obj.relies.all()
        return CommentSerializer(children, many=True).data
