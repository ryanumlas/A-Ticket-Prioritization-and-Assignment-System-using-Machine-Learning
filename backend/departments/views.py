from django.shortcuts import render
from rest_framework import generics
from .models import ITDepartment, EmployeeDepartment, OfficeLocation
from .serializers import ITDepartmentSerializer, EmployeeDepartmentSerializer, OfficeLocationSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

# Create your views here.
class ITDepartmentCreateView(generics.CreateAPIView):
    queryset = ITDepartment.objects.all()
    serializer_class = ITDepartmentSerializer
    permission_classes = [AllowAny]

class ITDepartmentListView(generics.ListAPIView):
    queryset = ITDepartment.objects.all()
    serializer_class = ITDepartmentSerializer
    permission_classes = [AllowAny]

class ITDepartmentUpdateView(generics.UpdateAPIView):
    queryset = ITDepartment.objects.all()
    serializer_class = ITDepartmentSerializer
    permission_classes = [IsAuthenticated]

class EmployeeDepartmentCreateView(generics.CreateAPIView):
    queryset = EmployeeDepartment.objects.all()
    serializer_class = EmployeeDepartmentSerializer
    permission_classes = [AllowAny]

class OfficeLocationCreateView(generics.CreateAPIView):
    queryset = OfficeLocation.objects.all()
    serializer_class = OfficeLocationSerializer
    permission_classes = [AllowAny]