from django.utils import timezone
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.db import transaction
from .models import ITSupportSpecialization, User, ITSupportProfile, UserRoles, UserProfile, Specializations, Notifications
from departments.models import ITDepartment, OfficeLocation, EmployeeDepartment

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
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'role', 'expertise', 'availability_status', 'last_assigned_at']

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
        fields = ['user', 'availability_status', 'workload_limit', 'it_department', 'created_at_formatted']

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


class NotificationSerializer(serializers.ModelSerializer):
    ticket_code = serializers.CharField(source="ticket.ticket_code",read_only=True)
    notification_type_display = serializers.CharField(source="get_notification_type_display",read_only=True)

    class Meta:
        model = Notifications
        fields = [
            "id",
            "ticket",
            "ticket_code",
            "message",
            "notification_type",
            "notification_type_display",
            "is_read",
            "created_at",
        ]

class AdminUserListSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role_name = serializers.CharField(
        source="role.name",
        read_only=True,
    )

    employee_department = serializers.SerializerMethodField()
    office_location = serializers.SerializerMethodField()

    it_department = serializers.SerializerMethodField()
    it_department_id = serializers.SerializerMethodField()

    current_workload = serializers.SerializerMethodField()
    workload_limit = serializers.SerializerMethodField()
    availability_status = serializers.SerializerMethodField()
    specializations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "user_code",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "email",
            "role_name",
            "is_active",
            "employee_department",
            "office_location",
            "it_department",
            "it_department_id",
            "current_workload",
            "workload_limit",
            "availability_status",
            "specializations",
            "created_at",
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()

        return full_name or obj.username

    def get_employee_department(self, obj):
        profile = getattr(obj, "profile", None)

        if not profile or not profile.employee_department:
            return None

        return profile.employee_department.name

    def get_office_location(self, obj):
        profile = getattr(obj, "profile", None)

        if not profile or not profile.office_location:
            return None

        return profile.office_location.name


    def get_it_department(self, obj):
        profile = getattr(obj, "it_support_profile", None)

        if not profile or not profile.it_department_id:
            return None

        return profile.it_department.name

    def get_it_department_id(self, obj):
        profile = getattr(obj, "it_support_profile", None)

        if not profile:
            return None

        return profile.it_department_id

    def get_current_workload(self, obj):
        profile = getattr(obj, "it_support_profile", None)

        if not profile:
            return None

        from tickets.models import Ticket

        return Ticket.objects.filter(
            assigned_to=obj,
            status__in=[
                Ticket.TicketStatus.IN_PROGRESS,
                Ticket.TicketStatus.REOPENED,
            ],
        ).count()

    def get_workload_limit(self, obj):
        profile = getattr(obj, "it_support_profile", None)

        if not profile:
            return None

        return profile.workload_limit

    def get_availability_status(self, obj):
        profile = getattr(obj, "it_support_profile", None)

        if not profile:
            return None

        return profile.availability_status

    def get_specializations(self, obj):
        profile = getattr(obj, "it_support_profile", None)

        if not profile:
            return []

        return list(
            profile.specializations
            .select_related("specialization")
            .values_list(
                "specialization__name",
                flat=True,
            )
        )

class EmployeeDepartmentOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDepartment
        fields = [
            "id",
            "name",
        ]


class ITDepartmentOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITDepartment
        fields = [
            "id",
            "name",
        ]


class OfficeLocationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfficeLocation
        fields = [
            "id",
            "name",
        ]