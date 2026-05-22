from rest_framework import serializers
from jobs.models import Job, Application, Employer, Comment, Industry, WorkplaceImage
from jobs.utils import validators
from django.db import transaction


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
            "benefits",
            "location",
            "available_date",
            "industry",
            "description",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        return Job.objects.create(employer=user.employer_profile, **validated_data)


class EmployerSerializer(serializers.ModelSerializer):
    workplace_images = serializers.ListField(
        child=serializers.FileField(), write_only=True
    )

    class Meta:
        model = Employer
        fields = [
            "company_name",
            "logo_company",
            "description",
            "tax_code",
            "workplace_images",
        ]

    def validate_workplace_images(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Cần ít nhất 3 ảnh mô tả môi trường làm việc!")
        return value

    def validate_logo_company(self, value):
        size = 5 * pow(1024, 2)

        if value.size > size:
            raise serializers.ValidationError("Ảnh logo không được vượt quá 5MB !")
        return value

    def validate_tax_code(self, value):
        if Employer.objects.filter(tax_code=value).exists():
            raise serializers.ValidationError("Mã số thuế này đã được đăng ký rồi!")
        return value

    def validate(self, attrs):
        company_name = attrs.get("company_name")
        logo_company = attrs.get("logo_company")
        description = attrs.get("description")

        if not validators.check_strip(company_name):
            raise serializers.ValidationError(
                {"company_name": "Tên công ty không được để trống!"}
            )

        if not logo_company:
            raise serializers.ValidationError(
                {"logo_company": "Vui lòng chọn logo cho công ty!!"}
            )

        if not validators.check_strip(description):
            raise serializers.ValidationError(
                {"description": "Vui lòng mô tả về công ty!"}
            )
        return attrs

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
        user = self.context['request'].user

        if Employer.objects.filter(user=user).exists():
            raise serializers.ValidationError({"Lỗi": "Bạn đã đăng ký trở thành nhà tuyển dụng rồi!"})
        with transaction.atomic():
            employer = Employer.objects.create(
                user=self.context['request'].user,
                **validated_data
            )
            WorkplaceImage.objects.bulk_create([
                WorkplaceImage(employer=employer, image=img)
                for img in images
            ])

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
    reply_count = serializers.IntegerField(read_only=True)
    user = serializers.StringRelatedField()

    class Meta:
        model = Comment
        fields = ["id", "user", "content", "parent", "created_at", "reply_count"]

        extra_kwargs = {
            "id": {"read_only": True},
            "created_at": {"read_only": True},
            "parent": {"required": False},
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


# class JobNotificationSerializer(serializers.ModelSerializer):
