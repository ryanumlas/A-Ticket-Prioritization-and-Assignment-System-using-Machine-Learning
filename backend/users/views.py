from django.shortcuts import render
from django.db.models import Q
from rest_framework import generics
from .pagination import UserPagination
from rest_framework.views import APIView
from rest_framework import viewsets, generics, status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Specializations, User, ITSupportProfile, UserRoles, UserProfile, ITSupportSpecialization, Notifications, AuditLogs
from tickets.models import Ticket
from departments.models import OfficeLocation, EmployeeDepartment, ITDepartment
from .serializers import (UserSerializer, ITSupportSpecializationCreateSerializer, ITSupportProfileSerializer,
                          ITSupportProfileCreateSerializer, UserListSerializer, UserRolesSerializer, CustomTokenObtainPairSerializer, 
                          UserProfileUpdateSerializer, SpecializationSerializer, ITSupportProfileUpdateSerializer, NotificationSerializer, AdminUserListSerializer,
                              EmployeeDepartmentOptionSerializer,
    ITDepartmentOptionSerializer, UserRolesUpdateSerializer,
    OfficeLocationOptionSerializer, UserRoleOptionSerializer, AdminUserCreateSerializer,
    AdminUserUpdateSerializer, SpecializationOptionSerializer,
    AdminUserDetailSerializer, AuditLogSerializer)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 

class UserRoleUpdateView(generics.UpdateAPIView):
    queryset = UserRoles.objects.all()
    serializer_class = UserRolesUpdateSerializer
    permission_classes = [AllowAny]

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = (
            User.objects
            .select_related(
                "role",
                "profile",
                "profile__employee_department",
                "profile__office_location",
                "it_support_profile",
                "it_support_profile__it_department",
            )
            .prefetch_related(
                "it_support_profile__specializations__specialization",
            )
            .order_by("-created_at")
        )

        search = request.query_params.get(
            "search",
            "",
        ).strip()

        role = request.query_params.get(
            "role",
            "",
        ).strip()

        status = request.query_params.get(
            "status",
            "",
        ).strip()

        if search:
            users = users.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(user_code__icontains=search)
                | Q(email__icontains=search)
            )

        if role:
            users = users.filter(
                role__name=role
            )

        if status == "active":
            users = users.filter(
                is_active=True
            )

        elif status == "inactive":
            users = users.filter(
                is_active=False
            )

        paginator = UserPagination()

        page = paginator.paginate_queryset(
            users,
            request,
            view=self,
        )

        serializer = AdminUserListSerializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )


class AdminUserCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = AdminUserCreateSerializer(
            data=request.data,
            context={
                "request": request,
            },
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message": "User created successfully.",
                "user_id": user.id,
                "user_code": user.user_code,
            },
            status=201,
        )


class EmployeeOverviewAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        tickets = Ticket.objects.filter(submitted_by=user)

        data = {
            "open": tickets.filter(status=Ticket.TicketStatus.OPEN).count(),
            "in_progress": tickets.filter(status="IN_PROGRESS").count(),
            "resolved": tickets.filter(status=Ticket.TicketStatus.RESOLVED).count(),
            "under_review": tickets.filter(status="UNDER_REVIEW").count()
        }

        return Response(data)
class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {"error": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            AuditLogs.objects.create(
                user=request.user,
                module="Authentication",
                action="LOGOUT",
                reference_id=str(request.user.id),
                remarks="User logged out successfully.",
                created_by=request.user,
            )

            return Response(
                {
                    "success": True,
                    "message": "Logged out successfully.",
                },
                status=status.HTTP_200_OK,
            )

