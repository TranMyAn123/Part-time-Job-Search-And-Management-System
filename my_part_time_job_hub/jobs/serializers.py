from rest_framework import serializers
from jobs.models import Job, Application, Employer, Comment, Industry, WorkplaceImage
from jobs.utils import validators
from django.db import transaction
from users.serializers import SimpleUserSerializer


class EmployerSerializer(serializers.ModelSerializer):
    workplace_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True
    )
    full_name = serializers.SerializerMethodField(read_only=True)
    follow_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Employer
        fields = [
            "full_name",
            "company_name",
            "logo_company",
            "description",
            "tax_code",
            "workplace_images",
            "follow_count",
        ]

    def get_full_name(self, obj):
        user = obj.user
        if user.first_name or user.last_name:
            return f"{user.first_name} {user.last_name}".strip()
        return user.username

    def validate_workplace_images(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Need at least 3 workplace images!")
        return value

    def validate_logo_company(self, value):
        size = 1 * pow(1024, 2)

        if value.size > size:
            raise serializers.ValidationError("Can't upload image higher than 1MB !")
        return value

    def validate_tax_code(self, value):
        if Employer.objects.filter(tax_code=value).exists():
            raise serializers.ValidationError("This tax code is already registered !")
        return value

    def validate(self, attrs):
        company_name = attrs.get("company_name")
        logo_company = attrs.get("logo_company")
        description = attrs.get("description")

        if not validators.check_strip(company_name):
            raise serializers.ValidationError(
                {"company_name": "Company name can not empty!"}
            )

        if not logo_company:
            raise serializers.ValidationError(
                {"logo_company": "Logo company can not empty!"}
            )

        if not validators.check_strip(description):
            raise serializers.ValidationError(
                {"description": "Description can not empty!"}
            )
        return attrs


class SimpleJobSerializer(serializers.ModelSerializer):
    employer = EmployerSerializer(read_only=True)
    industry = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Job
        fields = [
            "employer",
            "industry",
            "title",
            "location",
            "salary_min",
            "salary_max",
            "available_date",
        ]

    def get_industry(self, obj):
        return obj.industry.name if obj.industry else None


class JobSerializer(serializers.ModelSerializer):
    employer = EmployerSerializer(read_only=True)
    industry = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Job
        fields = "__all__"

    def get_industry(self, obj):
        return obj.industry.name if obj.industry else None


class JobCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Job
        fields = [
            "title",
            "requirement",
            "salary_min",
            "status",
            "salary_max",
            "benefits",
            "location",
            "available_date",
            "industry",
            "description",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        return Job.objects.create(employer=user.employer_profile, **validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context["request"]
        if request and request.user and request.user.is_authenticated:
            data["is_followed"] = instance.followers.filter(
                candidate=request.user, active=True
            ).exists()
        return data

    def create(self, validated_data):
        images = validated_data.pop("workplace_images")

        with transaction.atomic():
            employer = super().create(validated_data)
            arrImg = []
            for img in images:
                arrImg.append(img)
            WorkplaceImage.objects.bulk_create(arrImg)

        return employer


class IndustrSerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = "__all__"


class ApplicationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        fields = ["job"]

    def create(self, validated_data):
        validated_data["candidate"] = self.context["request"].user
        return super().create(validated_data)


class ApplicationSerializer(serializers.ModelSerializer):
    job = SimpleJobSerializer(read_only=True)
    candidate = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Application
        fields = ["id", "job", "candidate", "apply_date", "status"]
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
    reply_count = serializers.IntegerField(read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "user",
            "content",
            "parent",
            "created_at",
            "reply_count",
        ]
        extra_kwargs = {
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "parent": {"required": False},
        }

    def get_user(self, obj):
        return {
            "id": obj.user.id,
            "fullname": obj.user.get_full_name() or obj.user.username,
            "avatar": obj.user.avatar.url if obj.user.avatar else None,
        }

    def validate_parent(self, value):
        if value is None:
            return None

        job_id = self.context["job_id"]

        if value.job_id != int(job_id):
            raise serializers.ValidationError("Can't reply comment from another job !")

        if value.parent is not None:
            raise serializers.ValidationError("Can't reply into this reply !")

        return value

    def create(self, validated_data):
        user = self.context["request"].user
        job_id = self.context["job_id"]
        return Comment.objects.create(job_id=job_id, user=user, **validated_data)


# class JobNotificationSerializer(serializers.ModelSerializer):
