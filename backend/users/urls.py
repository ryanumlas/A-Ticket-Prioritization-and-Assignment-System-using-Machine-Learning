from django.urls import path
from .views import (CreateITSupportProfileView, RegisterView, UserListView, CreateITSupportProfileView, UserUpdateView, UserRoleCreateView, UserRoleDeleteView, 
UserRoleListView, EmployeeOverviewAPIView, UserProfileUpdateView, SpecializationCreateView, ITSupportProfileCreateView, ITSupportSpecializationCreateView)

urlpatterns = [
    path('list/', UserListView.as_view(), name='user-list'),
    path('profile/create/', CreateITSupportProfileView.as_view(), name='create-it-profile'),
    path('update/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
    path('roles/create/', UserRoleCreateView.as_view(), name='user-role-create'),
    path('roles/list/', UserRoleListView.as_view(), name='user-role-list'),
    path('profile/update/<int:pk>/', UserProfileUpdateView.as_view(), name="profile-update"),
    path('employee/list/overview/', EmployeeOverviewAPIView.as_view(), name="overview-list"),
    path('roles/delete/<int:pk>/', UserRoleDeleteView.as_view(), name='user-role-delete'),
    path('specializations/create/', SpecializationCreateView.as_view(), name='specialization-create'),
    path('it-support-profile/create/', ITSupportProfileCreateView.as_view(), name='it-support-profile-create'),
    path('it-support-specializations/create/', ITSupportSpecializationCreateView.as_view(), name='it-support-specialization-create'),
]