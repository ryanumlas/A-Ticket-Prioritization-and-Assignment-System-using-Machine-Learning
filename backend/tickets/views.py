from django.utils import timezone
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
TicketCreateSerializer, TicketUpdateSerializer, TicketDetailEmployeeSerializer, CategoryUpdateSerializer, FlaggedTicketsListSerializer, FlaggedTicketDetailSerializer)
from users.models import User
from .services import predict_ticket
from ai.models import TicketAnalysis, TicketAIAnalysis
from ai.services import analyze_ticket
from tickets.services import classify_ticket, calculate_priority, update_sla

# Create your views here.

# --- Ticket Views ---
class CreateTicketView(generics.CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        super().create(request, *args, **kwargs)

        return Response(
            {
                "success": True,
                "message": "Ticket submitted successfully!"
            },
            status=status.HTTP_201_CREATED
        )

    @transaction.atomic
    def perform_create(self, serializer):

        profile = self.request.user.profile

        ticket = serializer.save(
            submitted_by=self.request.user,
            employee_department=profile.employee_department,
            office_location=profile.office_location
        )

        analysis = analyze_ticket(ticket)

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": analysis.get("cleaned_text", ""),
                "summary": analysis.get("summary", ""),
                "keywords": analysis.get("keywords", []),
                "model_version": "gemini-2.5-flash",
                "business_critical": analysis.get(
                    "business_critical",
                    False
                ),
                "is_unclear": analysis.get(
                    "is_unclear",
                    False
                ),
            }
        )


        if analysis.get("is_unclear", False):

            ReviewFlags.objects.create(
                ticket=ticket,
                reason=ReviewFlags.Reasons.UNCLEAR_DESCRIPTION,
                status=ReviewFlags.Status.PENDING,
                source_type=ReviewFlags.SourceType.SYSTEM_GENERATED
            )

            ticket.is_under_review = True
            ticket.status = Ticket.TicketStatus.UNDER_REVIEW
            ticket.save()

            return

        used_ml = False

        result = classify_ticket(ticket)

        print(result)

        symptom = SymptomCode.objects.filter(
            code=result.get("symptom_code")
        ).first()

        if not symptom:
            used_ml = True

            ml_result = predict_ticket(ticket)

            symptom = SymptomCode.objects.filter(
                code=ml_result["predicted_code"]
            ).first()

            if not symptom:
                ReviewFlags.objects.create(
                    ticket=ticket,
                    reason=ReviewFlags.Reasons.SYMPTOM_NOT_DETECTED,
                    status=ReviewFlags.Status.PENDING,
                    source_type=ReviewFlags.SourceType.SYSTEM_GENERATED,
                )

                ticket.is_under_review = True
                ticket.status = Ticket.TicketStatus.UNDER_REVIEW

                ticket.save(
                    update_fields=[
                        "is_under_review",
                        "status",
                    ]
                )

                return

            if ml_result["requires_review"]:
                ticket.is_under_review = True
                ticket.status = Ticket.TicketStatus.UNDER_REVIEW

                ticket.save(
                    update_fields=[
                        "is_under_review",
                        "status",
                    ]
                )

                return

        category = symptom.category if symptom else None
        department = category.it_department if category else None

        if not department:

            ReviewFlags.objects.create(
                ticket=ticket,
                reason=ReviewFlags.Reasons.MISSING_DEPARTMENT,
                status=ReviewFlags.Status.PENDING,
                source_type=ReviewFlags.SourceType.SYSTEM_GENERATED
            )

            ticket.is_under_review = True
            ticket.status = Ticket.TicketStatus.UNDER_REVIEW
            ticket.save()

            return
        
        ticket.symptom_code = symptom
        ticket.category = category
        ticket.it_department = department

        if not used_ml:
            TicketAnalysis.objects.update_or_create(
                ticket=ticket,
                defaults={
                    "model_type": TicketAnalysis.ModelType.RULE_BASED,
                    "model_used": "Rule-Based Classifier",
                    "predicted_symptom_code": symptom,
                    "created_by": self.request.user,
                }
            )

        final_priority = calculate_priority(
            symptom.based_priority,
            ticket.affected_scope,
            analysis.get("business_critical", False)
        )


        sla_rule = SLARules.objects.filter(
            priority_level=final_priority
        ).first()

        if sla_rule:
            ticket.priority = sla_rule

            ticket.response_deadline = (
                ticket.created_at
                + sla_rule.response_time
            )

            ticket.resolution_deadline = (
                ticket.created_at
                + sla_rule.resolution_time
            )

        ticket.status = Ticket.TicketStatus.OPEN

        ticket.save()

        update_sla(ticket)

class ManualOverrideTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk):
        ticket = Ticket.objects.get(pk=pk)

        symptom_code_id = request.data.get("symptom_code")

        if not symptom_code_id:
            return Response(
                {"error": "symptom_code is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        symptom = SymptomCode.objects.filter(
            id=symptom_code_id
        ).first()

        if not symptom:
            return Response(
                {"error": "Invalid symptom code"},
                status=status.HTTP_400_BAD_REQUEST
            )

        category = symptom.category
        department = category.it_department if category else None

        if not department:
            return Response(
                {"error": "Selected symptom code has no department"},
                status=status.HTTP_400_BAD_REQUEST
            )

        ai_analysis = TicketAIAnalysis.objects.filter(
            ticket=ticket
        ).first()

        business_critical = (
            ai_analysis.business_critical
            if ai_analysis
            else False
        )
        final_priority = calculate_priority(
            symptom.based_priority,
            ticket.affected_scope,
            business_critical
        )


        sla_rule = SLARules.objects.filter(
            priority_level=final_priority
        ).first()

        if not sla_rule:
            return Response(
                {
                    "error": "No SLA rule found for calculated priority."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        ticket.symptom_code = symptom
        ticket.category = category
        ticket.it_department = department

        ticket.priority = sla_rule

        ticket.response_deadline = (
            ticket.created_at + sla_rule.response_time
        )

        ticket.resolution_deadline = (
            ticket.created_at + sla_rule.resolution_time
        )

        ticket.is_under_review = False
        ticket.status = Ticket.TicketStatus.OPEN

        ticket.save()

        ticket_analysis, created = TicketAnalysis.objects.get_or_create(
            ticket=ticket
        )

        ticket_analysis.model_type = (
            TicketAnalysis.ModelType.MANUAL_OVERRIDE
        )

        ticket_analysis.model_used = "Manual Override"

        ticket_analysis.predicted_symptom_code = symptom

        ticket_analysis.was_overridden = True

        ticket_analysis.updated_by = request.user

        if created:
            ticket_analysis.created_by = request.user

        ticket_analysis.save()

        ReviewFlags.objects.filter(
            ticket=ticket,
            reason=ReviewFlags.Reasons.SYMPTOM_NOT_DETECTED,
            status=ReviewFlags.Status.PENDING
        ).update(
            status=ReviewFlags.Status.RESOLVED
        )
        update_sla(ticket)

        return Response(
            {
                "success": True,
                "message": "Ticket manually overridden successfully.",
                "ticket": ticket.ticket_code,
                "symptom_code": symptom.code,
                "priority": ticket.priority.priority_level,
                "department": department.name,
                "model_type": ticket_analysis.model_type,
                "was_overridden": ticket_analysis.was_overridden,
            },
            status=status.HTTP_200_OK
        )

        
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
            now = timezone.now()

            ticket.status = Ticket.TicketStatus.RESOLVED
            ticket.resolved_at = now
            ticket.resolved_by = request.user

            if ticket.resolution_deadline:
                if now <= ticket.resolution_deadline:
                    ticket.resolution_sla_status = Ticket.SLAStatus.MET
                else:
                    ticket.resolution_sla_status = Ticket.SLAStatus.BREACHED
        
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

class UpdateTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk):
        ticket = Ticket.objects.get(pk=pk)

        assigned_to_id = request.data.get("assigned_to")

        if assigned_to_id is not None:

            technician = User.objects.filter(
                id=assigned_to_id
            ).first()

            if not technician:
                return Response(
                    {"error": "Invalid technician"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            ticket.assigned_to = technician

            ticket.status = Ticket.TicketStatus.IN_PROGRESS


        ticket.save()

        update_sla(ticket)

        return Response(
            {
                "success": True,
                "message": "Ticket updated successfully.",
                "ticket": ticket.ticket_code,
                "status": ticket.status,
                "assigned_to": (
                    ticket.assigned_to.username
                    if ticket.assigned_to
                    else None
                ),
                "response_sla_status": (
                    ticket.response_sla_status
                ),
                "resolution_sla_status": (
                    ticket.resolution_sla_status
                ),
            },
            status=status.HTTP_200_OK
        )


class FlaggedTicketsListView(generics.ListAPIView):
    queryset = ReviewFlags.objects.filter(status=ReviewFlags.Status.PENDING).select_related("ticket","ticket__priority",).order_by("-created_at")
    serializer_class = FlaggedTicketsListSerializer
    permission_classes = [IsAuthenticated]

class FlaggedTicketDetailView(generics.RetrieveAPIView):
    queryset = ReviewFlags.objects.all()
    serializer_class = FlaggedTicketDetailSerializer
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

class TicketListServiceDeskView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        tickets = Ticket.objects.filter(assigned_to=user)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)

class TicketDetailEmployeeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        user = request.user

        try:
            ticket = Ticket.objects.get(id=ticket_id, submitted_by=user)
        except Ticket.DoesNotExist:
            return Response({"error": "Ticket not found or you do not have permission to view this ticket."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = TicketDetailEmployeeSerializer(ticket)
        return Response(serializer.data)        

class TicketDetailServiceDeskView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        user = request.user

        try:
            ticket = Ticket.objects.get(id=ticket_id, assigned_to=user)
        except Ticket.DoesNotExist:
            return Response({"error": "Ticket not found or you do not have permission to view this ticket."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TicketSerializer(ticket)
        return Response(serializer.data)

class ServiceDeskOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        assigned_tickets = Ticket.objects.filter(assigned_to=user)
        count_assigned_tickets = assigned_tickets.count()

        rule_based_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.RULE_BASED,
        ).values("ticket").distinct().count()

        manual_override_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.MANUAL_OVERRIDE,
        ).values("ticket").distinct().count()

        flagged_tickets = ReviewFlags.objects.filter(
            status=ReviewFlags.Status.PENDING
        ).values('ticket').distinct().count()

        total_tickets = rule_based_tickets + manual_override_tickets

        if total_tickets > 0:
            auto_classified_percentage = (rule_based_tickets / total_tickets) * 100
        else:
            auto_classified_percentage = 0

        return Response({
            "assigned_tickets": count_assigned_tickets,
            "auto_classified_tickets": round(auto_classified_percentage, 1),
            "flagged_tickets": flagged_tickets
        })

class ServiceDeskClassifiedResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        rule_based_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.RULE_BASED,
        ).values("ticket").distinct().count()

        manual_override_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.MANUAL_OVERRIDE,
        ).values("ticket").distinct().count()

        total_tickets = rule_based_tickets + manual_override_tickets

        if total_tickets > 0:
            auto_classified_percentage = (rule_based_tickets / total_tickets) * 100

            manual_override_percentage = (manual_override_tickets / total_tickets) * 100
        else:
            auto_classified_percentage = 0
            manual_override_percentage = 0

        return Response({
            "auto_classified_percentage": round(auto_classified_percentage, 1),
            "rule_based_tickets": rule_based_tickets,
            "total_tickets": total_tickets,
            "manual_override_percentage": round(manual_override_percentage, 1),
            "manual_override_tickets": manual_override_tickets
        })

# --- End ---

# --- Category Views ---
class CreateCategoryView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class UpdateCategoryView(generics.UpdateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryUpdateSerializer
    permission_classes = [AllowAny]
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