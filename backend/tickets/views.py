from time import timezone
from django.shortcuts import render
from django.db import transaction
from rest_framework.response import Response
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketAssistance, Keyword
from .serializers import (SymptomCodeSerializer, TicketSerializer, CategorySerializer, 
TicketAssistanceSerializer, TicketCommentSerializer, TicketStatusHistory, SLARulesSerializer, 
SLARulesUpdateSerializer, KeywordSerializer, KeywordUpdateSerializer, UpdateSymptomCodeSerializer, CreateSymptomCodeSerializer,
TicketCreateSerializer)
from users.models import User
from ai.models import TicketAnalysis, TicketAIAnalysis
from ai.services import analyze_ticket
from tickets.services import classify_ticket, calculate_priority

# Create your views here.

# --- Ticket Views ---
class CreateTicketView(generics.CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketCreateSerializer
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def perform_create(self, serializer):
        ticket = serializer.save(submitted_by=self.request.user)

        analysis = analyze_ticket(ticket)

        if analysis["is_unclear"]:
            ReviewFlags.objects.create(
                ticket=ticket,
                reason=ReviewFlags.Reasons.UNCLEAR_DESCRIPTION,
                status=ReviewFlags.Status.PENDING,
                source_type=ReviewFlags.SourceType.SYSTEM_GENERATED
            )
            ticket.is_under_review = True
            ticket.save()
            return

        result = classify_ticket(ticket)

        symptom = SymptomCode.objects.filter(code=result.get("symptom_code")).first()

        category = symptom.category if symptom else None

        department = category.it_department if category else None

        if not symptom:
            ReviewFlags.objects.create(
                ticket=ticket,
                reason=ReviewFlags.Reasons.SYMPTOM_NOT_DETECTED,
                status=ReviewFlags.Status.PENDING,
                source_type=ReviewFlags.SourceType.SYSTEM_GENERATED
            )
            ticket.is_under_review = True
            ticket.save()
            return
        
        if not department:
            ReviewFlags.objects.create(
                ticket=ticket,
                reason=ReviewFlags.Reasons.MISSING_DEPARTMENT,
                status=ReviewFlags.Status.PENDING,
                source_type=ReviewFlags.SourceType.SYSTEM_GENERATED
            )
            ticket.is_under_review=True
            ticket.save()
            return
        
        ticket.symptom_code = symptom
        ticket.category = category
        ticket.it_department = department
        
        
        final_priority = calculate_priority(
            symptom.based_priority, 
            ticket.affected_scope,
            analysis["business_critical"]
        )   

        sla_rule = SLARules.objects.filter(
            priority_level = final_priority
        ).first()

        if sla_rule:
            ticket.priority = sla_rule

        ticket.save()

class UpdateTicketStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        ticket = Ticket.objects.get(pk=pk)

        new_status = request.data.get('status')

        if new_status == Ticket.TicketStatus.OPEN:
            ticket.status = Ticket.TicketStatus.OPEN
        
        elif new_status == Ticket.TicketStatus.IN_PROGRESS:
            ticket.status = Ticket.TicketStatus.IN_PROGRESS
        
        elif new_status == Ticket.TicketStatus.RESOLVED:
            ticket.status = Ticket.TicketStatus.RESOLVED
            ticket.resolved_at = timezone.now()
            ticket.resolved_by = request.user
        
        elif new_status == Ticket.TicketStatus.CLOSED:
            ticket.status = Ticket.TicketStatus.CLOSED

        elif new_status == Ticket.TicketStatus.REOPENED:
            ticket.status = Ticket.TicketStatus.REOPENED
            ticket.resolved_at = None
            ticket.resolved_by = None
        
        elif new_status == Ticket.TicketStatus.PENDING:
            ticket.status = Ticket.TicketStatus.PENDING

        elif new_status == Ticket.TicketStatus.CANCELLED:
            ticket.status = Ticket.TicketStatus.CANCELLED

        else:
            return Response({"error": "Invalid status"}, status=status.HTTP_400_BAD_REQUEST)
        
        ticket.save()

        return Response({"message": f"Ticket status updated to {ticket.status}"}, status=status.HTTP_200_OK)
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

class TicketListEmployeeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        tickets = Ticket.objects.filter(submitted_by=user)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
# --- End ---

# --- Category Views ---
class CreateCategoryView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class UpdateCategoryView(generics.UpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]
# --- End ---

# --- Symptom Code Views ---
class CreateSymptomCodeView(generics.CreateAPIView):
    queryset = SymptomCode.objects.all()
    serializer_class = CreateSymptomCodeSerializer
    permission_classes = [AllowAny]

class UpdateSymptomCodeView(generics.UpdateAPIView):
    queryset = SymptomCode.objects.all()
    serializer_class = UpdateSymptomCodeSerializer
    permission_classes = [AllowAny]
# --- End ---

# --- SLA Rules Views ---
class SLARulesCreateView(generics.CreateAPIView):
    queryset = SLARules.objects.all()
    serializer_class = SLARulesSerializer
    permission_classes = [AllowAny]

class SLARulesUpdateView(generics.UpdateAPIView):
    queryset = SLARules.objects.all()
    serializer_class = SLARulesUpdateSerializer
    permission_classes = [AllowAny]
# --- End ---

# --- Keyword Views ---
class KeywordCreateView(generics.CreateAPIView):
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer
    permission_classes = [AllowAny]

class KeywordUpdateView(generics.UpdateAPIView):
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer
    permission_classes = [AllowAny]

# --- End ---

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