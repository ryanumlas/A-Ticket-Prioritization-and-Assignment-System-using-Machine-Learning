from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.db import transaction
from .models import ITSupportSpecialization, User, ITSupportProfile, UserRoles, UserProfile, Specializations

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token["profile_id"] = user.profile.id
        token["username"] = user.username
        token["role"] = user.role.name
        token["first_name"] = user.first_name
        token["last_name"] = user.last_name
        token["user_code"] = user.user_code
        token["employee_department"] = (
            user.profile.employee_department.name
            if user.profile.employee_department
            else None
        )
        token["office_location"] = (
            user.profile.office_location.name
            if user.profile.office_location
            else None
        )
        token["employee_department_id"] = (
            user.profile.employee_department.id
            if user.profile.employee_department
            else None
        )
        token["office_location_id"] = (
            user.profile.office_location.id
            if user.profile.office_location
            else None
        )
 
        return token
    
    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            User = get_user_model()

            if not User.objects.filter(username=username).exists():
                raise serializers.ValidationError(
                    {
                        "username": "Username does not exist"
                    }
                )
            else:
                raise serializers.ValidationError(
                    {
                        "password": "Incorrect Password"
                    }
                )
        if not user.is_active:
            raise serializers.ValidationError(
                {
                    "account": "Account is inactive"
                }
            )
        return super().validate(attrs)

   
class ITSupportProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITSupportProfile
        fields = ['user', 'availability_status', 'expertise', 'current_workload', 'workload_limit', 'department']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role', 'email', 'first_name', 'last_name', 'user_code']
        extra_kwargs = {'password': {'write_only': True}}

    @transaction.atomic
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)

        UserProfile.objects.create(user=user)
        return user
    
class UserRolesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRoles
        fields = ['id', 'name']

class UserListSerializer(serializers.ModelSerializer):
    current_workload = serializers.IntegerField(source='it_support_profile.current_workload', read_only=True)
    expertise = serializers.CharField(source='it_support_profile.expertise', read_only=True)
    availability_status = serializers.CharField(source='it_support_profile.availability_status', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'role', 'current_workload', 'expertise', 'availability_status']

class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['employee_department', 'office_location']

class SpecializationSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()
    class Meta:
        model = Specializations
        fields = ['name', 'created_at_formatted']

    def get_created_at_formatted(self, obj):
        return timezone.localtime(obj.created_at).strftime("%B %d, %Y %I:%M %p")

class ITSupportProfileCreateSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()
    class Meta:
        model = ITSupportProfile
        fields = ['user', 'availability_status', 'current_workload', 'workload_limit', 'it_department', 'created_at_formatted']

    def get_created_at_formatted(self, obj):
        return timezone.localtime(obj.created_at).strftime("%B %d, %Y %I:%M %p")

class ITSupportProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITSupportProfile
        fields = ['it_department']

class ITSupportSpecializationCreateSerializer(serializers.ModelSerializer):
    created_at_formatted = serializers.SerializerMethodField()
    specialization_name = serializers.CharField(
        source='specialization.name',
        read_only=True
    )
    class Meta:
        model = ITSupportSpecialization
        fields = ['it_support_profile', 'specialization', 'specialization_name', 'created_at_formatted']

    def get_created_at_formatted(self, obj):
        return timezone.localtime(obj.created_at).strftime("%B %d, %Y %I:%M %p")