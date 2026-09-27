from django.utils import timezone
from rest_framework import serializers
import re
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from .models import ITSupportSpecialization, User, ITSupportProfile, UserRoles, UserProfile, Specializations, Notifications, AuditLogs,ITServiceDeskProfile, ITSupervisorProfile, SystemAdministratorProfile
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

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        AuditLogs.objects.create(
            user=user,
            module="Authentication",
            action="LOGIN",
            reference_id=str(user.id),
            remarks="User logged in successfully.",
            created_by=user,
        )

        return super().validate(attrs)

class UserRolesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRoles
        fields = ["id", "name"]
class AuditLogSerializer(serializers.ModelSerializer):
    user_code = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = AuditLogs
        fields = [
            "id",
            "user_code",
            "first_name",
            "last_name",
            "email",
            "role",
            "department",
            "module",
            "action",
            "reference_id",
            "remarks",
            "created_at",
        ]

    def get_user_code(self, obj):
        if not obj.user:
            return None

        return obj.user.user_code

    def get_first_name(self, obj):
        if not obj.user:
            return None

        return obj.user.first_name

    def get_last_name(self, obj):
        if not obj.user:
            return None

        return obj.user.last_name

    def get_email(self, obj):
        if not obj.user:
            return None

        return obj.user.email

    def get_role(self, obj):
        if not obj.user or not obj.user.role:
            return None

        return obj.user.role.name

    def get_department(self, obj):
        user = obj.user

        if not user:
            return None

        role_name = user.role.name if user.role else None

        profile_map = {
            "IT Support Specialist": "it_support_profile",
            "IT Service Desk": "it_service_desk_profile",
            "IT Supervisor": "it_supervisor_profile",
            "System Administrator": "system_administrator_profile",
        }

        profile_relation = profile_map.get(role_name)

        if not profile_relation:
            return None

        profile = getattr(user, profile_relation, None)

        if profile and profile.it_department:
            return profile.it_department.name

        return None
   
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
    ticket_id = serializers.IntegerField(
        source="ticket.id",
        read_only=True,
    )
    ticket_code = serializers.CharField(
        source="ticket.ticket_code",
        read_only=True,
    )
    notification_type_display = serializers.CharField(
        source="get_notification_type_display",
        read_only=True,
    )

    class Meta:
        model = Notifications
        fields = [
            "id",
            "ticket_id",
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

def get_user_code_prefix(role_name):
    prefixes = {
        "Employee": "EMP",
        "IT Support Specialist": "ITSP",
        "IT Service Desk": "ITSD",
        "IT Supervisor": "ITSV",
        "System Administrator": "SYSAD",
    }

    return prefixes.get(role_name, "USR")


class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
    )

    email = serializers.EmailField(
        required=False,
        allow_blank=True,
        allow_null=True,
    )

    employee_department = serializers.PrimaryKeyRelatedField(
        queryset=EmployeeDepartment.objects.all(),
        required=False,
        allow_null=True,
    )

    it_department = serializers.PrimaryKeyRelatedField(
        queryset=ITDepartment.objects.all(),
        required=False,
        allow_null=True,
    )

    office_location = serializers.PrimaryKeyRelatedField(
        queryset=OfficeLocation.objects.all(),
        required=False,
        allow_null=True,
    )

    specializations = serializers.PrimaryKeyRelatedField(
        queryset=Specializations.objects.all(),
        many=True,
        required=False,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "role",
            "employee_department",
            "it_department",
            "office_location",
            "specializations",
        ]

    def validate_username(self, value):
        value = value.strip()

        if len(value) < 3:
            raise serializers.ValidationError(
                "Username must be at least 3 characters long."
            )

        if len(value) > 150:
            raise serializers.ValidationError(
                "Username must not exceed 150 characters."
            )

        if not re.fullmatch(
            r"[A-Za-z0-9_]+",
            value,
        ):
            raise serializers.ValidationError(
                "Username can only contain letters, numbers, and underscores."
            )

        if User.objects.filter(
            username__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_first_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "First name must be at least 2 characters long."
            )

        if len(value) > 150:
            raise serializers.ValidationError(
                "First name must not exceed 150 characters."
            )

        if not re.fullmatch(
            r"[A-Za-zÀ-ÖØ-öø-ÿ' -]+",
            value,
        ):
            raise serializers.ValidationError(
                "First name can only contain letters, spaces, hyphens, and apostrophes."
            )

        if not any(
            char.isalpha()
            for char in value
        ):
            raise serializers.ValidationError(
                "First name must contain at least one letter."
            )

        return value

    def validate_last_name(self, value):
        value = value.strip()

        if len(value) < 2:
            raise serializers.ValidationError(
                "Last name must be at least 2 characters long."
            )

        if len(value) > 150:
            raise serializers.ValidationError(
                "Last name must not exceed 150 characters."
            )

        if not re.fullmatch(
            r"[A-Za-zÀ-ÖØ-öø-ÿ' -]+",
            value,
        ):
            raise serializers.ValidationError(
                "Last name can only contain letters, spaces, hyphens, and apostrophes."
            )

        if not any(
            char.isalpha()
            for char in value
        ):
            raise serializers.ValidationError(
                "Last name must contain at least one letter."
            )

        return value

    def validate_email(self, value):
        if value is None:
            return value

        value = value.strip()

        if not value:
            return ""

        if User.objects.filter(
            email__iexact=value
        ).exists():
            raise serializers.ValidationError(
                "Email address is already in use."
            )

        return value

    def validate_role(self, value):
        if not value:
            raise serializers.ValidationError(
                "Role is required."
            )

        return value

    def validate(self, attrs):
        role = attrs.get("role")

        if not role:
            raise serializers.ValidationError({
                "role": "Role is required."
            })

        role_name = role.name

        employee_department = attrs.get(
            "employee_department"
        )

        it_department = attrs.get(
            "it_department"
        )

        office_location = attrs.get(
            "office_location"
        )

        specializations = attrs.get(
            "specializations",
            []
        )

        if role_name == "Employee":
            if not employee_department:
                raise serializers.ValidationError({
                    "employee_department":
                        "Employee department is required."
                })
        else:
            if not it_department:
                raise serializers.ValidationError({
                    "it_department":
                        "IT department is required."
                })

        if not office_location:
            raise serializers.ValidationError({
                "office_location":
                    "Office location is required."
            })

        if role_name != "IT Support Specialist":
            if specializations:
                raise serializers.ValidationError({
                    "specializations":
                        "Specializations are only available for IT Support Specialist."
                })

        return attrs

    def generate_user_code(self, role, user_id):
        role_prefixes = {
            "Employee": "EMP",
            "IT Support Specialist": "ITSP",
            "IT Service Desk": "ITSD",
            "IT Supervisor": "ITSV",
            "System Administrator": "SYSAD",
        }

        prefix = role_prefixes.get(
            role.name,
            "USR",
        )

        return f"{prefix}-{user_id:04d}"

    @transaction.atomic
    def create(self, validated_data):
        specializations = validated_data.pop(
            "specializations",
            [],
        )

        employee_department = validated_data.pop(
            "employee_department",
            None,
        )

        it_department = validated_data.pop(
            "it_department",
            None,
        )

        office_location = validated_data.pop(
            "office_location",
            None,
        )

        password = validated_data.pop(
            "password",
        )

        request = self.context.get(
            "request"
        )

        current_user = (
            request.user
            if request
            and request.user.is_authenticated
            else None
        )

        role = validated_data.get(
            "role"
        )

        user = User(
            **validated_data,
        )

        user.set_password(password)
        user.save()

        user.user_code = self.generate_user_code(
            role,
            user.id,
        )

        user.save(
            update_fields=["user_code"]
        )

        UserProfile.objects.create(
            user=user,
            employee_department=employee_department,
            office_location=office_location,
        )

        role_name = (
            user.role.name
            if user.role
            else None
        )

        if role_name == "IT Support Specialist":
            it_support_profile = (
                ITSupportProfile.objects.create(
                    user=user,
                    it_department=it_department,
                    availability_status=(
                        ITSupportProfile
                        .AvailabilityStatus
                        .available
                    ),
                    created_by=current_user,
                    updated_by=current_user,
                )
            )

            ITSupportSpecialization.objects.bulk_create(
                [
                    ITSupportSpecialization(
                        it_support_profile=it_support_profile,
                        specialization=specialization,
                        created_by=current_user,
                        updated_by=current_user,
                    )
                    for specialization in specializations
                ]
            )

        elif role_name == "IT Service Desk":
            ITServiceDeskProfile.objects.create(
                user=user,
                it_department=it_department,
                office_location=office_location,
            )

        elif role_name == "IT Supervisor":
            ITSupervisorProfile.objects.create(
                user=user,
                it_department=it_department,
                office_location=office_location,
            )

        elif role_name == "System Administrator":
            SystemAdministratorProfile.objects.create(
                user=user,
                it_department=it_department,
                office_location=office_location,
            )

        return user
class UserRoleOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRoles
        fields = [
            "id",
            "name",
        ]

class SpecializationOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specializations
        fields = ["id", "name"]

class AdminUserDetailSerializer(serializers.ModelSerializer):
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
            "updated_at",
        ]

    def get_full_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()
        return full_name or obj.username

    def get_employee_department(self, obj):
        profile = getattr(obj, "profile", None)

        if not profile or not profile.employee_department:
            return None

        return {
            "id": profile.employee_department.id,
            "name": profile.employee_department.name,
        }

    def get_office_location(self, obj):
        profile = getattr(obj, "profile", None)

        if not profile or not profile.office_location:
            return None

        return {
            "id": profile.office_location.id,
            "name": profile.office_location.name,
        }

    def get_it_department(self, obj):
        profile = getattr(
            obj,
            "it_support_profile",
            None,
        )

        if profile and profile.it_department:
            return {
                "id": profile.it_department.id,
                "name": profile.it_department.name,
            }

        service_desk_profile = getattr(
            obj,
            "it_service_desk_profile",
            None,
        )

        if (
            service_desk_profile
            and service_desk_profile.it_department
        ):
            return {
                "id": service_desk_profile.it_department.id,
                "name": service_desk_profile.it_department.name,
            }

        supervisor_profile = getattr(
            obj,
            "it_supervisor_profile",
            None,
        )

        if (
            supervisor_profile
            and supervisor_profile.it_department
        ):
            return {
                "id": supervisor_profile.it_department.id,
                "name": supervisor_profile.it_department.name,
            }

        system_admin_profile = getattr(
            obj,
            "system_administrator_profile",
            None,
        )

        if (
            system_admin_profile
            and system_admin_profile.it_department
        ):
            return {
                "id": system_admin_profile.it_department.id,
                "name": system_admin_profile.it_department.name,
            }

        return None

    def get_it_department_id(self, obj):
        it_department = self.get_it_department(obj)

        if not it_department:
            return None

        return it_department["id"]

    def get_current_workload(self, obj):
        profile = getattr(
            obj,
            "it_support_profile",
            None,
        )

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
        profile = getattr(
            obj,
            "it_support_profile",
            None,
        )

        if not profile:
            return None

        return profile.workload_limit

    def get_availability_status(self, obj):
        profile = getattr(
            obj,
            "it_support_profile",
            None,
        )

        if not profile:
            return None

        return profile.availability_status

    def get_specializations(self, obj):
        profile = getattr(
            obj,
            "it_support_profile",
            None,
        )

        if not profile:
            return []

        return [
            {
                "id": item.specialization.id,
                "name": item.specialization.name,
            }
            for item in profile.specializations.select_related(
                "specialization"
            )
        ]

