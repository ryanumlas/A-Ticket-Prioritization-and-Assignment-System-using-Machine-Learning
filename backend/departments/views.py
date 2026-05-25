from django.shortcuts import render
from rest_framework import generics
from .models import Department
from .serializers import DepartmentSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

# Create your views here.
class DepartmentCreateView(generics.CreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

class DepartmentListView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]

class UpdateDepartmentView(generics.UpdateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]