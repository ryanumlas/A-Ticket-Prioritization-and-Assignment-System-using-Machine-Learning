from django.urls import path
from .views import (CreateITSupportProfileView, MyAvailabilityUpdateView, MyProfileView, RegisterView, UserListView, CreateITSupportProfileView, UserUpdateView, UserRoleCreateView, UserRoleDeleteView, 
UserRoleListView, EmployeeOverviewAPIView, UserProfileUpdateView, SpecializationCreateView, ITSupportProfileCreateView, 
ITSupportSpecializationCreateView, ITSupportProfileUpdateView, NotificationListView, NotificationMarkReadView, NotificationUnreadCountView, AdminUserListView, 
ITDepartmentOptionsView, EmployeeDepartmentOptionsView, OfficeLocationOptionsView, 
UserRoleOptionsView, AdminUserCreateView, AdminUserUpdateView,
SpecializationOptionsView, AdminUserDetailView, AdminAuditLogListView,
UserRoleUpdateView)

urlpatterns = [
    path('list/', UserListView.as_view(), name='user-list'),
    path('profile/create/', CreateITSupportProfileView.as_view(), name='create-it-profile'),
    path('update/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('roles/create/', UserRoleCreateView.as_view(), name='user-role-create'),
    path('roles/list/', UserRoleListView.as_view(), name='user-role-list'),
    path('roles/update/<int:pk>/', UserRoleUpdateView.as_view(), name='user-role-update'),
    path('profile/update/<int:pk>/', UserProfileUpdateView.as_view(), name="profile-update"),
    path('employee/list/overview/', EmployeeOverviewAPIView.as_view(), name="overview-list"),
    path('roles/delete/<int:pk>/', UserRoleDeleteView.as_view(), name='user-role-delete'),
    path('specializations/create/', SpecializationCreateView.as_view(), name='specialization-create'),
    path('it-support-profile/create/', ITSupportProfileCreateView.as_view(), name='it-support-profile-create'),
    path('it-support-specializations/create/', ITSupportSpecializationCreateView.as_view(), name='it-support-specialization-create'),
    path('it-support-profile/update/<int:pk>/', ITSupportProfileUpdateView.as_view(), name='it-support-profile-update'),

    path("admin/create/",AdminUserCreateView.as_view(),name="admin-user-create",),
    path("admin/list/",AdminUserListView.as_view(),name="admin-user-list",),
    path("admin/<int:user_id>/update/", AdminUserUpdateView.as_view(), name="admin-user-update",),
    path("admin/<int:user_id>/", AdminUserDetailView.as_view(),name="admin-user-detail",),
    path("admin/create-options/employee-departments/",EmployeeDepartmentOptionsView.as_view(),name="employee-department-options",),
    path("admin/create-options/specializations/",SpecializationOptionsView.as_view(),name="specialization-options",),
    path("admin/create-options/it-departments/",ITDepartmentOptionsView.as_view(),name="it-department-options",),
    path("admin/create-options/office-locations/",OfficeLocationOptionsView.as_view(),name="office-location-options",),

    path("admin/create-options/roles/", UserRoleOptionsView.as_view(), name="user-role-options",),

    path("audit-logs/admin/list/",AdminAuditLogListView.as_view(),name="admin-audit-log-list",),

    # --- Notifications ---
    path("notifications/list/",NotificationListView.as_view(), name="notification-list",),
    path("notifications/unread-count/",NotificationUnreadCountView.as_view(), name="notification-unread-count",),
    path("notifications/<int:pk>/read/",NotificationMarkReadView.as_view(), name="notification-mark-read",),

    path(
        "profile/",
        MyProfileView.as_view(),
        name="my-profile",
    ),

    path(
    "profile/availability/",
        MyAvailabilityUpdateView.as_view(),
        name="my-profile-availability",
    ),
]   