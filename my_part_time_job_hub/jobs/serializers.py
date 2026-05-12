from rest_framework import serializers
from jobs.models import Job, Industry

class JobSerializer(serializers.ModelSerializer):
    employer_name = serializers.ReadOnlyField(source='employer.company_name')
    industry_name = serializers.ReadOnlyField(source='industry.name')

    class Meta:
        model = Job
        fields = ['id', 'title', 'created_at', 'updated_at', 'requirement', 'salary_min', 'salary_max', 'benefits', 'location', 'employer_name', 'industry_name', 'active']

class IndustrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Industry
        fields = ['id', 'name']