        except TokenError:
            return Response(
                {"error": "Invalid or expired refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminAuditLogListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if (
            not request.user.role
            or request.user.role.name != "System Administrator"
        ):
            return Response(
                {
                    "detail": "You do not have permission to view audit logs."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        logs = (
            AuditLogs.objects
            .select_related("user", "created_by")
            .order_by("-created_at")
        )

        action = request.query_params.get("action", "").strip()

        if action:
            logs = logs.filter(action=action)

        search = request.query_params.get("search", "").strip()

        if search:
            logs = logs.filter(
                Q(user__username__icontains=search)
                | Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(module__icontains=search)
                | Q(action__icontains=search)
                | Q(reference_id__icontains=search)
                | Q(remarks__icontains=search)
            )

        page_size = request.query_params.get(
            "page_size",
            15,
        )

        try:
            page_size = int(page_size)
        except (TypeError, ValueError):
            page_size = 15

        page_size = max(1, min(page_size, 100))

        page = request.query_params.get("page", 1)

        try:
            page = int(page)
        except (TypeError, ValueError):
            page = 1

        page = max(page, 1)

        total_count = logs.count()

        start = (page - 1) * page_size
        end = start + page_size

        results = logs[start:end]

        serializer = AuditLogSerializer(
            results,
            many=True,
        )

        return Response(
            {
                "count": total_count,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer   
    permission_classes = [AllowAny]

class ITSupportProfileUpdateView(generics.UpdateAPIView):
    queryset = ITSupportProfile.objects.all()
    serializer_class = ITSupportProfileUpdateSerializer
    permission_classes = [IsAuthenticated]
class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserProfileUpdateView(generics.UpdateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [AllowAny]

class CreateITSupportProfileView(generics.CreateAPIView):
    serializer_class = ITSupportProfileSerializer
    permission_classes = [AllowAny]

class UserRoleCreateView(generics.CreateAPIView):
    queryset = UserRoles.objects.all()
    serializer_class = UserRolesSerializer
    permission_classes = [AllowAny]

class UserRoleListView(generics.ListAPIView):
    queryset = UserRoles.objects.all()
    serializer_class = UserRolesSerializer
    permission_classes = [AllowAny]

class UserRoleDeleteView(generics.DestroyAPIView):
    queryset = UserRoles.objects.all()
    serializer_class = UserRolesSerializer
    permission_classes = [AllowAny]


class SpecializationCreateView(generics.CreateAPIView):
    queryset = Specializations.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [AllowAny]


class SpecializationUpdateView(generics.UpdateAPIView):
    queryset = Specializations.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [AllowAny]


class ITSupportProfileCreateView(generics.CreateAPIView):
    queryset = ITSupportProfile.objects.all()
    serializer_class = ITSupportProfileCreateSerializer
    permission_classes = [AllowAny]


class ITSupportSpecializationCreateView(generics.CreateAPIView):
    queryset = ITSupportSpecialization.objects.all()
    serializer_class = ITSupportSpecializationCreateSerializer
    permission_classes = [AllowAny]

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        notifications = (
            Notifications.objects
            .filter(user=request.user)
            .select_related("ticket")
            .order_by("-created_at")
        )

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notifications.objects.filter(
            user=request.user,
            is_read=False
        ).count()

        return Response(
            {"count": count},
            status=status.HTTP_200_OK
        )

class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        notification = (
            Notifications.objects
            .filter(
                pk=pk,
                user=request.user
            )
            .first()
        )

        if not notification:
            return Response(
                {"error": "Notification not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.updated_by = request.user
        notification.save(
            update_fields=[
                "is_read",
                "updated_by",
                "updated_at",
            ]
        )

        return Response(
            {"success": True},
            status=status.HTTP_200_OK
        )

class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = (
            User.objects
            .select_related(
                "role",
                "profile",
                "profile__employee_department",
                "profile__office_location",
                "it_support_profile",
                "it_support_profile__it_department",
            )
            .prefetch_related(
                "it_support_profile__specializations__specialization",
            )
            .order_by("-created_at")
        )

        search = request.query_params.get("search", "").strip()
        role = request.query_params.get("role", "").strip()
        status = request.query_params.get("status", "").strip()

        if search:
            users = users.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(user_code__icontains=search)
                | Q(email__icontains=search)
            )

        if role:
            users = users.filter(
                role__name=role
            )

        if status == "active":
            users = users.filter(
                is_active=True
            )
        elif status == "inactive":
            users = users.filter(
                is_active=False
            )

        paginator = UserPagination()

        page = paginator.paginate_queryset(
            users,
            request,
            view=self,
        )

        serializer = AdminUserListSerializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if (
            not request.user.role
            or request.user.role.name != "System Administrator"
        ):
            return Response(
                {"detail": "You do not have permission to view user details."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_object_or_404(
            User.objects.select_related(
                "role",
                "profile",
                "profile__employee_department",
                "profile__office_location",
                "it_support_profile",
                "it_support_profile__it_department",
                "it_service_desk_profile",
                "it_service_desk_profile__it_department",
                "it_service_desk_profile__office_location",
                "it_supervisor_profile",
                "it_supervisor_profile__it_department",
                "it_supervisor_profile__office_location",
                "system_administrator_profile",
                "system_administrator_profile__it_department",
                "system_administrator_profile__office_location",
            ).prefetch_related(
                "it_support_profile__specializations__specialization",
            ),
            id=user_id,
        )

        serializer = AdminUserDetailSerializer(user)

        return Response(serializer.data)


class AdminUserUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, user_id):
        if (
            not request.user.role
            or request.user.role.name != "System Administrator"
        ):
            return Response(
                {"detail": "You do not have permission to update users."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = get_object_or_404(User, id=user_id)
        serializer = AdminUserUpdateSerializer(
            user,
            data=request.data,
            partial=True,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({"message": "User updated successfully."})

class EmployeeDepartmentOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departments = EmployeeDepartment.objects.all()

        serializer = EmployeeDepartmentOptionSerializer(
            departments,
            many=True,
        )

        return Response(serializer.data)


class ITDepartmentOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departments = ITDepartment.objects.all()

        serializer = ITDepartmentOptionSerializer(
            departments,
            many=True,
        )

        return Response(serializer.data)


class OfficeLocationOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        locations = OfficeLocation.objects.all()

        serializer = OfficeLocationOptionSerializer(
            locations,
            many=True,
        )

        return Response(serializer.data)

class UserRoleOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        roles = UserRoles.objects.order_by("name")

        serializer = UserRoleOptionSerializer(
            roles,
            many=True,
        )

        return Response(serializer.data)

class SpecializationOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        specializations = Specializations.objects.order_by("name")

        serializer = SpecializationOptionSerializer(
            specializations,
            many=True,
        )

        return Response(serializer.data)