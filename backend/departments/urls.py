from django.urls import path
from .views import DepartmentCreateView, UpdateDepartmentView, DepartmentListView

urlpatterns = [
    path('create/', DepartmentCreateView.as_view(), name='department-create'),
    path('update/<int:pk>/', UpdateDepartmentView.as_view(), name='department-update'),
    path('list/', DepartmentListView.as_view(), name='department-list'),
]