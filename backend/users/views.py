from django.shortcuts import render

from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import User, ITSupportProfile, UserRoles, UserProfile
from tickets.models import Ticket
from .serializers import UserSerializer, ITSupportProfileSerializer, UserListSerializer, UserRolesSerializer, CustomTokenObtainPairSerializer, UserProfileUpdateSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] 

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
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer   
    permission_classes = [AllowAny]

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
