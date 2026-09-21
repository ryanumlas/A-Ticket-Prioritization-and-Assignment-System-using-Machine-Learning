from django.utils import timezone
from django.shortcuts import render
from .pagination import TicketPagination
from django.db.models import Count
from django.db.models import Q
from django.db import transaction
from rest_framework.response import Response
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketAssistance, Keyword, TicketStatusHistory as TicketStatusHistoryModel, TicketRequest
from .serializers import (SymptomCodeSerializer, TicketSerializer, CategorySerializer, 
TicketAssistanceSerializer, TicketCommentSerializer, TicketStatusHistory, SLARulesSerializer, 
SLARulesUpdateSerializer, KeywordSerializer, KeywordUpdateSerializer, UpdateSymptomCodeSerializer, CreateSymptomCodeSerializer,
TicketCreateSerializer, TicketUpdateSerializer, TicketDetailEmployeeSerializer, CategoryUpdateSerializer, FlaggedTicketsListSerializer, 
FlaggedTicketDetailSerializer, TicketDetailSupportSerializer, TicketStatusHistorySerializer, PriorityChangeRequestSerializer, PriorityRequestListSerializer, 
PriorityRequestDetailSerializer, ReturnTicketSerializer, ReturnedTicketRequestListSerializer, ReturnedTicketDetailSerializer, ApproveReturnTicketSerializer)
from users.models import User, ITSupportProfile, Notifications
from users.services import create_notification
from .services import predict_ticket, assign_ticket_automatically
from ai.models import TicketAnalysis, TicketAIAnalysis
from ai.services import analyze_ticket
from tickets.services import classify_ticket, calculate_priority, update_sla, finalize_ticket_classification

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
                "message": "Ticket submitted successfully!",
            },
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def perform_create(self, serializer):
        profile = self.request.user.profile

        ticket = serializer.save(
            submitted_by=self.request.user,
            employee_department=profile.employee_department,
            office_location=profile.office_location,
        )

        create_notification(
            user=ticket.submitted_by,
            ticket=ticket,
            notification_type=Notifications.NotificationType.TICKET_CREATED,
            message=f"Your ticket {ticket.ticket_code} has been submitted successfully.",
            created_by=self.request.user,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.CREATED,
            new_value=ticket.status,
            changed_by=self.request.user,
            created_by=self.request.user,
        )

    # rest of your existing logic...

        analysis = analyze_ticket(ticket)

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": analysis.get("cleaned_text", ""),
                "summary": analysis.get("summary", ""),
                "keywords": analysis.get("keywords", []),
                "model_version": "gemini-2.5-flash",
                "business_critical": analysis.get("business_critical", False),
                "is_unclear": analysis.get("is_unclear", False),
            },
        )

        if analysis.get("is_unclear", False):
            ReviewFlags.objects.create(
                ticket=ticket,
                reason=ReviewFlags.Reasons.UNCLEAR_DESCRIPTION,
                status=ReviewFlags.Status.PENDING,
                source_type=ReviewFlags.SourceType.SYSTEM_GENERATED,
            )

            old_status = ticket.status

            ticket.is_under_review = True
            ticket.status = Ticket.TicketStatus.UNDER_REVIEW
            ticket.save()

            if old_status != ticket.status:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                    old_value=old_status,
                    new_value=ticket.status,
                    changed_by=self.request.user,
                    created_by=self.request.user,
                )

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

                old_status = ticket.status

                ticket.is_under_review = True
                ticket.status = Ticket.TicketStatus.UNDER_REVIEW

                ticket.save(
                    update_fields=[
                        "is_under_review",
                        "status",
                    ]
                )

                if old_status != ticket.status:
                    TicketStatusHistory.objects.create(
                        ticket=ticket,
                        event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                        old_value=old_status,
                        new_value=ticket.status,
                        changed_by=self.request.user,
                        created_by=self.request.user,
                    )

                return

            if ml_result["requires_review"]:
                old_status = ticket.status

                ticket.is_under_review = True
                ticket.status = Ticket.TicketStatus.UNDER_REVIEW
                ticket.save(update_fields=["is_under_review", "status"])

                if old_status != ticket.status:
                    TicketStatusHistory.objects.create(
                        ticket=ticket,
                        event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                        old_value=old_status,
                        new_value=ticket.status,
                        changed_by=self.request.user,
                        created_by=self.request.user,
                    )

                return

        category = symptom.category if symptom else None
        department = category.it_department if category else None

        if not department:
            ReviewFlags.objects.create(
                ticket=ticket,
                reason=ReviewFlags.Reasons.MISSING_DEPARTMENT,
                status=ReviewFlags.Status.PENDING,
                source_type=ReviewFlags.SourceType.SYSTEM_GENERATED,
            )

            old_status = ticket.status

            ticket.is_under_review = True
            ticket.status = Ticket.TicketStatus.UNDER_REVIEW
            ticket.save()

            if old_status != ticket.status:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                    old_value=old_status,
                    new_value=ticket.status,
                    changed_by=self.request.user,
                    created_by=self.request.user,
                )

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
                },
            )

        final_priority = calculate_priority(
            symptom.based_priority,
            ticket.affected_scope,
            analysis.get("business_critical", False),
            analysis.get("is_time_critical", False),
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

        ticket.is_under_review = False
        ticket.status = Ticket.TicketStatus.OPEN
        ticket.save()

        update_sla(ticket)

        assigned_profile = assign_ticket_automatically(ticket)

        if assigned_profile:
            technician_name = (
                f"{assigned_profile.user.first_name} "
                f"{assigned_profile.user.last_name}"
            ).strip() or assigned_profile.user.username

            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=Notifications.NotificationType.TICKET_CREATED,
                message=(
                    f"Your ticket {ticket.ticket_code} has been submitted "
                    f"and assigned to {technician_name}."
                ),
                created_by=self.request.user,
            )
        else:
            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=Notifications.NotificationType.TICKET_CREATED,
                message=(
                    f"Your ticket {ticket.ticket_code} has been submitted "
                    f"successfully and is waiting for assignment."
                ),
                created_by=self.request.user,
            )


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
        time_critical = (
            ai_analysis.is_time_critical
            if ai_analysis
            else False
        )

        final_priority = calculate_priority(
            symptom.based_priority,
            ticket.affected_scope,
            business_critical,
            time_critical
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

class TicketStatusHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        history = TicketStatusHistoryModel.objects.filter(
            ticket_id=pk
        ).order_by("-created_at")

        serializer = TicketStatusHistorySerializer(
            history,
            many=True
        )

        return Response(serializer.data)


class UpdateTicketStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        if ticket.is_under_review:
            return Response(
                {
                    "error": (
                        "This ticket is currently under Service Desk "
                        "review and cannot be modified."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        old_status = ticket.status
        new_status = request.data.get("status")
        remarks = request.data.get("remarks", "")

        if remarks is None:
            remarks = ""

        remarks = str(remarks).strip()

        if new_status == Ticket.TicketStatus.OPEN:
            ticket.status = Ticket.TicketStatus.OPEN

        elif new_status == Ticket.TicketStatus.UNDER_REVIEW:
            ticket.status = Ticket.TicketStatus.UNDER_REVIEW

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

        elif new_status == Ticket.TicketStatus.CANCELLED:
            ticket.status = Ticket.TicketStatus.CANCELLED

        else:
            return Response(
                {
                    "error": "Invalid status",
                    "received_status": new_status,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if old_status == ticket.status:
            return Response(
                {"message": "Ticket status is already set to this status"},
                status=status.HTTP_200_OK,
            )

        ticket.save()

        update_sla(ticket)

        TicketStatusHistoryModel.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistoryModel.EventType.STATUS_CHANGED,
            old_value=old_status,
            new_value=ticket.status,
            remarks=remarks,
            changed_by=request.user,
            created_by=request.user,
        )

        return Response(
            {
                "message": f"Ticket status updated to {ticket.status}",
                "status": ticket.status,
                "remarks": remarks,
                "response_sla_status": ticket.response_sla_status,
                "resolution_sla_status": ticket.resolution_sla_status,
            },
            status=status.HTTP_200_OK,
        )
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

            old_assigned_to = ticket.assigned_to
            old_status = ticket.status

            ticket.assigned_to = technician
            ticket.status = Ticket.TicketStatus.IN_PROGRESS

            ticket.save()

            new_name = (
                f"{technician.first_name} "
                f"{technician.last_name}"
            ).strip()

            # ASSIGNED or REASSIGNED history
            if old_assigned_to:
                old_name = (
                    f"{old_assigned_to.first_name} "
                    f"{old_assigned_to.last_name}"
                ).strip()

                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.REASSIGNED,
                    old_value=old_name,
                    new_value=new_name,
                    changed_by=request.user,
                )

            else:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.ASSIGNED,
                    old_value=None,
                    new_value=new_name,
                    changed_by=request.user,
                )

            # STATUS_CHANGED history
            if old_status != ticket.status:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                    old_value=old_status,
                    new_value=ticket.status,
                    changed_by=request.user,
                )

        else:
            ticket.save()

        update_sla(ticket)

        return Response(
            {
                "success": True,
                "message": "Ticket updated successfully.",
                "ticket": ticket.ticket_code,
                "status": ticket.status,
                "assigned_to": (
                    f"{ticket.assigned_to.first_name} "
                    f"{ticket.assigned_to.last_name}"
                ).strip()
                if ticket.assigned_to
                else None
                ,
                "response_sla_status": ticket.response_sla_status,
                "resolution_sla_status": ticket.resolution_sla_status,
            },
            status=status.HTTP_200_OK
        )


# --- Service Desk ---
class FlaggedTicketsListView(generics.ListAPIView):
    queryset = ReviewFlags.objects.select_related(
        "ticket",
        "ticket__priority",
    ).order_by("-created_at")

    serializer_class = FlaggedTicketsListSerializer

    permission_classes = [IsAuthenticated]

class FlaggedTicketDetailView(generics.RetrieveAPIView):
    queryset = ReviewFlags.objects.all()
    serializer_class = FlaggedTicketDetailSerializer
    permission_classes = [IsAuthenticated]

class ApproveOverrideView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            flag = ReviewFlags.objects.select_related(
                "ticket",
                "prediction",
                "prediction__predicted_symptom_code",
                "ticket__ai_analysis",
            ).get(
                pk=pk,
                status=ReviewFlags.Status.PENDING,
                reason=ReviewFlags.Reasons.LOW_CONFIDENCE,
            )
        except ReviewFlags.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Pending Low Confidence review flag not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        selected_code = request.data.get("symptom_code")
        remarks = request.data.get("remarks", "")
        if remarks is None:
            remarks = ""
        remarks = str(remarks).strip()

        if not selected_code:
            return Response(
                {
                    "success": False,
                    "message": "A symptom code must be selected.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            selected_symptom = SymptomCode.objects.get(code=selected_code)
        except SymptomCode.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Selected symptom code does not exist.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        prediction = flag.prediction

        if not prediction:
            return Response(
                {
                    "success": False,
                    "message": "Model recommendation not found.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        recommended_symptom = prediction.predicted_symptom_code

        if recommended_symptom and selected_symptom.id == recommended_symptom.id:
            return Response(
                {
                    "success": False,
                    "message": "The selected symptom code is already the model's primary recommendation.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reviewed_at = timezone.now()
        old_status = flag.ticket.status

        ticket = finalize_ticket_classification(
            flag.ticket,
            selected_symptom,
            response_start=reviewed_at,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.REVIEW_COMPLETED,
            old_value=recommended_symptom.code if recommended_symptom else None,
            new_value=selected_symptom.code,
            remarks=remarks,
            changed_by=request.user,
            created_by=request.user,
        )

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                old_value=old_status,
                new_value=ticket.status,
                changed_by=request.user,
                created_by=request.user,
            )

        prediction.was_overridden = True
        prediction.save(update_fields=["was_overridden", "updated_at"])

        flag.status = ReviewFlags.Status.APPROVED
        flag.reviewed_by = request.user
        flag.reviewed_at = reviewed_at
        flag.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        assigned_profile = assign_ticket_automatically(ticket)

        return Response(
            {
                "success": True,
                "message": "Classification override approved successfully.",
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "symptom_code": ticket.symptom_code.code,
                    "priority": ticket.priority.priority_level,
                    "status": ticket.status,
                    "assigned_to": assigned_profile.user.get_full_name() if assigned_profile else None,
                    "response_deadline": ticket.response_deadline,
                    "resolution_deadline": ticket.resolution_deadline,
                },
            },
            status=status.HTTP_200_OK,
        )

class AcceptRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        remarks = request.data.get("remarks", "")
        if remarks is None:
            remarks = ""
        remarks = str(remarks).strip()
        try:
            flag = ReviewFlags.objects.select_related(
                "ticket",
                "prediction",
                "prediction__predicted_symptom_code",
                "ticket__ai_analysis",
            ).get(
                pk=pk,
                status=ReviewFlags.Status.PENDING,
                reason=ReviewFlags.Reasons.LOW_CONFIDENCE,
            )
        except ReviewFlags.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Pending review flag not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        prediction = flag.prediction

        if not prediction:
            return Response(
                {
                    "success": False,
                    "message": "Model recommendation not found.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        recommended_symptom = prediction.predicted_symptom_code

        if not recommended_symptom:
            return Response(
                {
                    "success": False,
                    "message": "Primary recommendation not found.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reviewed_at = timezone.now()
        old_status = flag.ticket.status

        ticket = finalize_ticket_classification(
            flag.ticket,
            recommended_symptom,
            response_start=reviewed_at,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.REVIEW_COMPLETED,
            old_value=None,
            new_value=recommended_symptom.code,
            remarks=remarks,
            changed_by=request.user,
            created_by=request.user,
        )

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                old_value=old_status,
                new_value=ticket.status,
                changed_by=request.user,
                created_by=request.user,
            )

        flag.status = ReviewFlags.Status.APPROVED
        flag.reviewed_by = request.user
        flag.reviewed_at = reviewed_at
        flag.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        assigned_profile = assign_ticket_automatically(ticket)

        return Response(
            {
                "success": True,
                "message": "Recommendation accepted successfully.",
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "symptom_code": ticket.symptom_code.code,
                    "priority": ticket.priority.priority_level,
                    "status": ticket.status,
                    "assigned_to": assigned_profile.user.get_full_name() if assigned_profile else None,
                    "response_deadline": ticket.response_deadline,
                    "resolution_deadline": ticket.resolution_deadline,
                },
            },
            status=status.HTTP_200_OK,
        )

class ManuallyClassifyView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            flag = ReviewFlags.objects.select_related(
                "ticket",
                "ticket__ai_analysis",
            ).get(
                pk=pk,
                status=ReviewFlags.Status.PENDING,
                reason=ReviewFlags.Reasons.UNCLEAR_DESCRIPTION,
            )
        except ReviewFlags.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Pending Unclear Description review flag not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        selected_code = request.data.get("symptom_code")
        
        remarks = request.data.get("remarks", "")
        if remarks is None:
            remarks = ""
        remarks = str(remarks).strip()

        if not selected_code:
            return Response(
                {
                    "success": False,
                    "message": "A symptom code must be selected.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            selected_symptom = SymptomCode.objects.get(code=selected_code)
        except SymptomCode.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Selected symptom code does not exist.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reviewed_at = timezone.now()
        old_status = flag.ticket.status

        ticket = finalize_ticket_classification(
            flag.ticket,
            selected_symptom,
            response_start=reviewed_at,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.REVIEW_COMPLETED,
            old_value=None,
            new_value=selected_symptom.code,
            remarks=remarks,
            changed_by=request.user,
            created_by=request.user,
        )

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                old_value=old_status,
                new_value=ticket.status,
                changed_by=request.user,
                created_by=request.user,
            )

        flag.status = ReviewFlags.Status.APPROVED
        flag.reviewed_by = request.user
        flag.reviewed_at = reviewed_at
        flag.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        assigned_profile = assign_ticket_automatically(ticket)

        return Response(
            {
                "success": True,
                "message": "Ticket manually classified successfully.",
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "symptom_code": ticket.symptom_code.code,
                    "priority": ticket.priority.priority_level,
                    "status": ticket.status,
                    "assigned_to": assigned_profile.user.get_full_name() if assigned_profile else None,
                    "response_deadline": ticket.response_deadline,
                    "resolution_deadline": ticket.resolution_deadline,
                },
            },
            status=status.HTTP_200_OK,
        )
class DeleteTicketView(generics.DestroyAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer
    permission_classes = [IsAuthenticated]

class TicketCommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_ticket(self, request, pk):
        try:
            ticket = Ticket.objects.get(pk=pk)
        except Ticket.DoesNotExist:
            return None

        if request.user.role and request.user.role.name == "Employee":
            if ticket.submitted_by_id != request.user.id:
                return None

        return ticket

    def get(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if not ticket:
            return Response(
                {"detail": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND,
            )

        comments = ticket.comments.select_related(
            "commented_by",
            "commented_by__role",
        ).order_by("created_at")

        if request.user.role and request.user.role.name == "Employee":
            comments = comments.filter(
                comment_type=TicketComments.CommentType.PUBLIC_REPLY
            )
        else:
            comments = comments.exclude(
                comment_type=TicketComments.CommentType.SYSTEM_LOG
            )

        serializer = TicketCommentSerializer(comments, many=True)

        return Response(serializer.data)

    def post(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if not ticket:
            return Response(
                {"detail": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND,
            )
        
        if ticket.is_under_review:
            return Response(
                {
                    "detail": (
                        "This ticket is currently under Service Desk "
                        "review and cannot receive new messages."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        message = request.data.get("message", "")
        comment_type = request.data.get(
            "comment_type",
            TicketComments.CommentType.PUBLIC_REPLY,
        )

        message = str(message).strip()

        if not message:
            return Response(
                {"message": "Message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_role = request.user.role.name if request.user.role else None

        if user_role == "Employee":
            comment_type = TicketComments.CommentType.PUBLIC_REPLY

        elif comment_type not in [
            TicketComments.CommentType.PUBLIC_REPLY,
            TicketComments.CommentType.INTERNAL_NOTE,
        ]:
            return Response(
                {"message": "Invalid comment type."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        comment = TicketComments.objects.create(
            ticket=ticket,
            commented_by=request.user,
            message=message,
            comment_type=comment_type,
        )

        serializer = TicketCommentSerializer(comment)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )
# --- Employee View ---
class TicketListEmployeeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        tickets = (
            Ticket.objects
            .filter(submitted_by=user)
            .select_related(
                "symptom_code",
                "priority",
                "assigned_to",
            )
            .order_by("-created_at")
        )

        # SEARCH
        search = request.query_params.get("search", "").strip()

        if search:
            tickets = tickets.filter(
                Q(ticket_code__icontains=search) |
                Q(subject__icontains=search)
            )

        # STATUS FILTER
        status_filter = request.query_params.get("status")

        if status_filter:
            tickets = tickets.filter(status=status_filter)

        # PRIORITY FILTER
        priority = request.query_params.get("priority")

        if priority:
            tickets = tickets.filter(
                priority__priority_level=priority
            )

        # PAGINATION
        paginator = TicketPagination()

        page = paginator.paginate_queryset(
            tickets,
            request,
            view=self,
        )

        serializer = TicketSerializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

class TicketListServiceDeskView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        tickets = (
            Ticket.objects
            .filter(assigned_to=user)
            .select_related(
                "symptom_code",
                "priority",
                "assigned_to",
            )
            .order_by("-created_at")
        )

        # SEARCH
        search = request.query_params.get("search", "").strip()

        if search:
            tickets = tickets.filter(
                Q(ticket_code__icontains=search) |
                Q(subject__icontains=search)
            )

        # STATUS FILTER
        status_filter = request.query_params.get("status")

        if status_filter:
            tickets = tickets.filter(
                status=status_filter
            )

        # PRIORITY FILTER
        priority = request.query_params.get("priority")

        if priority:
            tickets = tickets.filter(
                priority__priority_level=priority
            )

        # SYMPTOM CODE FILTER
        symptom_code = request.query_params.get(
            "symptom_code"
        )

        if symptom_code:
            tickets = tickets.filter(
                symptom_code__code=symptom_code
            )

        # PAGINATION
        paginator = TicketPagination()

        page = paginator.paginate_queryset(
            tickets,
            request,
            view=self,
        )

        serializer = TicketSerializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

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

class TicketDetailSupportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        user = request.user

        try:
            support_profile = user.it_support_profile
        except ITSupportProfile.DoesNotExist:
            return Response(
                {"error": "You do not have an IT Support profile."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            ticket = Ticket.objects.get(
                id=ticket_id,
                it_department=support_profile.it_department
            )
        except Ticket.DoesNotExist:
            return Response(
                {
                    "error": "Ticket not found or you do not have permission to view this ticket."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TicketDetailSupportSerializer(
            ticket,
            context={"request": request}
        )

        return Response(serializer.data)
# --- End --- 

#
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

        assigned_tickets = Ticket.objects.filter(
            assigned_to=user
        )

        count_assigned_tickets = assigned_tickets.count()

        # Rule-based automated classifications
        rule_based_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.RULE_BASED,
        ).values("ticket").distinct().count()

        # ML classifications that were accepted/not overridden
        machine_learning_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.MACHINE_LEARNING,
            was_overridden=False,
        ).values("ticket").distinct().count()

        # Automated = Rule-Based + accepted ML classifications
        automated_tickets = (
            rule_based_tickets
            + machine_learning_tickets
        )

        # Human overrides
        manual_override_tickets = TicketAnalysis.objects.filter(
            was_overridden=True,
        ).values("ticket").distinct().count()

        # Pending review tickets
        flagged_tickets = ReviewFlags.objects.filter(
            status=ReviewFlags.Status.PENDING
        ).values("ticket").distinct().count()

        total_classified_tickets = (
            automated_tickets
            + manual_override_tickets
        )

        if total_classified_tickets > 0:
            auto_classified_percentage = (
                automated_tickets
                / total_classified_tickets
            ) * 100
        else:
            auto_classified_percentage = 0

        return Response({
            "assigned_tickets": count_assigned_tickets,
            "auto_classified_tickets": round(
                auto_classified_percentage,
                1
            ),
            "flagged_tickets": flagged_tickets,
        })

class ServiceDeskClassifiedResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # Rule-based automated classifications
        rule_based_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.RULE_BASED,
        ).values("ticket").distinct().count()

        # ML classifications that were accepted/not overridden
        machine_learning_tickets = TicketAnalysis.objects.filter(
            model_type=TicketAnalysis.ModelType.MACHINE_LEARNING,
            was_overridden=False,
        ).values("ticket").distinct().count()

        # Human overrides / manual reviews
        manual_override_tickets = TicketAnalysis.objects.filter(
            was_overridden=True,
        ).values("ticket").distinct().count()

        # Automated = Rule-Based + accepted ML
        automated_tickets = (
            rule_based_tickets
            + machine_learning_tickets
        )

        total_tickets = (
            automated_tickets
            + manual_override_tickets
        )

        if total_tickets > 0:
            auto_classified_percentage = (
                automated_tickets / total_tickets
            ) * 100

            manual_override_percentage = (
                manual_override_tickets / total_tickets
            ) * 100
        else:
            auto_classified_percentage = 0
            manual_override_percentage = 0

        return Response({
            "auto_classified_percentage": round(
                auto_classified_percentage,
                1
            ),
            "automated_tickets": automated_tickets,

            "rule_based_tickets": rule_based_tickets,
            "machine_learning_tickets": machine_learning_tickets,

            "manual_override_percentage": round(
                manual_override_percentage,
                1
            ),
            "manual_override_tickets": manual_override_tickets,

            "total_tickets": total_tickets,
        })


# --- Support View --- 
class SLAPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        support_profile = getattr(
            request.user,
            "it_support_profile",
            None
        )

        if not support_profile:
            return Response(
                {
                    "detail": "IT Support profile not found."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not support_profile.it_department:
            return Response(
                {
                    "detail": "IT Support user has no assigned IT department."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        department_tickets = Ticket.objects.filter(
            it_department=support_profile.it_department
        )


        response_met = department_tickets.filter(
            response_sla_status=Ticket.SLAStatus.MET
        ).count()

        response_breached = department_tickets.filter(
            response_sla_status=Ticket.SLAStatus.BREACHED
        ).count()

        response_evaluated = (
            response_met + response_breached
        )

        if response_evaluated > 0:
            response_sla = round(
                (response_met / response_evaluated) * 100,
                1
            )
        else:
            response_sla = 0.0

        resolution_met = department_tickets.filter(
            resolution_sla_status=Ticket.SLAStatus.MET
        ).count()

        resolution_breached = department_tickets.filter(
            resolution_sla_status=Ticket.SLAStatus.BREACHED
        ).count()

        resolution_evaluated = (
            resolution_met + resolution_breached
        )

        if resolution_evaluated > 0:
            resolution_sla = round(
                (resolution_met / resolution_evaluated) * 100,
                1
            )
        else:
            resolution_sla = 0.0


        total_met = (
            response_met +
            resolution_met
        )

        total_evaluated = (
            response_evaluated +
            resolution_evaluated
        )

        if total_evaluated > 0:
            overall_compliance = round(
                (total_met / total_evaluated) * 100,
                1
            )
        else:
            overall_compliance = 0.0

        return Response({
            "overall_compliance": overall_compliance,
            "response_sla": response_sla,
            "resolution_sla": resolution_sla,

            "response": {
                "met": response_met,
                "breached": response_breached,
                "evaluated": response_evaluated,
            },

            "resolution": {
                "met": resolution_met,
                "breached": resolution_breached,
                "evaluated": resolution_evaluated,
            },
        })

class SupportOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        try:
            support_profile = user.it_support_profile
        except user._meta.model.it_support_profile.RelatedObjectDoesNotExist:
            return Response(
                {"detail": "IT Support profile not found."},
                status=status.HTTP_400_BAD_REQUEST
            )
        it_department = support_profile.it_department

        if not it_department:
            return Response(
                {"detail": "IT Support user has no assigned IT Department."},
                status=status.HTTP_400_BAD_REQUEST
            )

        assigned_tickets = Ticket.objects.filter(assigned_to=user).exclude(
            status__in=[
                Ticket.TicketStatus.RESOLVED,
                Ticket.TicketStatus.CLOSED
            ]
        ).count()

        open_tickets = Ticket.objects.filter(
            it_department=it_department,
            status=Ticket.TicketStatus.OPEN,
        ).count()

        in_progress = Ticket.objects.filter(
            it_department=it_department,
            status=Ticket.TicketStatus.IN_PROGRESS,
        ).count()

        sla_at_risk = (
            Ticket.objects
            .filter(
                it_department=it_department,
            )
            .exclude(
                status__in=[
                    Ticket.TicketStatus.RESOLVED,
                    Ticket.TicketStatus.CLOSED,
                ]
            )
            .filter(
                Q(
                    response_sla_status__in=[
                        Ticket.SLAStatus.WARNING,
                        Ticket.SLAStatus.CRITICAL,
                        Ticket.SLAStatus.BREACHED,
                    ]
                )
                |
                Q(
                    resolution_sla_status__in=[
                        Ticket.SLAStatus.WARNING,
                        Ticket.SLAStatus.CRITICAL,
                        Ticket.SLAStatus.BREACHED,
                    ]
                )
            )
            .distinct()
            .count()
        )

        return Response({
            "assigned_tickets": assigned_tickets,
            "open_tickets": open_tickets,
            "in_progress": in_progress,
            "sla_at_risk": sla_at_risk,
        })

class TicketListSupportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = (
            Ticket.objects
            .filter(assigned_to=request.user)
            .select_related(
                "symptom_code",
                "priority",
                "assigned_to",
            )
            .order_by("-created_at")
        )

        # SEARCH
        search = request.query_params.get("search", "").strip()

        if search:
            tickets = tickets.filter(
                Q(ticket_code__icontains=search) |
                Q(subject__icontains=search)
            )

        # STATUS FILTER
        status_filter = request.query_params.get("status")

        if status_filter:
            tickets = tickets.filter(
                status=status_filter
            )

        # PRIORITY FILTER
        priority = request.query_params.get("priority")

        if priority:
            tickets = tickets.filter(
                priority__priority_level=priority
            )

        # SYMPTOM CODE FILTER
        symptom_code = request.query_params.get(
            "symptom_code"
        )

        if symptom_code:
            tickets = tickets.filter(
                symptom_code__code=symptom_code
            )

        # PAGINATION
        paginator = TicketPagination()

        page = paginator.paginate_queryset(
            tickets,
            request,
            view=self,
        )

        serializer = TicketSerializer(
            page,
            many=True,
        )

        return paginator.get_paginated_response(
            serializer.data
        )

class TicketQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        support_profile = getattr(
            request.user,
            "it_support_profile",
            None
        )

        if not support_profile:
            return Response(
                {
                    "detail":
                    "IT Support profile not found."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not support_profile.it_department:
            return Response(
                {
                    "detail":
                    "IT Support user has no assigned IT department."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        tickets = (
            Ticket.objects
            .filter(
                it_department=
                support_profile.it_department
            )
            .select_related(
                "symptom_code",
                "priority",
                "assigned_to",
            )
            .order_by("-created_at")
        )
        # SEARCH
        search = request.query_params.get(
            "search",
            ""
        ).strip()

        if search:
            tickets = tickets.filter(
                Q(ticket_code__icontains=search) |
                Q(subject__icontains=search)
            )

        # STATUS
        status_filter = request.query_params.get(
            "status"
        )

        if status_filter:
            tickets = tickets.filter(
                status=status_filter
            )

        # PRIORITY
        priority = request.query_params.get(
            "priority"
        )

        if priority:
            tickets = tickets.filter(
                priority__priority_level=priority
            )

        # SYMPTOM CODE
        symptom_code = request.query_params.get(
            "symptom_code"
        )

        if symptom_code:
            tickets = tickets.filter(
                symptom_code__code=symptom_code
            )

        # PAGINATION
        paginator = TicketPagination()

        page = paginator.paginate_queryset(
            tickets,
            request,
            view=self
        )

        serializer = TicketSerializer(
            page,
            many=True
        )

        return paginator.get_paginated_response(
            serializer.data
        )
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

class DepartmentSymptomCodesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        support_profile = getattr(
            request.user,
            "it_support_profile",
            None
        )

        if not support_profile:
            return Response(
                {"detail": "IT Support profile not found."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not support_profile.it_department:
            return Response(
                {"detail": "User has no assigned IT department."},
                status=status.HTTP_400_BAD_REQUEST
            )

        symptom_codes = (
            SymptomCode.objects
            .filter(
                category__it_department=support_profile.it_department
            )
            .select_related("category")
            .order_by("code")
        )

        data = [
            {
                "id": symptom.id,
                "code": symptom.code,
                "description": symptom.description,
                "category": symptom.category.name if symptom.category else None,
            }
            for symptom in symptom_codes
        ]

        return Response(data)
class CreateSymptomCodeView(generics.CreateAPIView):
    queryset = SymptomCode.objects.all()
    serializer_class = CreateSymptomCodeSerializer
    permission_classes = [AllowAny]

class UpdateSymptomCodeView(generics.UpdateAPIView):
    queryset = SymptomCode.objects.all()
    serializer_class = UpdateSymptomCodeSerializer
    permission_classes = [AllowAny]

class SymptomCodeListView(generics.ListAPIView):
    queryset = SymptomCode.objects.all()
    serializer_class = SymptomCodeSerializer
    permission_classes = [IsAuthenticated]
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

# --- Category Views ---
class TicketsByCategoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        categories = (
            Ticket.objects
            .exclude(category__isnull=True)
            .values("category__name")
            .annotate(tickets=Count("id"))
            .order_by("-tickets")
        )

        data = [
            {
                "category": item["category__name"],
                "tickets": item["tickets"],
            }
            for item in categories
        ]

        return Response(data)


class PriorityChangeRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        serializer = PriorityChangeRequestSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        ticket = Ticket.objects.filter(
            pk=pk
        ).first()

        if not ticket:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Only the assigned IT Support Specialist
        # can request a priority change.
        if ticket.assigned_to_id != request.user.id:
            return Response(
                {
                    "error": "You are not assigned to this ticket."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        requested_priority = SLARules.objects.filter(
            priority_level=serializer.validated_data["requested_priority"]
        ).first()

        if not requested_priority:
            return Response(
                {
                    "error": "Invalid requested priority."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # IT Support can only request P1-P3.
        # P4-P5 do not require IT Service Desk approval.
        if requested_priority.priority_level not in [
            "P1",
            "P2",
            "P3",
        ]:
            return Response(
                {
                    "error": (
                        "Priority change requests are only "
                        "required for P1, P2, or P3."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cannot request the ticket's current priority.
        if (
            ticket.priority and
            ticket.priority_id == requested_priority.id
        ):
            return Response(
                {
                    "error": (
                        "The ticket already has this priority."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent multiple pending priority change requests
        # for the same ticket.
        existing_request = TicketRequest.objects.filter(
            ticket=ticket,
            request_type=(
                TicketRequest.RequestType.PRIORITY_CHANGE
            ),
            status=TicketRequest.RequestStatus.PENDING
        ).exists()

        if existing_request:
            return Response(
                {
                    "error": (
                        "This ticket already has a pending "
                        "priority change request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        priority_request = TicketRequest.objects.create(
        ticket=ticket,
        request_type=(
            TicketRequest.RequestType.PRIORITY_CHANGE
        ),
        requested_by=request.user,
        current_priority=ticket.priority,
        requested_priority=requested_priority,
        reason=serializer.validated_data["reason"],
        status=TicketRequest.RequestStatus.PENDING
    )

        return Response(
            {
                "success": True,
                "message": (
                    "Priority change request submitted successfully."
                ),
                "request": {
                    "id": priority_request.id,
                    "ticket": ticket.ticket_code,
                    "current_priority": (
                        ticket.priority.priority_level
                        if ticket.priority
                        else None
                    ),
                    "requested_priority": (
                        requested_priority.priority_level
                    ),
                    "reason": priority_request.reason,
                    "status": priority_request.status,
                    "requested_at": priority_request.requested_at,
                }
            },
            status=status.HTTP_201_CREATED
        )

class PriorityChangeRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        priority_requests = TicketRequest.objects.filter(
            request_type=TicketRequest.RequestType.PRIORITY_CHANGE
        ).select_related(
            "ticket",
            "ticket__priority",
            "requested_priority",
            "requested_by",
        ).order_by(
            "-requested_at"
        )

        serializer = PriorityRequestListSerializer(
            priority_requests,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class PriorityRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, request_id):
        priority_request = TicketRequest.objects.filter(
            id=request_id,
            request_type=TicketRequest.RequestType.PRIORITY_CHANGE
        ).select_related(
            "ticket",
            "ticket__priority",
            "requested_priority",
            "requested_by",
            "requested_by__it_support_profile",
            "requested_by__it_support_profile__it_department",
            "requested_by__profile",
            "requested_by__profile__office_location",
        ).first()

        if not priority_request:
            return Response(
                {
                    "error": "Priority change request not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = PriorityRequestDetailSerializer(
            priority_request
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

class ApprovePriorityRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, request_id):
        priority_request = (
            TicketRequest.objects
            .select_for_update()
            .filter(
                id=request_id,
                request_type=TicketRequest.RequestType.PRIORITY_CHANGE,
            )
            .first()
        )

        if not priority_request:
            return Response(
                {
                    "error": "Priority change request not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            priority_request.status
            != TicketRequest.RequestStatus.PENDING
        ):
            return Response(
                {
                    "error": "This priority change request has already been reviewed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not priority_request.requested_priority:
            return Response(
                {
                    "error": "Requested priority is missing."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = priority_request.ticket

        review_remarks = request.data.get(
            "review_remarks",
            ""
        ).strip()

        ticket.priority = priority_request.requested_priority

        ticket.save(
            update_fields=[
                "priority",
            ]
        )

        update_sla(
            ticket,
            recalculate_deadlines=True,
        )

        priority_request.status = (
            TicketRequest.RequestStatus.APPROVED
        )

        priority_request.reviewed_by = request.user
        priority_request.reviewed_at = timezone.now()
        priority_request.review_remarks = review_remarks

        priority_request.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "review_remarks",
            ]
        )

        serializer = PriorityRequestDetailSerializer(
            priority_request
        )

        return Response(
            {
                "message": "Priority change request approved successfully.",
                "request": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

class ReturnTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        serializer = ReturnTicketSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        ticket = Ticket.objects.filter(
            pk=pk
        ).first()

        if not ticket:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Only the currently assigned IT Support Specialist
        # can return the ticket.
        if ticket.assigned_to_id != request.user.id:
            return Response(
                {
                    "error": "You are not assigned to this ticket."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Prevent returning a ticket that is already
        # under Service Desk review.
        if ticket.is_under_review:
            return Response(
                {
                    "error": (
                        "This ticket is already under Service Desk "
                        "review."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Prevent multiple pending return requests
        # for the same ticket.
        existing_request = TicketRequest.objects.filter(
            ticket=ticket,
            request_type=(
                TicketRequest.RequestType.RETURN_TO_SERVICE_DESK
            ),
            status=TicketRequest.RequestStatus.PENDING
        ).exists()

        if existing_request:
            return Response(
                {
                    "error": (
                        "This ticket already has a pending "
                        "return request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = serializer.validated_data["reason"]

        # Store the current ticket status before changing it.
        previous_status = ticket.status

        # Create the return request.
        return_request = TicketRequest.objects.create(
            ticket=ticket,
            request_type=(
                TicketRequest.RequestType.RETURN_TO_SERVICE_DESK
            ),
            requested_by=request.user,
            reason=reason,
            status=TicketRequest.RequestStatus.PENDING,
        )

        # Put the ticket under Service Desk review.
        #
        # Keep assigned_to unchanged so the original
        # IT Support Specialist can still see the ticket.
        ticket.status = Ticket.TicketStatus.UNDER_REVIEW
        ticket.is_under_review = True
        ticket.updated_by = request.user

        ticket.save(
            update_fields=[
                "status",
                "is_under_review",
                "updated_by",
                "updated_at",
            ]
        )

        # Record the return event in the ticket history.
        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.RETURNED,
            old_value=previous_status,
            new_value="Service Desk",
            remarks=return_request.reason,
            created_by=request.user,
            changed_by=request.user,
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Ticket return request submitted successfully. "
                    "The ticket is now pending Service Desk review."
                ),
                "request": {
                    "id": return_request.id,
                    "ticket": ticket.ticket_code,
                    "requested_by": request.user.user_code,
                    "reason": return_request.reason,
                    "status": return_request.status,
                    "requested_at": return_request.requested_at,
                }
            },
            status=status.HTTP_201_CREATED
        )

class ReturnedTicketRequestListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        requests = (
            TicketRequest.objects
            .filter(
                request_type=(
                    TicketRequest.RequestType.RETURN_TO_SERVICE_DESK
                )
            )
            .select_related(
                "ticket",
                "requested_by",
                "requested_by__it_support_profile",
                "requested_by__it_support_profile__it_department",
                "requested_by__profile",
                "requested_by__profile__office_location",
            )
            .order_by("-requested_at")
        )

        serializer = ReturnedTicketRequestListSerializer(
            requests,
            many=True
        )

        return Response(serializer.data)

class ReturnedTicketDetailRetrieve(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        return_request = (
            TicketRequest.objects
            .filter(
                pk=pk,
                request_type=TicketRequest.RequestType.RETURN_TO_SERVICE_DESK,
            )
            .select_related(
                "ticket",
                "ticket__submitted_by",
                "ticket__submitted_by__profile",
                "ticket__submitted_by__profile__office_location",
                "ticket__submitted_by__it_support_profile",
                "ticket__submitted_by__it_support_profile__it_department",
                "ticket__it_department",
                "requested_by",
                "requested_by__profile",
                "requested_by__profile__office_location",
                "requested_by__it_support_profile",
                "requested_by__it_support_profile__it_department",
                "reviewed_by",
            )
            .first()
        )

        if not return_request:
            return Response(
                {"error": "Returned ticket request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ReturnedTicketDetailSerializer(return_request)

        return Response(serializer.data, status=status.HTTP_200_OK)

class ApproveReturnTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        serializer = ApproveReturnTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        selected_symptom_id = serializer.validated_data["symptom_code_id"]
        review_remarks = serializer.validated_data.get(
            "review_remarks",
            ""
        )

        # Lock only the TicketRequest row.
        return_request = (
            TicketRequest.objects
            .select_for_update()
            .filter(
                pk=pk,
                request_type=TicketRequest.RequestType.RETURN_TO_SERVICE_DESK,
            )
            .first()
        )

        if not return_request:
            return Response(
                {
                    "error": "Returned ticket request not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if return_request.status != TicketRequest.RequestStatus.PENDING:
            return Response(
                {
                    "error": (
                        "This return request has already been reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the ticket separately.
        ticket = (
            Ticket.objects
            .select_related(
                "symptom_code",
                "category",
                "it_department",
            )
            .get(pk=return_request.ticket_id)
        )

        if not ticket.is_under_review:
            return Response(
                {
                    "error": (
                        "This ticket is no longer under "
                        "Service Desk review."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Get the selected symptom code and its routing.
        selected_symptom = (
            SymptomCode.objects
            .select_related(
                "category",
                "category__it_department",
            )
            .filter(pk=selected_symptom_id)
            .first()
        )

        if not selected_symptom:
            return Response(
                {
                    "error": "Selected symptom code not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not selected_symptom.category:
            return Response(
                {
                    "error": (
                        "The selected symptom code has no "
                        "category assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_department = selected_symptom.category.it_department

        if not new_department:
            return Response(
                {
                    "error": (
                        "The selected symptom code's category "
                        "has no IT department assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # The selected symptom must belong to a different
        # IT department from the ticket's current department.
        current_department_id = ticket.it_department_id

        if current_department_id == new_department.id:
            return Response(
                {
                    "error": (
                        "Please select a symptom code from a "
                        "different IT department."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Keep the old values for history.
        old_symptom = ticket.symptom_code
        old_category = ticket.category
        old_department = ticket.it_department
        old_assigned_to = ticket.assigned_to
        old_status = ticket.status

        # UPDATE TICKET ROUTING
        ticket.symptom_code = selected_symptom
        ticket.category = selected_symptom.category
        ticket.it_department = new_department

        # Clear the previous technician assignment because
        # the ticket is now being routed to a different department.
        ticket.assigned_to = None

        # IMPORTANT:
        # The ticket was previously UNDER_REVIEW.
        # Move it back to OPEN so automatic assignment can run.
        ticket.status = Ticket.TicketStatus.OPEN

        ticket.is_under_review = False
        ticket.updated_by = request.user

        ticket.save(
            update_fields=[
                "symptom_code",
                "category",
                "it_department",
                "assigned_to",
                "status",
                "is_under_review",
                "updated_by",
                "updated_at",
            ]
        )

        # ---------------------------------------------------------
        # HISTORY: SYMPTOM / ROUTING CHANGE
        # ---------------------------------------------------------

        old_symptom_code = (
            old_symptom.code
            if old_symptom
            else None
        )

        old_category_name = (
            old_category.name
            if old_category
            else None
        )

        old_department_name = (
            old_department.name
            if old_department
            else None
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.SYMPTOM_CODE_CHANGED,
            old_value=old_symptom_code,
            new_value=selected_symptom.code,
            remarks=(
                f"Category: {old_category_name or '-'} → "
                f"{selected_symptom.category.name}. "
                f"IT Department: {old_department_name or '-'} → "
                f"{new_department.name}."
            ),
            created_by=request.user,
            changed_by=request.user,
        )

        # ---------------------------------------------------------
        # HISTORY: PREVIOUS ASSIGNMENT CLEARED
        # ---------------------------------------------------------

        if old_assigned_to:
            old_assignee_name = (
                f"{old_assigned_to.first_name} "
                f"{old_assigned_to.last_name}"
            ).strip() or old_assigned_to.username

            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.REASSIGNED,
                old_value=old_assignee_name,
                new_value=None,
                remarks=(
                    "Previous assignment cleared for automatic "
                    "reassignment after return approval."
                ),
                created_by=request.user,
                changed_by=request.user,
            )

        # ---------------------------------------------------------
        # HISTORY: STATUS CHANGE
        # ---------------------------------------------------------

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                old_value=old_status,
                new_value=ticket.status,
                remarks=(
                    "Ticket moved from Service Desk review "
                    "back to open status for reassignment."
                ),
                created_by=request.user,
                changed_by=request.user,
            )

        # ---------------------------------------------------------
        # APPROVE RETURN REQUEST
        # ---------------------------------------------------------

        return_request.status = (
            TicketRequest.RequestStatus.APPROVED
        )

        return_request.reviewed_by = request.user
        return_request.reviewed_at = timezone.now()
        return_request.review_remarks = review_remarks

        return_request.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "review_remarks",
            ]
        )

        # ---------------------------------------------------------
        # HISTORY: RETURN APPROVED
        # ---------------------------------------------------------

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.RETURN_APPROVED,
            old_value="pending",
            new_value="approved",
            remarks=(
                review_remarks
                or "Return request approved."
            ),
            created_by=request.user,
            changed_by=request.user,
        )

        # ---------------------------------------------------------
        # AUTOMATIC ASSIGNMENT
        # ---------------------------------------------------------

        assigned_profile = assign_ticket_automatically(ticket)

        # ---------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------

        if assigned_profile:
            message = (
                "Return request approved and ticket "
                "routed successfully."
            )
        else:
            message = (
                "Return request approved and ticket routing "
                "updated, but no eligible IT Support Specialist "
                "was available."
            )

        return Response(
            {
                "success": True,
                "message": message,
                "request": {
                    "id": return_request.id,
                    "status": return_request.status,
                    "reviewed_at": return_request.reviewed_at,
                },
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "symptom_code": selected_symptom.code,
                    "category": selected_symptom.category.name,
                    "it_department": new_department.name,
                    "assigned_to": (
                        assigned_profile.user.user_code
                        if assigned_profile
                        else None
                    ),
                    "status": ticket.status,
                    "is_under_review": ticket.is_under_review,
                },
            },
            status=status.HTTP_200_OK,
        )


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