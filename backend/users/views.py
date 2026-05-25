from django.shortcuts import render

from rest_framework import generics
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import User, ITSupportProfile, UserRoles
from .serializers import UserSerializer, ITSupportProfileSerializer, UserListSerializer, UserRolesSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer   
    permission_classes = [AllowAny]

class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
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
