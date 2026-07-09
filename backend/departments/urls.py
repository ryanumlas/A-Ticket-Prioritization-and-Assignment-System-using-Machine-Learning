from django.urls import path
from .views import ITDepartmentCreateView, ITDepartmentListView, ITDepartmentUpdateView, EmployeeDepartmentCreateView, OfficeLocationCreateView

urlpatterns = [
    path('create/', ITDepartmentCreateView.as_view(), name='it-department-create'),
    path('update/<int:pk>/', ITDepartmentUpdateView.as_view(), name='it-department-update'),
    path('list/', ITDepartmentListView.as_view(), name='it-department-list'),
    path('employee/create/', EmployeeDepartmentCreateView.as_view(), name='employee-department-create'),
    path('office/create/', OfficeLocationCreateView.as_view(), name='office-location-create')
]