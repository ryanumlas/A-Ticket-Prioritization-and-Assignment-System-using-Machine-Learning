from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import viewsets, generics
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketAssistance
from .serializers import SymptomCodeSerializer, TicketSerializer, CategorySerializer, TicketAssistanceSerializer, TicketCommentSerializer, TicketStatusHistory, SLARulesSerializer, SLARulesUpdateSerializer
from users.models import User

# Create your views here.

# --- Ticket Views ---
class CreateTicketView(generics.CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

class ListTicketView(generics.ListAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [AllowAny]

class DetailTicketView(generics.RetrieveAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

class UpdateTicketView(generics.UpdateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

class DeleteTicketView(generics.DestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

# --- Category Views ---
class CreateCategoryView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class UpdateCategoryView(generics.UpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

# --- Symptom Code Views ---
class CreateSymptomCodeView(generics.CreateAPIView):
    queryset = SymptomCode.objects.all()
    serializer_class = SymptomCodeSerializer
    permission_classes = [AllowAny]

# --- SLA Rules Views ---
class SLARulesCreateView(generics.CreateAPIView):
    queryset = SLARules.objects.all()
    serializer_class = SLARulesSerializer
    permission_classes = [AllowAny]

class SLARulesUpdateView(generics.UpdateAPIView):
    queryset = SLARules.objects.all()
    serializer_class = SLARulesUpdateSerializer
    permission_classes = [AllowAny]

# class AddTicketAssigneeView(generics.CreateAPIView):
#     permission_classes = [IsAuthenticated]

#     def post(self, request, ticket_id):
#         try:
#             ticket = Ticket.objects.get(id=ticket_id)
#         except Ticket.DoesNotExist:
#             return Response({'error': 'Ticket not found'}, status=404)

#         user_ids = request.data.get('user_ids', [])

#         added = []
#         for user_id in user_ids:
#             try:
#                 user = User.objects.get(id=user_id)
#                 TicketAssignee.objects.get_or_create(
#                     ticket=ticket,
#                     user=user
#                 )
#                 added.append(user.first_name)
#             except User.DoesNotExist:
#                 pass

#         return Response({
#             'message': f'Added assignees successfully',
#             'added': added
#         })
    
# class UpdateTicketAssigneeView(APIView):
#     permission_classes = [IsAuthenticated]

#     def put(self, request, ticket_id):
#         try:
#             ticket = Ticket.objects.get(id=ticket_id)
#         except Ticket.DoesNotExist:
#             return Response(
#                 {'error': 'Ticket not found'}, 
#                 status=404
#             )

#         user_ids = request.data.get('user_ids', [])

#         TicketAssignee.objects.filter(ticket=ticket).delete()

#         added = []
#         for user_id in user_ids:
#             try:
#                 user = User.objects.get(id=user_id)
#                 TicketAssignee.objects.create(
#                     ticket=ticket,
#                     user=user
#                 )
#                 added.append(f"{user.first_name} {user.last_name}")
#             except User.DoesNotExist:
#                 pass

#         return Response({
#             'message': 'Assignees updated successfully',
#             'assignees': added
#         })