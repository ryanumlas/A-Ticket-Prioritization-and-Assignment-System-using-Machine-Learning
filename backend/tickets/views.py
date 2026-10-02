from django.utils import timezone
import time
from django.core.paginator import Paginator
from django.shortcuts import render, get_object_or_404
from .pagination import TicketPagination, WorkloadPagination
from django.db.models import Count
from django.db.models import Q, Subquery, OuterRef
from django.db import transaction
from rest_framework.response import Response
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import (Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketCommentRead, TicketAssistance,  TicketReopenRequest,
                     TicketAssistanceRequest, Keyword, TicketStatusHistory as TicketStatusHistoryModel, TicketReturn, TicketPriorityRequest, TicketEscalation)
from .serializers import (SymptomCodeSerializer, TicketSerializer, CategorySerializer, 
TicketAssistanceSerializer, TicketCommentSerializer, TicketStatusHistory, SLARulesSerializer, TicketAssistanceRequestSerializer,TicketClarificationResubmitSerializer, 
SLARulesUpdateSerializer, KeywordSerializer, KeywordUpdateSerializer, UpdateSymptomCodeSerializer, CreateSymptomCodeSerializer,TicketAssistanceRequestCreateSerializer, 
TicketCreateSerializer, TicketUpdateSerializer, TicketDetailEmployeeSerializer, CategoryUpdateSerializer, FlaggedTicketsListSerializer, TicketAssistanceRequestQueueListSerializer,
FlaggedTicketDetailSerializer, TicketDetailSupportSerializer, TicketStatusHistorySerializer, PriorityChangeRequestSerializer, PriorityRequestListSerializer, 
PriorityRequestDetailSerializer, ReturnTicketSerializer, ReturnedTicketRequestListSerializer, ReturnedTicketDetailSerializer, ApproveReturnTicketSerializer, 
ServiceDeskDepartmentSerializer, RejectReturnTicketSerializer, EmployeeCurrentActiveTicketSerializer, SupervisorEscalatedTicketSerializer)
from users.models import User, ITSupportProfile, Notifications, AuditLogs, ITServiceDeskProfile, ITSupervisorProfile, SystemAdministratorProfile
from users.services import create_notification
from .services import predict_ticket, assign_ticket_automatically, get_current_workload, WORKLOAD_STATUSES
from ai.models import TicketAnalysis, TicketAIAnalysis
from ai.services import analyze_ticket
from departments.models import ITDepartment
from tickets.services import classify_ticket, calculate_priority, update_sla, finalize_ticket_classification, calculate_priority_details, get_eligible_technicians

# Create your views here.

# --- Ticket Views ---
class CreateTicketView(generics.CreateAPIView):
    queryset = Ticket.objects.all()
    serializer_class = TicketCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        ticket = serializer.instance

        automation_result = getattr(
            ticket,
            "_automation_result",
            None,
        )

        response_data = {
            "success": True,
            "message": "Ticket submitted successfully!",
            "ticket_id": ticket.id,
            "ticket_code": ticket.ticket_code,
            "automation": automation_result,
        }

        return Response(
            response_data,
            status=status.HTTP_201_CREATED,
        )

    def notify_service_desk(self, ticket, message, created_by):
        service_desk_profiles = ITServiceDeskProfile.objects.select_related(
            "user"
        ).all()

        for profile in service_desk_profiles:
            create_notification(
                user=profile.user,
                ticket=ticket,
                notification_type=Notifications.NotificationType.REVIEW_REQUIRED,
                message=message,
                created_by=created_by,
            )

    @transaction.atomic
    def perform_create(self, serializer):
        profile = self.request.user.profile

        ticket = serializer.save(
            submitted_by=self.request.user,
            employee_department=profile.employee_department,
            office_location=profile.office_location,
        )

        AuditLogs.objects.create(
            user=self.request.user,
            module="Tickets",
            action="TICKET_CREATED",
            reference_id=ticket.ticket_code,
            remarks="Ticket submitted successfully.",
            created_by=self.request.user,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.CREATED,
            new_value=ticket.status,
            changed_by=self.request.user,
            created_by=self.request.user,
            visibility=TicketStatusHistory.Visibility.ALL,
        )

        analysis = analyze_ticket(ticket)

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": analysis.get(
                    "cleaned_text",
                    "",
                ),
                "summary": analysis.get(
                    "summary",
                    "",
                ),
                "keywords": analysis.get(
                    "keywords",
                    [],
                ),
                "model_version": "gemini-2.5-flash",
                "business_critical": analysis.get(
                    "business_critical",
                    False,
                ),
                "is_time_critical": analysis.get(
                    "is_time_critical",
                    False,
                ),
                "is_unclear": analysis.get(
                    "is_unclear",
                    False,
                ),
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
                    visibility=TicketStatusHistory.Visibility.ALL,
                )

            self.notify_service_desk(
                ticket=ticket,
                message=(
                    f"Ticket {ticket.ticket_code} requires "
                    "Service Desk review before it can be assigned."
                ),
                created_by=self.request.user,
            )

            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=Notifications.NotificationType.REVIEW_REQUIRED,
                message=(
                    f"Your ticket {ticket.ticket_code} requires "
                    "Service Desk review before it can be assigned."
                ),
                created_by=self.request.user,
            )

            ticket._automation_result = {
                "status": "completed",
                "method": "rule_based",
                "symptom_code": None,
                "required_specialization": None,
                "required_specialization_id": None,
                "department": None,
                "priority": None,
                "priority_assessment": None,
                "processing_time": 0,
                "matched_keywords": [],
                "best_score": 0,
                "assignment": {
                    "status": "unassigned",
                    "technician": None,
                    "reason": (
                        "Ticket requires Service Desk review "
                        "because the description is unclear."
                    ),
                },
                "department_candidates": 0,
                "available_candidates": 0,
                "exact_specialization_matches": 0,
                "technicians_considered": [],
            }

            return

        used_ml = False

        result = classify_ticket(ticket)

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
                    reason=ReviewFlags.Reasons.LOW_CONFIDENCE,
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
                        visibility=TicketStatusHistory.Visibility.ALL,
                    )

                self.notify_service_desk(
                    ticket=ticket,
                    message=(
                        f"Ticket {ticket.ticket_code} requires "
                        "Service Desk review before it can be assigned."
                    ),
                    created_by=self.request.user,
                )

                create_notification(
                    user=ticket.submitted_by,
                    ticket=ticket,
                    notification_type=Notifications.NotificationType.REVIEW_REQUIRED,
                    message=(
                        f"Your ticket {ticket.ticket_code} requires "
                        "Service Desk review before it can be assigned."
                    ),
                    created_by=self.request.user,
                )

                ticket._automation_result = {
                    "status": "completed",
                    "method": "rule_based",
                    "symptom_code": None,
                    "required_specialization": None,
                    "required_specialization_id": None,
                    "department": None,
                    "priority": None,
                    "priority_assessment": None,
                    "processing_time": 0,
                    "matched_keywords": result.get(
                        "matched_keywords",
                        [],
                    ),
                    "best_score": result.get(
                        "best_score",
                        0,
                    ),
                    "assignment": {
                        "status": "unassigned",
                        "technician": None,
                        "reason": (
                            "No symptom code could be identified. "
                            "Ticket requires Service Desk review."
                        ),
                    },
                    "department_candidates": 0,
                    "available_candidates": 0,
                    "exact_specialization_matches": 0,
                    "technicians_considered": [],
                }

                return

            if ml_result["requires_review"]:
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
                        visibility=TicketStatusHistory.Visibility.ALL,
                    )

                self.notify_service_desk(
                    ticket=ticket,
                    message=(
                        f"Ticket {ticket.ticket_code} requires "
                        "Service Desk review before it can be assigned."
                    ),
                    created_by=self.request.user,
                )

                create_notification(
                    user=ticket.submitted_by,
                    ticket=ticket,
                    notification_type=Notifications.NotificationType.REVIEW_REQUIRED,
                    message=(
                        f"Your ticket {ticket.ticket_code} requires "
                        "Service Desk review before it can be assigned."
                    ),
                    created_by=self.request.user,
                )

                ticket._automation_result = {
                    "status": "completed",
                    "method": "machine_learning",
                    "symptom_code": symptom.code,
                    "required_specialization": (
                        str(symptom.required_specialization)
                        if symptom.required_specialization
                        else None
                    ),
                    "required_specialization_id": (
                        getattr(
                            symptom.required_specialization,
                            "id",
                            None,
                        )
                        if symptom.required_specialization
                        else None
                    ),
                    "department": None,
                    "priority": None,
                    "priority_assessment": None,
                    "processing_time": 0,
                    "matched_keywords": result.get(
                        "matched_keywords",
                        [],
                    ),
                    "best_score": result.get(
                        "best_score",
                        0,
                    ),
                    "assignment": {
                        "status": "unassigned",
                        "technician": None,
                        "reason": (
                            "Ticket classification requires "
                            "Service Desk review."
                        ),
                    },
                    "department_candidates": 0,
                    "available_candidates": 0,
                    "exact_specialization_matches": 0,
                    "technicians_considered": [],
                }

                return

        category = symptom.category if symptom else None

        department = category.it_department if category else None

        if not department:
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
                    visibility=TicketStatusHistory.Visibility.ALL,
                )

            self.notify_service_desk(
                ticket=ticket,
                message=(
                    f"Ticket {ticket.ticket_code} requires "
                    "Service Desk review before it can be assigned."
                ),
                created_by=self.request.user,
            )

            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=Notifications.NotificationType.REVIEW_REQUIRED,
                message=(
                    f"Your ticket {ticket.ticket_code} requires "
                    "Service Desk review before it can be assigned."
                ),
                created_by=self.request.user,
            )

            ticket._automation_result = {
                "status": "completed",
                "method": (
                    "machine_learning"
                    if used_ml
                    else "rule_based"
                ),
                "symptom_code": symptom.code,
                "required_specialization": (
                    str(symptom.required_specialization)
                    if symptom.required_specialization
                    else None
                ),
                "required_specialization_id": (
                    getattr(
                        symptom.required_specialization,
                        "id",
                        None,
                    )
                    if symptom.required_specialization
                    else None
                ),
                "department": None,
                "priority": None,
                "priority_assessment": None,
                "processing_time": 0,
                "matched_keywords": result.get(
                    "matched_keywords",
                    [],
                ),
                "best_score": result.get(
                    "best_score",
                    0,
                ),
                "assignment": {
                    "status": "unassigned",
                    "technician": None,
                    "reason": (
                        "No IT department could be determined. "
                        "Ticket requires Service Desk review."
                    ),
                },
                "department_candidates": 0,
                "available_candidates": 0,
                "exact_specialization_matches": 0,
                "technicians_considered": [],
            }

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

        priority_details = calculate_priority_details(
            symptom.based_priority,
            ticket.affected_scope,
            analysis.get("business_critical", False),
            analysis.get("is_time_critical", False),
        )

        final_priority = priority_details["final_priority"]

        sla_rule = SLARules.objects.filter(
            priority_level=final_priority
        ).first()

        if sla_rule:
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

        update_sla(ticket)

        assigned_profile = assign_ticket_automatically(ticket)

        automation_result = getattr(
            ticket,
            "_automation_result",
            None,
        )

        if automation_result is not None:
            automation_result["matched_keywords"] = result.get(
                "matched_keywords",
                [],
            )
            automation_result["best_score"] = result.get(
                "best_score",
                0,
            )
            automation_result["priority_assessment"] = priority_details

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
                    f"Your ticket {ticket.ticket_code} has been "
                    f"submitted and assigned to {technician_name}."
                ),
                created_by=self.request.user,
            )

            create_notification(
                user=assigned_profile.user,
                ticket=ticket,
                notification_type=Notifications.NotificationType.TICKET_ASSIGNED,
                message=(
                    f"Ticket {ticket.ticket_code} has been "
                    "assigned to you."
                ),
                created_by=self.request.user,
            )

        ticket._automation_result = automation_result


class ResubmitClarificationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, ticket_id):
        # ============================================================
        # 1. GET + LOCK TICKET
        # ============================================================

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(
                id=ticket_id,
                submitted_by=request.user,
            )
            .first()
        )

        if not ticket:
            return Response(
                {
                    "success": False,
                    "message": (
                        "Ticket not found or you do not have "
                        "permission to update it."
                    ),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if ticket.status in [
            Ticket.TicketStatus.RESOLVED,
            Ticket.TicketStatus.CLOSED,
            Ticket.TicketStatus.CANCELLED,
        ]:
            return Response(
                {
                    "success": False,
                    "message": (
                        "This ticket can no longer be resubmitted."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ============================================================
        # 2. FIND ORIGINAL UNCLEAR-DESCRIPTION FLAG
        # ============================================================

        review_flag = (
            ReviewFlags.objects
            .filter(
                ticket=ticket,
                reason=ReviewFlags.Reasons.UNCLEAR_DESCRIPTION,
                status=ReviewFlags.Status.PENDING,
            )
            .order_by("-created_at")
            .first()
        )

        if not review_flag:
            return Response(
                {
                    "success": False,
                    "message": (
                        "This ticket has no pending "
                        "unclear-description review."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ============================================================
        # 3. MAKE SURE SERVICE DESK REQUESTED CLARIFICATION
        # ============================================================

        clarification_requested = (
            TicketStatusHistoryModel.objects
            .filter(
                ticket=ticket,
                remarks__icontains="requested clarification",
            )
            .exists()
        )

        if not clarification_requested:
            return Response(
                {
                    "success": False,
                    "message": (
                        "The Service Desk has not requested "
                        "clarification for this ticket."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Keep the status before processing so we can record history.
        old_status = ticket.status

        # ============================================================
        # 4. VALIDATE + SAVE EMPLOYEE RESUBMISSION
        # ============================================================

        serializer = TicketClarificationResubmitSerializer(
            ticket,
            data=request.data,
            partial=False,
        )

        serializer.is_valid(raise_exception=True)

        ticket = serializer.save(
            updated_by=request.user
        )

        # ============================================================
        # 5. RUN GEMINI ANALYSIS AGAIN
        # ============================================================

        analysis = analyze_ticket(ticket)

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": analysis.get(
                    "cleaned_text",
                    "",
                ),
                "summary": analysis.get(
                    "summary",
                    "",
                ),
                "keywords": analysis.get(
                    "keywords",
                    [],
                ),
                "model_version": "gemini-2.5-flash",
                "business_critical": analysis.get(
                    "business_critical",
                    False,
                ),
                "is_time_critical": analysis.get(
                    "is_time_critical",
                    False,
                ),
                "is_unclear": analysis.get(
                    "is_unclear",
                    False,
                ),
            },
        )

        # ============================================================
        # 6. STILL UNCLEAR?
        #
        # If yes:
        # - Keep original UNCLEAR_DESCRIPTION flag pending.
        # - Keep ticket UNDER_REVIEW.
        # - Do NOT classify yet.
        # - Modal remains compatible with this response.
        # ============================================================

        if analysis.get("is_unclear", False):
            ticket.is_under_review = True
            ticket.status = Ticket.TicketStatus.UNDER_REVIEW

            ticket.save(
                update_fields=[
                    "is_under_review",
                    "status",
                    "updated_at",
                ]
            )

            automation_result = {
                "status": "completed",
                "method": "rule_based",
                "symptom_code": None,
                "required_specialization": None,
                "required_specialization_id": None,
                "department": None,
                "priority": None,
                "priority_assessment": None,
                "processing_time": 0,
                "matched_keywords": [],
                "best_score": 0,
                "assignment": {
                    "status": "unassigned",
                    "technician": None,
                    "reason": (
                        "Ticket still requires Service Desk "
                        "review because the description is unclear."
                    ),
                },
                "department_candidates": 0,
                "available_candidates": 0,
                "exact_specialization_matches": 0,
                "technicians_considered": [],
            }

            ticket._automation_result = automation_result

            AuditLogs.objects.create(
                user=request.user,
                module="Tickets",
                action="TICKET_RESUBMITTED",
                reference_id=ticket.ticket_code,
                remarks=(
                    "Employee resubmitted ticket, but additional "
                    "clarification is still required."
                ),
                created_by=request.user,
            )

            TicketStatusHistoryModel.objects.create(
                ticket=ticket,
                event_type=(
                    TicketStatusHistoryModel.EventType.STATUS_CHANGED
                ),
                old_value=old_status,
                new_value=ticket.status,
                remarks=(
                    "Ticket resubmitted after clarification, "
                    "but the description is still unclear."
                ),
                changed_by=request.user,
                created_by=request.user,
                visibility=(
                    TicketStatusHistoryModel.Visibility.ALL
                ),
            )

            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.REVIEW_REQUIRED
                ),
                message=(
                    f"Ticket {ticket.ticket_code} still needs "
                    "more information. Please provide additional "
                    "details."
                ),
                created_by=request.user,
            )

            return Response(
                {
                    "success": True,
                    "message": (
                        "Ticket resubmitted, but further "
                        "clarification is required."
                    ),
                    "ticket_id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "status": ticket.status,
                    "review_flag_status": review_flag.status,
                    "automation": automation_result,
                },
                status=status.HTTP_200_OK,
            )

        # ============================================================
        # 7. DESCRIPTION IS NOW CLEAR
        #
        # IMPORTANT:
        # Resolve the OLD UNCLEAR_DESCRIPTION flag NOW.
        #
        # Anything after this point is a CLASSIFICATION problem,
        # not a clarification problem.
        # ============================================================

        review_flag.status = ReviewFlags.Status.RESOLVED
        review_flag.reviewed_by = request.user
        review_flag.reviewed_at = timezone.now()

        review_flag.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        # ============================================================
        # 8. RULE-BASED CLASSIFICATION
        # ============================================================

        used_ml = False

        result = classify_ticket(ticket)

        symptom = (
            SymptomCode.objects
            .filter(
                code=result.get("symptom_code")
            )
            .first()
        )

        # ============================================================
        # 9. RULE-BASED FAILED -> ML FALLBACK
        # ============================================================

        if not symptom:
            used_ml = True

            ml_result = predict_ticket(ticket)

            symptom = (
                SymptomCode.objects
                .filter(
                    code=ml_result.get("predicted_code")
                )
                .first()
            )

            # ========================================================
            # 9A. ML COULD NOT PRODUCE A VALID SYMPTOM
            # ========================================================

            if not symptom:
                ticket.is_under_review = True
                ticket.status = Ticket.TicketStatus.UNDER_REVIEW

                ticket.save(
                    update_fields=[
                        "is_under_review",
                        "status",
                        "updated_at",
                    ]
                )

                automation_result = {
                    "status": "completed",
                    "method": "machine_learning",
                    "symptom_code": None,
                    "required_specialization": None,
                    "required_specialization_id": None,
                    "department": None,
                    "priority": None,
                    "priority_assessment": None,
                    "processing_time": 0,
                    "matched_keywords": result.get(
                        "matched_keywords",
                        [],
                    ),
                    "best_score": result.get(
                        "best_score",
                        0,
                    ),
                    "assignment": {
                        "status": "unassigned",
                        "technician": None,
                        "reason": (
                            "No symptom code could be identified. "
                            "Ticket requires Service Desk review."
                        ),
                    },
                    "department_candidates": 0,
                    "available_candidates": 0,
                    "exact_specialization_matches": 0,
                    "technicians_considered": [],
                }

                ticket._automation_result = automation_result

                # Notify Service Desk.
                service_desk_profiles = (
                    ITServiceDeskProfile.objects
                    .select_related("user")
                    .all()
                )

                for profile in service_desk_profiles:
                    create_notification(
                        user=profile.user,
                        ticket=ticket,
                        notification_type=(
                            Notifications
                            .NotificationType
                            .REVIEW_REQUIRED
                        ),
                        message=(
                            f"Ticket {ticket.ticket_code} "
                            "requires Service Desk review "
                            "after employee resubmission."
                        ),
                        created_by=request.user,
                    )

                create_notification(
                    user=ticket.submitted_by,
                    ticket=ticket,
                    notification_type=(
                        Notifications
                        .NotificationType
                        .REVIEW_REQUIRED
                    ),
                    message=(
                        f"Your ticket {ticket.ticket_code} "
                        "has been resubmitted and requires "
                        "Service Desk classification review."
                    ),
                    created_by=request.user,
                )

                AuditLogs.objects.create(
                    user=request.user,
                    module="Tickets",
                    action="TICKET_RESUBMITTED",
                    reference_id=ticket.ticket_code,
                    remarks=(
                        "Employee resubmitted ticket. "
                        "Description is clear, but no symptom "
                        "code could be identified."
                    ),
                    created_by=request.user,
                )

                TicketStatusHistoryModel.objects.create(
                    ticket=ticket,
                    event_type=(
                        TicketStatusHistoryModel
                        .EventType
                        .STATUS_CHANGED
                    ),
                    old_value=old_status,
                    new_value=ticket.status,
                    remarks=(
                        "Ticket resubmitted after clarification. "
                        "The unclear-description review was "
                        "resolved, but classification requires "
                        "Service Desk review."
                    ),
                    changed_by=request.user,
                    created_by=request.user,
                    visibility=(
                        TicketStatusHistoryModel
                        .Visibility
                        .ALL
                    ),
                )

                return Response(
                    {
                        "success": True,
                        "message": (
                            "Ticket resubmitted and requires "
                            "Service Desk review."
                        ),
                        "ticket_id": ticket.id,
                        "ticket_code": ticket.ticket_code,
                        "status": ticket.status,
                        "review_flag_status": (
                            review_flag.status
                        ),
                        "automation": automation_result,
                    },
                    status=status.HTTP_200_OK,
                )

            # ========================================================
            # 9B. ML FOUND SYMPTOM BUT CONFIDENCE IS LOW
            #
            # predict_ticket() already creates LOW_CONFIDENCE
            # ReviewFlags when requires_review=True.
            #
            # DO NOT reactivate UNCLEAR_DESCRIPTION.
            # ========================================================

            if ml_result.get("requires_review", False):
                ticket.is_under_review = True
                ticket.status = Ticket.TicketStatus.UNDER_REVIEW

                ticket.save(
                    update_fields=[
                        "is_under_review",
                        "status",
                        "updated_at",
                    ]
                )

                automation_result = {
                    "status": "completed",
                    "method": "machine_learning",
                    "symptom_code": symptom.code,
                    "required_specialization": (
                        str(
                            symptom.required_specialization
                        )
                        if symptom.required_specialization
                        else None
                    ),
                    "required_specialization_id": (
                        getattr(
                            symptom.required_specialization,
                            "id",
                            None,
                        )
                        if symptom.required_specialization
                        else None
                    ),
                    "department": None,
                    "priority": None,
                    "priority_assessment": None,
                    "processing_time": 0,
                    "matched_keywords": result.get(
                        "matched_keywords",
                        [],
                    ),
                    "best_score": result.get(
                        "best_score",
                        0,
                    ),
                    "assignment": {
                        "status": "unassigned",
                        "technician": None,
                        "reason": (
                            "Ticket classification requires "
                            "Service Desk review because the "
                            "machine-learning confidence is low."
                        ),
                    },
                    "department_candidates": 0,
                    "available_candidates": 0,
                    "exact_specialization_matches": 0,
                    "technicians_considered": [],
                }

                ticket._automation_result = automation_result

                # Notify Service Desk.
                service_desk_profiles = (
                    ITServiceDeskProfile.objects
                    .select_related("user")
                    .all()
                )

                for profile in service_desk_profiles:
                    create_notification(
                        user=profile.user,
                        ticket=ticket,
                        notification_type=(
                            Notifications
                            .NotificationType
                            .REVIEW_REQUIRED
                        ),
                        message=(
                            f"Ticket {ticket.ticket_code} "
                            "requires Service Desk review "
                            "because the ML classification "
                            "confidence is low."
                        ),
                        created_by=request.user,
                    )

                create_notification(
                    user=ticket.submitted_by,
                    ticket=ticket,
                    notification_type=(
                        Notifications
                        .NotificationType
                        .REVIEW_REQUIRED
                    ),
                    message=(
                        f"Your ticket {ticket.ticket_code} "
                        "has been resubmitted and is being "
                        "reviewed by the Service Desk."
                    ),
                    created_by=request.user,
                )

                AuditLogs.objects.create(
                    user=request.user,
                    module="Tickets",
                    action="TICKET_RESUBMITTED",
                    reference_id=ticket.ticket_code,
                    remarks=(
                        "Employee resubmitted ticket. "
                        "Description is clear, but ML "
                        "classification requires review."
                    ),
                    created_by=request.user,
                )

                TicketStatusHistoryModel.objects.create(
                    ticket=ticket,
                    event_type=(
                        TicketStatusHistoryModel
                        .EventType
                        .STATUS_CHANGED
                    ),
                    old_value=old_status,
                    new_value=ticket.status,
                    remarks=(
                        "Ticket resubmitted after clarification. "
                        "The unclear-description review was "
                        "resolved. ML classification requires "
                        "Service Desk review."
                    ),
                    changed_by=request.user,
                    created_by=request.user,
                    visibility=(
                        TicketStatusHistoryModel
                        .Visibility
                        .ALL
                    ),
                )

                return Response(
                    {
                        "success": True,
                        "message": (
                            "Ticket resubmitted and requires "
                            "Service Desk review."
                        ),
                        "ticket_id": ticket.id,
                        "ticket_code": ticket.ticket_code,
                        "status": ticket.status,
                        "review_flag_status": (
                            review_flag.status
                        ),
                        "automation": automation_result,
                    },
                    status=status.HTTP_200_OK,
                )

        # ============================================================
        # 10. GET CATEGORY + DEPARTMENT
        # ============================================================

        category = (
            symptom.category
            if symptom
            else None
        )

        department = (
            category.it_department
            if category
            else None
        )

        # ============================================================
        # 11. NO ROUTABLE DEPARTMENT
        #
        # This is NOT an unclear-description problem.
        # The original unclear flag remains RESOLVED.
        # ============================================================

        if not department:
            ticket.is_under_review = True
            ticket.status = Ticket.TicketStatus.UNDER_REVIEW

            ticket.save(
                update_fields=[
                    "is_under_review",
                    "status",
                    "updated_at",
                ]
            )

            automation_result = {
                "status": "completed",
                "method": (
                    "machine_learning"
                    if used_ml
                    else "rule_based"
                ),
                "symptom_code": symptom.code,
                "required_specialization": (
                    str(
                        symptom.required_specialization
                    )
                    if symptom.required_specialization
                    else None
                ),
                "required_specialization_id": (
                    getattr(
                        symptom.required_specialization,
                        "id",
                        None,
                    )
                    if symptom.required_specialization
                    else None
                ),
                "department": None,
                "priority": None,
                "priority_assessment": None,
                "processing_time": 0,
                "matched_keywords": result.get(
                    "matched_keywords",
                    [],
                ),
                "best_score": result.get(
                    "best_score",
                    0,
                ),
                "assignment": {
                    "status": "unassigned",
                    "technician": None,
                    "reason": (
                        "No IT department could be determined. "
                        "Ticket requires Service Desk review."
                    ),
                },
                "department_candidates": 0,
                "available_candidates": 0,
                "exact_specialization_matches": 0,
                "technicians_considered": [],
            }

            ticket._automation_result = automation_result

            service_desk_profiles = (
                ITServiceDeskProfile.objects
                .select_related("user")
                .all()
            )

            for profile in service_desk_profiles:
                create_notification(
                    user=profile.user,
                    ticket=ticket,
                    notification_type=(
                        Notifications
                        .NotificationType
                        .REVIEW_REQUIRED
                    ),
                    message=(
                        f"Ticket {ticket.ticket_code} "
                        "requires Service Desk review because "
                        "no IT department could be determined."
                    ),
                    created_by=request.user,
                )

            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications
                    .NotificationType
                    .REVIEW_REQUIRED
                ),
                message=(
                    f"Your ticket {ticket.ticket_code} "
                    "has been resubmitted and is being "
                    "reviewed by the Service Desk."
                ),
                created_by=request.user,
            )

            AuditLogs.objects.create(
                user=request.user,
                module="Tickets",
                action="TICKET_RESUBMITTED",
                reference_id=ticket.ticket_code,
                remarks=(
                    "Employee resubmitted ticket. "
                    "Description is clear, but no IT "
                    "department could be determined."
                ),
                created_by=request.user,
            )

            TicketStatusHistoryModel.objects.create(
                ticket=ticket,
                event_type=(
                    TicketStatusHistoryModel
                    .EventType
                    .STATUS_CHANGED
                ),
                old_value=old_status,
                new_value=ticket.status,
                remarks=(
                    "Ticket resubmitted after clarification. "
                    "The unclear-description review was resolved, "
                    "but routing requires Service Desk review."
                ),
                changed_by=request.user,
                created_by=request.user,
                visibility=(
                    TicketStatusHistoryModel
                    .Visibility
                    .ALL
                ),
            )

            return Response(
                {
                    "success": True,
                    "message": (
                        "Ticket resubmitted but requires "
                        "Service Desk review."
                    ),
                    "ticket_id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "status": ticket.status,
                    "review_flag_status": review_flag.status,
                    "automation": automation_result,
                },
                status=status.HTTP_200_OK,
            )

        # ============================================================
        # 12. APPLY CLASSIFICATION
        # ============================================================

        ticket.symptom_code = symptom
        ticket.category = category
        ticket.it_department = department

        # ============================================================
        # 13. SAVE RULE-BASED ANALYSIS RECORD
        #
        # ML already creates/updates TicketAnalysis inside
        # predict_ticket().
        # ============================================================

        if not used_ml:
            TicketAnalysis.objects.update_or_create(
                ticket=ticket,
                defaults={
                    "model_type": (
                        TicketAnalysis.ModelType.RULE_BASED
                    ),
                    "model_used": (
                        "Rule-Based Classifier"
                    ),
                    "predicted_symptom_code": symptom,
                    "created_by": request.user,
                },
            )

        # ============================================================
        # 14. PRIORITY CALCULATION
        # ============================================================

        priority_details = calculate_priority_details(
            symptom.based_priority,
            ticket.affected_scope,
            analysis.get(
                "business_critical",
                False,
            ),
            analysis.get(
                "is_time_critical",
                False,
            ),
        )

        final_priority = priority_details[
            "final_priority"
        ]

        # ============================================================
        # 15. SLA
        # ============================================================

        sla_rule = (
            SLARules.objects
            .filter(
                priority_level=final_priority
            )
            .first()
        )

        if not sla_rule:
            return Response(
                {
                    "success": False,
                    "message": (
                        "No matching SLA rule exists for "
                        "the calculated priority."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket.priority = sla_rule

        ticket.response_deadline = (
            ticket.created_at +
            sla_rule.response_time
        )

        ticket.resolution_deadline = (
            ticket.created_at +
            sla_rule.resolution_time
        )

        # Ticket has successfully returned to normal workflow.
        ticket.is_under_review = False
        ticket.status = Ticket.TicketStatus.OPEN

        ticket.save()

        update_sla(ticket)


        assigned_profile = assign_ticket_automatically(
            ticket
        )

        # assign_ticket_automatically() creates the base
        # automation result on the ticket.
        automation_result = getattr(
            ticket,
            "_automation_result",
            None,
        )

        if automation_result is None:
            automation_result = {
                "status": "completed",
                "method": (
                    "machine_learning"
                    if used_ml
                    else "rule_based"
                ),
                "symptom_code": symptom.code,
                "required_specialization": (
                    str(
                        symptom.required_specialization
                    )
                    if symptom.required_specialization
                    else None
                ),
                "required_specialization_id": (
                    getattr(
                        symptom.required_specialization,
                        "id",
                        None,
                    )
                    if symptom.required_specialization
                    else None
                ),
                "department": (
                    str(department)
                    if department
                    else None
                ),
                "priority": final_priority,
                "priority_assessment": (
                    priority_details
                ),
                "processing_time": 0,
                "matched_keywords": result.get(
                    "matched_keywords",
                    [],
                ),
                "best_score": result.get(
                    "best_score",
                    0,
                ),
                "assignment": {
                    "status": (
                        "assigned"
                        if assigned_profile
                        else "unassigned"
                    ),
                    "technician": None,
                    "reason": None,
                },
                "department_candidates": 0,
                "available_candidates": 0,
                "exact_specialization_matches": 0,
                "technicians_considered": [],
            }

        else:
            automation_result["method"] = (
                "machine_learning"
                if used_ml
                else "rule_based"
            )

            automation_result[
                "matched_keywords"
            ] = result.get(
                "matched_keywords",
                [],
            )

            automation_result[
                "best_score"
            ] = result.get(
                "best_score",
                0,
            )

            automation_result[
                "priority_assessment"
            ] = priority_details

        ticket._automation_result = automation_result


        AuditLogs.objects.create(
            user=request.user,
            module="Tickets",
            action="TICKET_RESUBMITTED",
            reference_id=ticket.ticket_code,
            remarks=(
                "Employee resubmitted ticket after "
                "clarification. The ticket was reanalyzed "
                "and returned to the automated workflow."
            ),
            created_by=request.user,
        )


        TicketStatusHistoryModel.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistoryModel
                .EventType
                .STATUS_CHANGED
            ),
            old_value=old_status,
            new_value=ticket.status,
            remarks=(
                "Ticket resubmitted after clarification. "
                "The unclear-description review was resolved "
                "and automated processing completed."
            ),
            changed_by=request.user,
            created_by=request.user,
            visibility=(
                TicketStatusHistoryModel
                .Visibility
                .ALL
            ),
        )

        if assigned_profile:
            technician_name = (
                f"{assigned_profile.user.first_name} "
                f"{assigned_profile.user.last_name}"
            ).strip() or assigned_profile.user.username

            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications
                    .NotificationType
                    .REVIEW_COMPLETED
                ),
                message=(
                    f"Your ticket {ticket.ticket_code} "
                    "has been reviewed after resubmission "
                    f"and assigned to {technician_name}."
                ),
                created_by=request.user,
            )

            create_notification(
                user=assigned_profile.user,
                ticket=ticket,
                notification_type=(
                    Notifications
                    .NotificationType
                    .TICKET_ASSIGNED
                ),
                message=(
                    f"Ticket {ticket.ticket_code} "
                    "has been assigned to you."
                ),
                created_by=request.user,
            )

        else:
            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications
                    .NotificationType
                    .REVIEW_COMPLETED
                ),
                message=(
                    f"Your ticket {ticket.ticket_code} "
                    "has been reviewed after resubmission "
                    "and returned to the normal workflow."
                ),
                created_by=request.user,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Ticket resubmitted successfully."
                ),
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "status": ticket.status,
                "review_flag_status": review_flag.status,
                "assigned": (
                    assigned_profile is not None
                ),
                "automation": automation_result,
            },
            status=status.HTTP_200_OK,
        )

class PendingClarificationRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        clarification = (
            ReviewFlags.objects
            .filter(
                ticket__submitted_by=request.user,
                status=ReviewFlags.Status.PENDING,
                reason=ReviewFlags.Reasons.UNCLEAR_DESCRIPTION,
            )
            .select_related("ticket")
            .order_by("-id")
            .first()
        )

        if not clarification:
            return Response(
                {"pending": False},
                status=status.HTTP_200_OK,
            )

        ticket = clarification.ticket

        return Response(
            {
                "pending": True,
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "subject": ticket.subject,
                },
            },
            status=status.HTTP_200_OK,
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

class RequestTicketReopenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        reason = request.data.get("reason", "").strip()

        if len(reason) < 10:
            return Response(
                {"error": "Please provide a reason with at least 10 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(reason) > 1000:
            return Response(
                {"error": "The reason cannot exceed 1000 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            ticket = (
                Ticket.objects
                .select_for_update()
                .filter(pk=pk, submitted_by=request.user)
                .first()
            )

            if not ticket:
                return Response(
                    {"error": "Ticket not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if ticket.status != Ticket.TicketStatus.RESOLVED:
                return Response(
                    {"error": "Only resolved tickets can be reopened. Closed tickets require a new ticket."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            pending_exists = TicketReopenRequest.objects.filter(
                ticket=ticket,
                status=TicketReopenRequest.RequestStatus.PENDING,
            ).exists()

            if pending_exists:
                return Response(
                    {"error": "This ticket already has a pending reopen request."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reopen_request = TicketReopenRequest.objects.create(
                ticket=ticket,
                requested_by=request.user,
                reason=reason,
            )

            AuditLogs.objects.create(
                user=request.user,
                module="Tickets",
                action="REOPEN_REQUESTED",
                reference_id=ticket.ticket_code,
                remarks=f"Reopen request submitted: {reason}",
                created_by=request.user,
            )

            # Notify IT Support Specialists in the ticket's department.
            support_profiles = ITSupportProfile.objects.filter(
                it_department=ticket.it_department,
            ).select_related("user")

            for profile in support_profiles:
                create_notification(
                    user=profile.user,
                    ticket=ticket,
                    notification_type=Notifications.NotificationType.REVIEW_REQUIRED,
                    message=(
                        f"Ticket {ticket.ticket_code} has a pending "
                        "reopen request that requires review."
                    ),
                    created_by=request.user,
                )

        return Response(
            {
                "message": "Your reopen request has been submitted.",
                "request_id": reopen_request.id,
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "status": reopen_request.status,
                "reason": reopen_request.reason,
            },
            status=status.HTTP_201_CREATED,
        )


class ReopenRequestsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = (
            ITSupportProfile.objects
            .select_related("user", "it_department")
            .filter(user=request.user)
            .first()
        )

        if not profile:
            return Response(
                {"error": "Only IT Support Specialists can view reopen requests."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if not profile.it_department:
            return Response({"results": []}, status=status.HTTP_200_OK)

        reopen_requests = (
            TicketReopenRequest.objects
            .filter(
                status=TicketReopenRequest.RequestStatus.PENDING,
                ticket__it_department=profile.it_department,
            )
            .select_related(
                "ticket",
                "ticket__submitted_by",
                "ticket__assigned_to",
                "ticket__it_department",
                "requested_by",
                "requested_by__profile",
                "requested_by__profile__employee_department",
            )
            .order_by("requested_at")
        )

        results = []

        for reopen_request in reopen_requests:
            ticket = reopen_request.ticket

            results.append({
                "id": reopen_request.id,
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "ticket_title": ticket.subject,
                "ticket_status": ticket.status,

                # IT department responsible for the ticket
                "department": (
                    ticket.it_department.name
                    if ticket.it_department
                    else None
                ),
                "department_id": ticket.it_department_id,

                # Department belonging to the employee who requested reopening
                "employee_department": (
                    reopen_request.requested_by.profile.employee_department.name
                    if (
                        hasattr(reopen_request.requested_by, "profile")
                        and reopen_request.requested_by.profile.employee_department
                    )
                    else None
                ),

                "requested_by": (
                    reopen_request.requested_by.get_full_name()
                    or reopen_request.requested_by.username
                ),
                "reason": reopen_request.reason,
                "requested_at": reopen_request.requested_at,
                "current_assignee": (
                    ticket.assigned_to.get_full_name()
                    or ticket.assigned_to.username
                    if ticket.assigned_to
                    else None
                ),
                "can_approve": True,
            })

        return Response(
            {"results": results},
            status=status.HTTP_200_OK,
        )

class ReviewTicketReopenRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        decision = request.data.get("decision", "").strip().lower()
        review_remarks = request.data.get("review_remarks", "").strip()

        if decision not in [
            TicketReopenRequest.RequestStatus.APPROVED,
            TicketReopenRequest.RequestStatus.REJECTED,
        ]:
            return Response(
                {"error": "Decision must be 'approved' or 'rejected'."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            decision == TicketReopenRequest.RequestStatus.REJECTED
            and not review_remarks
        ):
            return Response(
                {
                    "error": (
                        "Please provide remarks explaining why "
                        "the request was rejected."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            reopen_request = (
                TicketReopenRequest.objects
                .select_for_update()
                .filter(pk=pk)
                .first()
            )

            if not reopen_request:
                return Response(
                    {"error": "Reopen request not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            ticket = (
                Ticket.objects
                .select_for_update()
                .filter(pk=reopen_request.ticket_id)
                .first()
            )

            if not ticket:
                return Response(
                    {"error": "Ticket not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if reopen_request.status != TicketReopenRequest.RequestStatus.PENDING:
                return Response(
                    {"error": "This reopen request has already been reviewed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Only IT Support Specialists belonging to the ticket's
            # department may approve or reject the request.
            profile = (
                ITSupportProfile.objects
                .select_related("it_department")
                .filter(user=request.user)
                .first()
            )

            if not profile:
                return Response(
                    {
                        "error": (
                            "Only IT Support Specialists can "
                            "review reopen requests."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if (
                not profile.it_department
                or profile.it_department_id != ticket.it_department_id
            ):
                return Response(
                    {
                        "error": (
                            "You can only review requests for "
                            "tickets in your own department."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

            if ticket.status != Ticket.TicketStatus.RESOLVED:
                return Response(
                    {
                        "error": (
                            "This ticket is no longer resolved and "
                            "cannot be reopened through this request."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            old_assignee = ticket.assigned_to
            old_assignee_name = (
                old_assignee.get_full_name() or old_assignee.username
                if old_assignee
                else None
            )

            reopen_request.reviewed_by = request.user
            reopen_request.reviewed_at = timezone.now()
            reopen_request.review_remarks = review_remarks
            reopen_request.status = decision

            if decision == TicketReopenRequest.RequestStatus.APPROVED:
                # The approving technician becomes the new assignee.
                # No availability, specialization, workload, or
                # previous-assignee eligibility check is required.
                ticket.assigned_to = request.user
                ticket.status = Ticket.TicketStatus.IN_PROGRESS
                ticket.resolved_at = None
                ticket.resolved_by = None
                ticket.updated_by = request.user

                ticket.save(
                    update_fields=[
                        "assigned_to",
                        "status",
                        "resolved_at",
                        "resolved_by",
                        "updated_by",
                        "updated_at",
                    ]
                )

                profile.last_assigned_at = timezone.now()
                profile.save(update_fields=["last_assigned_at"])

                technician_name = (
                    request.user.get_full_name()
                    or request.user.username
                )

                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.ASSIGNED,
                    old_value=old_assignee_name,
                    new_value=technician_name,
                    remarks=(
                        "Ticket reassigned following approval of the reopen request."
                    ),
                    visibility=TicketStatusHistory.Visibility.ALL,
                    changed_by=request.user,
                    created_by=request.user,
                )

                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                    old_value=Ticket.TicketStatus.RESOLVED,
                    new_value=Ticket.TicketStatus.IN_PROGRESS,
                    remarks=(
                        f"Reopen request approved. "
                        f"Employee reason: {reopen_request.reason}. "
                    ),
                    visibility=TicketStatusHistory.Visibility.ALL,
                    changed_by=request.user,
                    created_by=request.user,
                )

                update_sla(ticket)

                AuditLogs.objects.create(
                    user=request.user,
                    module="Tickets",
                    action="REOPEN_APPROVED",
                    reference_id=ticket.ticket_code,
                    remarks=(
                        f"Reopen request #{reopen_request.id} approved. "
                        f"Assigned to {technician_name}. "
                        f"Review remarks: {review_remarks or 'None'}"
                    ),
                    created_by=request.user,
                )

            else:
                AuditLogs.objects.create(
                    user=request.user,
                    module="Tickets",
                    action="REOPEN_REJECTED",
                    reference_id=ticket.ticket_code,
                    remarks=(
                        f"Reopen request #{reopen_request.id} rejected. "
                        f"Reason: {reopen_request.reason}. "
                        f"Review remarks: {review_remarks}"
                    ),
                    created_by=request.user,
                )

            reopen_request.save(
                update_fields=[
                    "status",
                    "reviewed_by",
                    "reviewed_at",
                    "review_remarks",
                ]
            )

        return Response(
            {
                "message": (
                    "Reopen request approved. You are now assigned to the ticket."
                    if decision == TicketReopenRequest.RequestStatus.APPROVED
                    else "Reopen request rejected. The ticket remains resolved."
                ),
                "request_id": reopen_request.id,
                "request_status": reopen_request.status,
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "ticket_status": ticket.status,
                "assigned_to": (
                    ticket.assigned_to.username
                    if ticket.assigned_to
                    else None
                ),
            },
            status=status.HTTP_200_OK,
        )
class TicketStatusHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        history = (
            TicketStatusHistory.objects
            .filter(ticket_id=pk)
            .select_related(
                "changed_by",
                "changed_by__it_support_profile",
                "changed_by__it_support_profile__it_department",
            )
            .order_by("-created_at")
        )

        serializer = TicketStatusHistorySerializer(
            history,
            many=True,
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

        statuses_requiring_remarks = [
            Ticket.TicketStatus.RESOLVED,
            Ticket.TicketStatus.CANCELLED,
        ]

        if new_status in statuses_requiring_remarks and not remarks:
            return Response(
                {
                    "error": "Remarks are required when changing the ticket to this status."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
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
                {
                    "message": (
                        "Ticket status is already set to this status"
                    )
                },
                status=status.HTTP_200_OK,
            )

        ticket.save()

        update_sla(ticket)

        old_status_label = dict(
            Ticket.TicketStatus.choices
        ).get(old_status, old_status)

        new_status_label = ticket.get_status_display()

        TicketStatusHistoryModel.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistoryModel.EventType.STATUS_CHANGED,
            old_value=old_status,
            new_value=ticket.status,
            remarks=remarks,
            changed_by=request.user,
            created_by=request.user,
            visibility=TicketStatusHistoryModel.Visibility.ALL,
        )

        AuditLogs.objects.create(
            user=request.user,
            module="Tickets",
            action="STATUS_CHANGED",
            reference_id=str(ticket.id),
            remarks=(
                f"{ticket.ticket_code} · "
                f"{old_status_label} → {new_status_label}"
            ),
            created_by=request.user,
        )

        if ticket.status == Ticket.TicketStatus.RESOLVED:
            notification_type = (
                Notifications.NotificationType.TICKET_RESOLVED
            )

            notification_message = (
                f"Your ticket {ticket.ticket_code} has been resolved."
            )

        elif ticket.status == Ticket.TicketStatus.CLOSED:
            notification_type = (
                Notifications.NotificationType.TICKET_CLOSED
            )

            notification_message = (
                f"Your ticket {ticket.ticket_code} has been closed."
            )

        else:
            notification_type = (
                Notifications.NotificationType.STATUS_UPDATED
            )

            notification_message = (
                f"Your ticket {ticket.ticket_code} status has been "
                f"updated to {ticket.get_status_display()}."
            )

        create_notification(
            user=ticket.submitted_by,
            ticket=ticket,
            notification_type=notification_type,
            message=notification_message,
            created_by=request.user,
        )

        return Response(
            {
                "message": (
                    f"Ticket status updated to {ticket.status}"
                ),
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
                    status=status.HTTP_400_BAD_REQUEST,
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
                    created_by=request.user,
                    visibility=TicketStatusHistory.Visibility.ALL,
                )

            else:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.ASSIGNED,
                    old_value=None,
                    new_value=new_name,
                    changed_by=request.user,
                    created_by=request.user,
                    visibility=TicketStatusHistory.Visibility.ALL,
                )

            if old_status != ticket.status:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                    old_value=old_status,
                    new_value=ticket.status,
                    changed_by=request.user,
                    created_by=request.user,
                    visibility=TicketStatusHistory.Visibility.ALL,
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
                else None,
                "response_sla_status": ticket.response_sla_status,
                "resolution_sla_status": ticket.resolution_sla_status,
            },
            status=status.HTTP_200_OK,
        )


# --- Service Desk ---


class RequestClarificationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, ticket_id):
        ticket = Ticket.objects.select_for_update().filter(
            id=ticket_id
        ).first()

        if not ticket:
            return Response(
                {"success": False, "message": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only IT Service Desk users may request clarification.
        if not ITServiceDeskProfile.objects.filter(
            user=request.user
        ).exists():
            return Response(
                {
                    "success": False,
                    "message": "Only IT Service Desk users can request clarification.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # Find the pending unclear-description review flag.
        review_flag = ReviewFlags.objects.filter(
            ticket=ticket,
            reason=ReviewFlags.Reasons.UNCLEAR_DESCRIPTION,
            status=ReviewFlags.Status.PENDING,
        ).first()

        if not review_flag:
            return Response(
                {
                    "success": False,
                    "message": (
                        "This ticket has no pending Unclear Description review."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent requesting clarification for a completed ticket.
        if ticket.status in [
            Ticket.TicketStatus.RESOLVED,
            Ticket.TicketStatus.CLOSED,
            Ticket.TicketStatus.CANCELLED,
        ]:
            return Response(
                {
                    "success": False,
                    "message": "Clarification cannot be requested for a completed ticket.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()

        # Keep the unclear-description flag pending.
        # The ticket remains under Service Desk review.
        old_status = ticket.status
        ticket.is_under_review = True
        ticket.status = Ticket.TicketStatus.UNDER_REVIEW
        ticket.updated_by = request.user
        ticket.save(
            update_fields=[
                "is_under_review",
                "status",
                "updated_by",
                "updated_at",
            ]
        )

        # Record the clarification request in the ticket history.
        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.REVIEW_COMPLETED,
            old_value=old_status,
            new_value=ticket.status,
            remarks=(
                "IT Service Desk requested clarification from the employee. "
                "The Unclear Description review flag remains pending."
            ),
            changed_by=request.user,
            created_by=request.user,
            visibility=TicketStatusHistory.Visibility.ALL,
        )

        # Notify the employee.
        create_notification(
            user=ticket.submitted_by,
            ticket=ticket,
            notification_type=Notifications.NotificationType.CLARIFICATION_REQUESTED,
            message=(
                f"Please provide more technical details "
                f"about the reported issue so your ticket can be assessed ({ticket.ticket_code})."
            ),
            created_by=request.user,
        )

        return Response(
            {
                "success": True,
                "message": "Clarification requested successfully.",
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "status": ticket.status,
                "review_flag_status": review_flag.status,
            },
            status=status.HTTP_200_OK,
        )


class FlaggedTicketsListView(generics.ListAPIView):
    serializer_class = FlaggedTicketsListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TicketPagination

    def get_queryset(self):
        queryset = (
            ReviewFlags.objects
            .select_related(
                "ticket",
                "ticket__priority",
            )
            .order_by("-created_at")
        )

        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        reason = self.request.query_params.get(
            "reason",
            ""
        ).strip()

        status_filter = self.request.query_params.get(
            "status",
            ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(ticket__ticket_code__icontains=search)
                | Q(ticket__subject__icontains=search)
            )

        if reason:
            queryset = queryset.filter(
                reason=reason
            )

        if status_filter:
            queryset = queryset.filter(
                status=status_filter
            )

        return queryset

class FlaggedTicketDetailView(generics.RetrieveAPIView):
    queryset = ReviewFlags.objects.all()
    serializer_class = FlaggedTicketDetailSerializer
    permission_classes = [IsAuthenticated]
class AcceptPriorityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        remarks = str(request.data.get("remarks") or "").strip()

        if len(remarks) < 30:
            return Response(
                {
                    "detail": "Review remarks must be at least 30 characters.",
                    "remarks": "Please provide at least 30 characters.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                review_flag = (
                    ReviewFlags.objects
                    .select_for_update()
                    .select_related("ticket")
                    .get(pk=pk)
                )
            except ReviewFlags.DoesNotExist:
                return Response(
                    {"detail": "Review flag not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if not review_flag:
                return Response(
                    {"detail": "Review flag not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if review_flag.status != ReviewFlags.Status.PENDING:
                return Response(
                    {
                        "detail": "This review flag has already been resolved."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if review_flag.reason != ReviewFlags.Reasons.PRIORITY_ASSESSMENT:
                return Response(
                    {
                        "detail": "This review flag is not a priority assessment."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            ticket = review_flag.ticket
            prediction = review_flag.prediction

            if not prediction:
                return Response(
                    {
                        "detail": "No AI prediction is associated with this review flag."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            predicted_symptom_code = prediction.predicted_symptom_code

            if not predicted_symptom_code:
                return Response(
                    {
                        "detail": "No predicted symptom code is available."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            ai_analysis = getattr(ticket, "ai_analysis", None)

            if not ai_analysis:
                return Response(
                    {
                        "detail": "No AI analysis is available for this ticket."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            old_priority = (
                ticket.priority.priority_level
                if ticket.priority
                else None
            )

            priority_level = calculate_priority(
                based_priority=predicted_symptom_code.based_priority,
                affected_scope=ticket.affected_scope,
                business_critical=ai_analysis.business_critical,
                time_critical=ai_analysis.is_time_critical,
            )

            try:
                sla_rule = SLARules.objects.get(
                    priority_level=priority_level
                )
            except SLARules.DoesNotExist:
                return Response(
                    {
                        "detail": f"No SLA rule exists for {priority_level}."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            ticket.symptom_code = predicted_symptom_code
            ticket.category = predicted_symptom_code.category

            if predicted_symptom_code.category:
                ticket.it_department = (
                    predicted_symptom_code.category.it_department
                )
            else:
                ticket.it_department = None

            ticket.priority = sla_rule
            ticket.status = Ticket.TicketStatus.OPEN
            ticket.is_under_review = False
            ticket.updated_by = request.user

            ticket.save(
                update_fields=[
                    "symptom_code",
                    "category",
                    "it_department",
                    "priority",
                    "status",
                    "is_under_review",
                    "updated_by",
                    "updated_at",
                ]
            )

            update_sla(ticket)

            review_flag.status = ReviewFlags.Status.RESOLVED
            review_flag.reviewed_by = request.user
            review_flag.reviewed_at = timezone.now()

            review_flag.save(
                update_fields=[
                    "status",
                    "reviewed_by",
                    "reviewed_at",
                    "updated_at",
                ]
            )

            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.REVIEW_COMPLETED,
                old_value="Under Review",
                new_value="Accepted",
                remarks=remarks,
                visibility=TicketStatusHistory.Visibility.INTERNAL,
                created_by=request.user,
                changed_by=request.user,
            )

            if old_priority != priority_level:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.PRIORITY_CHANGED,
                    old_value=old_priority,
                    new_value=priority_level,
                    remarks=remarks,
                    visibility=TicketStatusHistory.Visibility.INTERNAL,
                    created_by=request.user,
                    changed_by=request.user,
                )

            AuditLogs.objects.create(
                user=request.user,
                module="Ticket Review",
                action="Accepted Priority Assessment",
                reference_id=str(ticket.id),
                remarks=remarks,
                created_by=request.user,
            )

            employee = ticket.submitted_by

            Notifications.objects.create(
                user=employee,
                ticket=ticket,
                message=(
                    f"Your ticket {ticket.ticket_code} has been reviewed "
                    f"by the IT Service Desk. The assessed priority is "
                    f"{priority_level}."
                ),
                notification_type=Notifications.NotificationType.REVIEW_COMPLETED,
                created_by=request.user,
                updated_by=request.user,
            )

            technician = assign_ticket_automatically(ticket)

            assignment_data = None

            if technician:
                assignment_data = {
                    "id": technician.id,
                    "name": f"{technician.user.first_name} {technician.user.last_name}".strip(),
                    "username": technician.user.username,
                }

            return Response(
                {
                    "success": True,
                    "message": "Priority assessment accepted successfully.",
                    "review_flag": {
                        "id": review_flag.id,
                        "status": review_flag.status,
                        "reviewed_by": review_flag.reviewed_by_id,
                        "reviewed_by_name": (
                            f"{review_flag.reviewed_by.first_name} "
                            f"{review_flag.reviewed_by.last_name}"
                        ).strip(),
                        "reviewed_by_user_code": (
                            review_flag.reviewed_by.user_code
                            if review_flag.reviewed_by
                            else ""
                        ),
                        "reviewed_by_it_department": (
                            review_flag.reviewed_by.it_support_profile.it_department.name
                            if (
                                review_flag.reviewed_by
                                and hasattr(
                                    review_flag.reviewed_by,
                                    "it_support_profile",
                                )
                                and review_flag.reviewed_by.it_support_profile
                                and review_flag.reviewed_by.it_support_profile.it_department
                            )
                            else ""
                        ),
                        "reviewed_at": review_flag.reviewed_at,
                        "review_remarks": remarks,
                    },
                    "ticket": {
                        "id": ticket.id,
                        "ticket_code": ticket.ticket_code,
                        "priority": ticket.priority.priority_level
                        if ticket.priority
                        else None,
                    },
                },
                status=status.HTTP_200_OK,
            )
class OverridePriorityView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        remarks = str(request.data.get("remarks") or "").strip()
        priority_level = str(request.data.get("priority") or "").strip().upper()

        if len(remarks) < 30:
            return Response(
                {
                    "detail": "Review remarks must be at least 30 characters.",
                    "remarks": "Please provide at least 30 characters.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not priority_level:
            return Response(
                {
                    "detail": "A priority must be selected.",
                    "priority": "Please select a priority.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_priorities = {"P1", "P2", "P3", "P4", "P5"}

        if priority_level not in valid_priorities:
            return Response(
                {
                    "detail": "Invalid priority selected.",
                    "priority": "Priority must be P1, P2, P3, P4, or P5.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            try:
                review_flag = (
                    ReviewFlags.objects
                    .select_for_update()
                    .select_related("ticket")
                    .get(pk=pk)
                )
            except ReviewFlags.DoesNotExist:
                return Response(
                    {"detail": "Review flag not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            if review_flag.status != ReviewFlags.Status.PENDING:
                return Response(
                    {
                        "detail": "This review flag has already been resolved."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if review_flag.reason != ReviewFlags.Reasons.PRIORITY_ASSESSMENT:
                return Response(
                    {
                        "detail": "This review flag is not a priority assessment."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            ticket = review_flag.ticket

            old_priority = (
                ticket.priority.priority_level
                if ticket.priority
                else None
            )

            try:
                sla_rule = SLARules.objects.get(
                    priority_level=priority_level
                )
            except SLARules.DoesNotExist:
                return Response(
                    {
                        "detail": f"No SLA rule exists for {priority_level}."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            old_status = ticket.status

            ticket.priority = sla_rule
            ticket.is_under_review = False
            ticket.updated_by = request.user

            if ticket.status == Ticket.TicketStatus.UNDER_REVIEW:
                ticket.status = Ticket.TicketStatus.OPEN

            ticket.save(
                update_fields=[
                    "priority",
                    "is_under_review",
                    "status",
                    "updated_by",
                    "updated_at",
                ]
            )

            update_sla(ticket)

            review_flag.status = ReviewFlags.Status.RESOLVED
            review_flag.reviewed_by = request.user
            review_flag.reviewed_at = timezone.now()

            review_flag.save(
                update_fields=[
                    "status",
                    "reviewed_by",
                    "reviewed_at",
                    "updated_at",
                ]
            )

            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.REVIEW_COMPLETED,
                old_value="Under Review",
                new_value="Priority Overridden",
                remarks=remarks,
                visibility=TicketStatusHistory.Visibility.INTERNAL,
                created_by=request.user,
                changed_by=request.user,
            )

            if old_priority != priority_level:
                TicketStatusHistory.objects.create(
                    ticket=ticket,
                    event_type=TicketStatusHistory.EventType.PRIORITY_CHANGED,
                    old_value=old_priority,
                    new_value=priority_level,
                    remarks=remarks,
                    visibility=TicketStatusHistory.Visibility.INTERNAL,
                    created_by=request.user,
                    changed_by=request.user,
                )

            AuditLogs.objects.create(
                user=request.user,
                module="Ticket Review",
                action="Overrode Priority Assessment",
                reference_id=str(ticket.id),
                remarks=remarks,
                created_by=request.user,
            )

            employee = ticket.submitted_by

            Notifications.objects.create(
                user=employee,
                ticket=ticket,
                message=(
                    f"Your ticket {ticket.ticket_code} has been reviewed "
                    f"by the IT Service Desk. The priority has been "
                    f"overridden to {priority_level}."
                ),
                notification_type=Notifications.NotificationType.REVIEW_COMPLETED,
                created_by=request.user,
                updated_by=request.user,
            )

            technician = assign_ticket_automatically(ticket)

            assignment_data = None

            if technician:
                assignment_data = {
                    "id": technician.id,
                    "name": (
                        f"{technician.user.first_name} "
                        f"{technician.user.last_name}"
                    ).strip(),
                    "username": technician.user.username,
                }

            return Response(
                {
                    "success": True,
                    "message": "Priority overridden successfully.",
                    "review_flag": {
                        "id": review_flag.id,
                        "status": review_flag.status,
                        "reviewed_by": review_flag.reviewed_by_id,
                        "reviewed_by_name": (
                            f"{review_flag.reviewed_by.first_name} "
                            f"{review_flag.reviewed_by.last_name}"
                        ).strip(),
                        "reviewed_by_user_code": (
                            review_flag.reviewed_by.user_code
                            if review_flag.reviewed_by
                            else ""
                        ),
                        "reviewed_at": review_flag.reviewed_at,
                        "review_remarks": remarks,
                    },
                    "ticket": {
                        "id": ticket.id,
                        "ticket_code": ticket.ticket_code,
                        "priority": (
                            ticket.priority.priority_level
                            if ticket.priority
                            else None
                        ),
                    },
                    "assignment": assignment_data,
                },
                status=status.HTTP_200_OK,
            )
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
            selected_symptom = SymptomCode.objects.get(
                code=selected_code
            )
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

        if (
            recommended_symptom
            and selected_symptom.id == recommended_symptom.id
        ):
            return Response(
                {
                    "success": False,
                    "message": (
                        "The selected symptom code is already the model's "
                        "primary recommendation."
                    ),
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
            old_value=(
                recommended_symptom.code
                if recommended_symptom
                else None
            ),
            new_value=selected_symptom.code,
            remarks=remarks,
            changed_by=request.user,
            created_by=request.user,
            visibility=TicketStatusHistory.Visibility.ALL,
        )

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                old_value=old_status,
                new_value=ticket.status,
                changed_by=request.user,
                created_by=request.user,
                visibility=TicketStatusHistory.Visibility.ALL,
            )

        prediction.was_overridden = True
        prediction.save(
            update_fields=[
                "was_overridden",
                "updated_at",
            ]
        )

        flag.status = ReviewFlags.Status.RESOLVED
        flag.reviewed_by = request.user
        flag.reviewed_at = reviewed_at

        flag.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

        assigned_profile = assign_ticket_automatically(ticket)

        return Response(
            {
                "success": True,
                "message": (
                    "Classification override approved successfully."
                ),
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "symptom_code": ticket.symptom_code.code,
                    "priority": ticket.priority.priority_level,
                    "status": ticket.status,
                    "assigned_to": (
                        assigned_profile.user.get_full_name()
                        if assigned_profile
                        else None
                    ),
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
            visibility=TicketStatusHistory.Visibility.ALL,
        )

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                old_value=old_status,
                new_value=ticket.status,
                changed_by=request.user,
                created_by=request.user,
                visibility=TicketStatusHistory.Visibility.ALL,
            )

        flag.status = ReviewFlags.Status.RESOLVED
        flag.reviewed_by = request.user
        flag.reviewed_at = reviewed_at

        flag.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

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
                    "assigned_to": (
                        assigned_profile.user.get_full_name()
                        if assigned_profile
                        else None
                    ),
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
                    "message": (
                        "Pending Unclear Description review flag not found."
                    ),
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
            selected_symptom = SymptomCode.objects.get(
                code=selected_code
            )
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
            visibility=TicketStatusHistory.Visibility.ALL,
        )

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
                old_value=old_status,
                new_value=ticket.status,
                changed_by=request.user,
                created_by=request.user,
                visibility=TicketStatusHistory.Visibility.ALL,
            )

        flag.status = ReviewFlags.Status.RESOLVED
        flag.reviewed_by = request.user
        flag.reviewed_at = reviewed_at

        flag.save(
            update_fields=[
                "status",
                "reviewed_by",
                "reviewed_at",
                "updated_at",
            ]
        )

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
                    "assigned_to": (
                        assigned_profile.user.get_full_name()
                        if assigned_profile
                        else None
                    ),
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

    def get_visible_comments(self, request, ticket):
        comments = (
            ticket.comments
            .select_related(
                "commented_by",
                "commented_by__role",
            )
            .order_by("created_at", "id")
        )

        if request.user.role and request.user.role.name == "Employee":
            comments = comments.filter(
                comment_type=TicketComments.CommentType.PUBLIC_REPLY
            )
        else:
            comments = comments.exclude(
                comment_type=TicketComments.CommentType.SYSTEM_LOG
            )

        return comments

    def get(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if not ticket:
            return Response(
                {"detail": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get the ID of the newest comment the frontend already has.
        last_comment_id = request.query_params.get("last_comment_id")

        try:
            last_comment_id = (
                int(last_comment_id)
                if last_comment_id
                else 0
            )
        except (TypeError, ValueError):
            last_comment_id = 0

        # How long this request is allowed to wait.
        timeout_seconds = 25

        # How often Django checks for a new comment.
        check_interval = 1

        start_time = time.monotonic()

        while True:
            comments = self.get_visible_comments(
                request,
                ticket,
            )

            # If this is the initial request, return all comments immediately.
            if last_comment_id == 0:
                serializer = TicketCommentSerializer(
                    comments,
                    many=True,
                )

                return Response(serializer.data)

            # Look for comments newer than the one the frontend already has.
            new_comments = comments.filter(
                id__gt=last_comment_id
            )

            if new_comments.exists():
                serializer = TicketCommentSerializer(
                    new_comments,
                    many=True,
                )

                return Response(serializer.data)

            # Stop waiting after the timeout.
            if time.monotonic() - start_time >= timeout_seconds:
                return Response([])

            # Wait before checking again.
            time.sleep(check_interval)

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

        user_role = (
            request.user.role.name
            if request.user.role
            else None
        )

        if user_role == "Employee":
            comment_type = (
                TicketComments.CommentType.PUBLIC_REPLY
            )

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

class TicketCommentMarkReadView(APIView):
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

    def get_visible_comments(self, request, ticket):
        comments = ticket.comments.order_by(
            "created_at",
            "id",
        )

        if request.user.role and request.user.role.name == "Employee":
            comments = comments.filter(
                comment_type=TicketComments.CommentType.PUBLIC_REPLY
            )
        else:
            comments = comments.exclude(
                comment_type=TicketComments.CommentType.SYSTEM_LOG
            )

        return comments

    def post(self, request, pk):
        ticket = self.get_ticket(request, pk)

        if not ticket:
            return Response(
                {"detail": "Ticket not found or access denied."},
                status=status.HTTP_404_NOT_FOUND,
            )

        comments = self.get_visible_comments(
            request,
            ticket,
        )

        latest_comment = comments.last()

        if not latest_comment:
            return Response(
                {
                    "detail": "No comments available to mark as read.",
                    "unread_comment_count": 0,
                },
                status=status.HTTP_200_OK,
            )

        TicketCommentRead.objects.update_or_create(
            ticket=ticket,
            user=request.user,
            defaults={
                "last_read_comment": latest_comment,
            },
        )

        return Response(
            {
                "detail": "Comments marked as read.",
                "last_read_comment_id": latest_comment.id,
                "unread_comment_count": 0,
            },
            status=status.HTTP_200_OK,
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
            context={"request": request},
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
                {
                    "error": (
                        "You do not have an IT Support profile."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = (
                Ticket.objects
                .select_related(
                    "submitted_by",
                    "priority",
                    "category",
                    "symptom_code",
                    "symptom_code__required_specialization",
                    "it_department",
                    "employee_department",
                    "office_location",
                    "assigned_to",
                    "resolved_by",
                    "ai_prediction",
                    "ai_analysis",
                )
                .get(id=ticket_id)
            )
        except Ticket.DoesNotExist:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        is_assigned = (
            ticket.assigned_to_id == user.id
        )

        same_department = (
            ticket.it_department_id
            == support_profile.it_department_id
        )

        has_pending_request_for_my_department = (
            TicketAssistanceRequest.objects.filter(
                ticket=ticket,
                requested_department_id=(
                    support_profile.it_department_id
                ),
                status=(
                    TicketAssistanceRequest
                    .RequestStatus
                    .PENDING
                ),
            ).exists()
        )

        has_ongoing_assistance_for_my_department = (
            TicketAssistance.objects.filter(
                ticket=ticket,
                status=(
                    TicketAssistance
                    .AssistanceStatus
                    .ONGOING
                ),
                assisted_by__it_support_profile__it_department_id=(
                    support_profile.it_department_id
                ),
            ).exists()
        )

        has_assistance_for_ticket = (
            TicketAssistance.objects.filter(
                ticket=ticket,
                assisted_by=user,
            ).exists()
        )

        can_view = (
            is_assigned
            or same_department
            or has_pending_request_for_my_department
            or has_ongoing_assistance_for_my_department
            or has_assistance_for_ticket
        )

        if not can_view:
            return Response(
                {
                    "error": (
                        "Ticket not found or you do not have "
                        "permission to view this ticket."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TicketDetailSupportSerializer(
            ticket,
            context={
                "request": request,
            },
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

class TicketDetailSupervisorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        user = request.user

        try:
            supervisor_profile = user.it_supervisor_profile
        except ITSupervisorProfile.DoesNotExist:
            return Response(
                {
                    "error": "You do not have an IT Supervisor profile."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = (
                Ticket.objects
                .select_related(
                    "submitted_by",
                    "priority",
                    "category",
                    "symptom_code",
                    "symptom_code__required_specialization",
                    "it_department",
                    "employee_department",
                    "office_location",
                    "assigned_to",
                    "resolved_by",
                    "ai_prediction",
                    "ai_analysis",
                )
                .get(
                    id=ticket_id,
                    is_escalated=True,
                )
            )

        except Ticket.DoesNotExist:
            return Response(
                {
                    "error": (
                        "Ticket not found or you do not have "
                        "permission to view this ticket."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TicketDetailSupportSerializer(
            ticket,
            context={
                "request": request,
            },
        )

        return Response(serializer.data)
# --- End --- 

#
class TicketDetailServiceDeskView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        try:
            ticket = Ticket.objects.get(id=ticket_id)
        except Ticket.DoesNotExist:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = TicketDetailSupportSerializer(ticket)
        return Response(serializer.data)

class ServiceDeskOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Total tickets across all departments
        total_tickets = Ticket.objects.count()

        # 2. Resolved tickets across all departments
        resolved_tickets = Ticket.objects.filter(
            status=Ticket.TicketStatus.RESOLVED
        ).count()

        # 3. Returned tickets across all departments
        returned_tickets = Ticket.objects.filter(
            status=Ticket.TicketStatus.RETURNED
        ).count()

        # 4. Tickets with pending review flags
        flagged_tickets = ReviewFlags.objects.filter(
            status=ReviewFlags.Status.PENDING
        ).values("ticket").distinct().count()

        return Response({
            "total_tickets": total_tickets,
            "resolved_tickets": resolved_tickets,
            "returned_tickets": returned_tickets,
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

class ServiceDeskSLAPerformanceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        all_department_tickets = Ticket.objects.all()

        response_met = all_department_tickets.filter(
            response_sla_status=Ticket.SLAStatus.MET
        ).count()

        response_breached = all_department_tickets.filter(
            response_sla_status=Ticket.SLAStatus.BREACHED
        ).count()

        response_evaluated = response_met + response_breached

        response_sla = (
            round((response_met / response_evaluated) * 100, 1)
            if response_evaluated > 0
            else 0.0
        )

        resolution_met = all_department_tickets.filter(
            resolution_sla_status=Ticket.SLAStatus.MET
        ).count()

        resolution_breached = all_department_tickets.filter(
            resolution_sla_status=Ticket.SLAStatus.BREACHED
        ).count()

        resolution_evaluated = resolution_met + resolution_breached

        resolution_sla = (
            round((resolution_met / resolution_evaluated) * 100, 1)
            if resolution_evaluated > 0
            else 0.0
        )

        total_met = response_met + resolution_met
        total_evaluated = response_evaluated + resolution_evaluated

        overall_compliance = (
            round((total_met / total_evaluated) * 100, 1)
            if total_evaluated > 0
            else 0.0
        )

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
            context={"request": request},
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
        resolution_sla_status = request.query_params.get(
            "resolution_sla_status"
        )

        if resolution_sla_status:
            tickets = tickets.filter(
                resolution_sla_status=resolution_sla_status
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

class ServiceDeskDepartmentQueueView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.role or request.user.role.name != "IT Service Desk":
            return Response(
                {
                    "detail": "You do not have permission to view the Service Desk queue."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        department_id = request.query_params.get("department")

        if not department_id:
            return Response(
                {
                    "detail": "IT department is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        tickets = (
            Ticket.objects
            .filter(
                it_department_id=department_id
            )
            .select_related(
                "symptom_code",
                "priority",
                "assigned_to",
                "it_department",
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
        status_filter = request.query_params.get("status")

        if status_filter:
            tickets = tickets.filter(
                status=status_filter
            )

        # PRIORITY
        priority = request.query_params.get("priority")

        if priority:
            tickets = tickets.filter(
                priority__priority_level=priority
            )

        # SYMPTOM CODE
        symptom_code = request.query_params.get("symptom_code")

        if symptom_code:
            tickets = tickets.filter(
                symptom_code__code=symptom_code
            )

        # RESOLUTION SLA STATUS
        resolution_sla_status = request.query_params.get(
            "resolution_sla_status"
        )

        if resolution_sla_status:
            tickets = tickets.filter(
                resolution_sla_status=resolution_sla_status
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

class ServiceDeskDepartmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.role or request.user.role.name != "IT Service Desk":
            return Response(
                {
                    "detail": "You do not have permission to view IT departments."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        departments = (
            ITDepartment.objects
            .all()
            .order_by("name")
        )

        serializer = ServiceDeskDepartmentSerializer(
            departments,
            many=True
        )

        return Response(serializer.data)

class ServiceDeskDepartmentSymptomCodesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.role or request.user.role.name != "IT Service Desk":
            return Response(
                {"detail": "You do not have permission to view symptom codes."},
                status=status.HTTP_403_FORBIDDEN,
            )

        department_id = request.query_params.get("department")

        if not department_id:
            return Response(
                {"detail": "IT department is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        symptom_codes = (
            SymptomCode.objects
            .filter(category__it_department_id=department_id)
            .select_related("category")
            .order_by("code")
        )

        data = [
            {
                "id": symptom.id,
                "code": symptom.code,
                "description": symptom.description,
                "category": (
                    symptom.category.name
                    if symptom.category
                    else None
                ),
            }
            for symptom in symptom_codes
        ]

        return Response(data)
# --- End ---

# --- Category Views ---
class CreateCategoryView(generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.select_related("it_department").order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

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

class SLARulesListView(generics.ListAPIView):
    queryset = SLARules.objects.all().order_by("priority_level")
    serializer_class = SLARulesSerializer
    permission_classes = [IsAuthenticated]

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

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
class PriorityChangeRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        serializer = PriorityChangeRequestSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=pk)
            .first()
        )

        if not ticket:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        role_name = (
            request.user.role.name
            if request.user.role
            else None
        )

        # IT Support Specialists must be assigned to the ticket.
        if role_name == "IT Support Specialist":
            if ticket.assigned_to_id != request.user.id:
                return Response(
                    {
                        "error": (
                            "You are not assigned to this ticket."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Supervisors can manage escalated tickets regardless
        # of their IT department or ticket assignment.
        elif role_name == "IT Supervisor":
            if not ticket.is_escalated:
                return Response(
                    {
                        "error": (
                            "IT Supervisor can only manage "
                            "escalated tickets."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        else:
            return Response(
                {
                    "error": (
                        "You do not have permission to "
                        "request a priority change."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        requested_priority = SLARules.objects.filter(
            priority_level=serializer.validated_data[
                "requested_priority"
            ]
        ).first()

        if not requested_priority:
            return Response(
                {
                    "error": "Invalid requested priority."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Priority change requests are only required
        # for P1, P2, or P3.
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
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Cannot request the ticket's current priority.
        if (
            ticket.priority
            and ticket.priority_id == requested_priority.id
        ):
            return Response(
                {
                    "error": (
                        "The ticket already has this priority."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Prevent multiple pending priority change requests.
        existing_request = TicketPriorityRequest.objects.filter(
            ticket=ticket,
            status=TicketPriorityRequest.RequestStatus.PENDING,
        ).exists()

        if existing_request:
            return Response(
                {
                    "error": (
                        "This ticket already has a pending "
                        "priority change request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        priority_request = TicketPriorityRequest.objects.create(
            ticket=ticket,
            requested_by=request.user,
            current_priority=ticket.priority,
            requested_priority=requested_priority,
            reason=serializer.validated_data["reason"],
            status=TicketPriorityRequest.RequestStatus.PENDING,
        )

        current_priority = (
            ticket.priority.priority_level
            if ticket.priority
            else "Unassigned"
        )

        # Keep the priority change request internal.
        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType
                .PRIORITY_REVIEW_REQUESTED
            ),
            old_value=current_priority,
            new_value=requested_priority.priority_level,
            remarks=priority_request.reason,
            created_by=request.user,
            changed_by=request.user,
            visibility=(
                TicketStatusHistory.Visibility.INTERNAL
            ),
        )

        # Notify all active IT Service Desk users.
        service_desk_users = User.objects.filter(
            role__name="IT Service Desk",
            is_active=True,
        )

        for service_desk_user in service_desk_users:
            create_notification(
                user=service_desk_user,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType
                    .REVIEW_REQUIRED
                ),
                message=(
                    f"Ticket {ticket.ticket_code} has a priority "
                    "change request that requires your review."
                ),
                created_by=request.user,
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
                },
            },
            status=status.HTTP_201_CREATED,
        )

class PriorityChangeRequestListView(generics.ListAPIView):
    serializer_class = PriorityRequestListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TicketPagination

    def get_queryset(self):
        queryset = (
            TicketPriorityRequest.objects
            .select_related(
                "ticket",
                "ticket__priority",
                "requested_priority",
                "requested_by",
            )
            .order_by("-requested_at")
        )

        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        status_filter = self.request.query_params.get(
            "status",
            ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(ticket__ticket_code__icontains=search)
                | Q(ticket__subject__icontains=search)
                | Q(
                    requested_by__first_name__icontains=search
                )
                | Q(
                    requested_by__last_name__icontains=search
                )
            )

        if status_filter:
            queryset = queryset.filter(
                status=status_filter
            )

        return queryset
        

class PriorityRequestDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, request_id):
        priority_request = (
            TicketPriorityRequest.objects
            .filter(id=request_id)
            .select_related(
                "ticket",
                "ticket__priority",
                "requested_priority",
                "requested_by",
                "requested_by__it_support_profile",
                "requested_by__it_support_profile__it_department",
                "requested_by__profile",
                "requested_by__profile__office_location",
            )
            .first()
        )

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
            TicketPriorityRequest.objects
            .select_for_update()
            .filter(id=request_id)
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
            != TicketPriorityRequest.RequestStatus.PENDING
        ):
            return Response(
                {
                    "error": (
                        "This priority change request has "
                        "already been reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not priority_request.requested_priority_id:
            return Response(
                {
                    "error": "Requested priority is missing."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=priority_request.ticket_id)
            .first()
        )

        if not ticket:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        requested_priority = (
            SLARules.objects
            .filter(
                pk=priority_request.requested_priority_id
            )
            .first()
        )

        if not requested_priority:
            return Response(
                {
                    "error": "Requested priority not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        review_remarks = request.data.get(
            "review_remarks",
            "",
        )

        if review_remarks is None:
            review_remarks = ""

        review_remarks = str(review_remarks).strip()

        if not review_remarks:
            return Response(
                {
                    "error": (
                        "Review remarks are required when "
                        "approving a priority change request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_priority = ticket.priority

        if (
            old_priority
            and old_priority.id == requested_priority.id
        ):
            return Response(
                {
                    "error": (
                        "The ticket already has the "
                        "requested priority."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_priority_level = (
            old_priority.priority_level
            if old_priority
            else None
        )

        new_priority_level = (
            requested_priority.priority_level
        )

        ticket.priority = requested_priority

        ticket.save(
            update_fields=[
                "priority",
            ]
        )

        update_sla(
            ticket,
            recalculate_deadlines=True,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.PRIORITY_CHANGED
            ),
            old_value=old_priority_level,
            new_value=new_priority_level,
            remarks=review_remarks,
            created_by=request.user,
            changed_by=request.user,
            visibility=(
                TicketStatusHistory.Visibility.ALL
            ),
        )

        priority_request.status = (
            TicketPriorityRequest.RequestStatus.APPROVED
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

        Notifications.objects.filter(
            ticket_id=priority_request.ticket_id,
            notification_type=(
                Notifications.NotificationType.REVIEW_REQUIRED
            ),
            is_read=False,
        ).update(
            is_read=True,
            updated_by=request.user,
        )

        if ticket.submitted_by:
            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your ticket {ticket.ticket_code} priority "
                    f"has been changed from "
                    f"{old_priority_level or 'Unassigned'} "
                    f"to {new_priority_level}."
                ),
                created_by=request.user,
            )

        if priority_request.requested_by:
            create_notification(
                user=priority_request.requested_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your priority change request for ticket "
                    f"{ticket.ticket_code} has been approved. "
                    f"Priority is now {new_priority_level}."
                ),
                created_by=request.user,
            )

        serializer = PriorityRequestDetailSerializer(
            priority_request
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Priority change request approved "
                    "successfully."
                ),
                "request": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class RejectPriorityRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, request_id):
        priority_request = (
            TicketPriorityRequest.objects
            .select_for_update()
            .filter(id=request_id)
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
            != TicketPriorityRequest.RequestStatus.PENDING
        ):
            return Response(
                {
                    "error": (
                        "This priority change request has "
                        "already been reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=priority_request.ticket_id)
            .first()
        )

        if not ticket:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        review_remarks = request.data.get(
            "review_remarks",
            "",
        )

        if review_remarks is None:
            review_remarks = ""

        review_remarks = str(review_remarks).strip()

        if not review_remarks:
            return Response(
                {
                    "error": (
                        "Review remarks are required when "
                        "rejecting a priority change request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        current_priority = (
            ticket.priority.priority_level
            if ticket.priority
            else "Unassigned"
        )

        requested_priority = (
            priority_request.requested_priority.priority_level
            if priority_request.requested_priority
            else "Unknown"
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.PRIORITY_REQUEST_REJECTED
            ),
            old_value=requested_priority,
            new_value=current_priority,
            remarks=review_remarks,
            created_by=request.user,
            changed_by=request.user,
            visibility=(
                TicketStatusHistory.Visibility.ALL
            ),
        )

        priority_request.status = (
            TicketPriorityRequest.RequestStatus.REJECTED
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

        Notifications.objects.filter(
            ticket_id=priority_request.ticket_id,
            notification_type=(
                Notifications.NotificationType.REVIEW_REQUIRED
            ),
            is_read=False,
        ).update(
            is_read=True,
            updated_by=request.user,
        )

        if ticket.submitted_by:
            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your priority change request for ticket "
                    f"{ticket.ticket_code} was rejected by the "
                    "Service Desk."
                ),
                created_by=request.user,
            )

        if priority_request.requested_by:
            create_notification(
                user=priority_request.requested_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your priority change request for ticket "
                    f"{ticket.ticket_code} was rejected. "
                    f"The priority remains {current_priority}."
                ),
                created_by=request.user,
            )

        serializer = PriorityRequestDetailSerializer(
            priority_request
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Priority change request rejected "
                    "successfully."
                ),
                "request": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

class RejectPriorityRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, request_id):
        priority_request = (
            TicketPriorityRequest.objects
            .select_for_update()
            .filter(id=request_id)
            .first()
        )

        if not priority_request:
            return Response(
                {"error": "Priority change request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            priority_request.status
            != TicketPriorityRequest.RequestStatus.PENDING
        ):
            return Response(
                {
                    "error": (
                        "This priority change request has "
                        "already been reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=priority_request.ticket_id)
            .first()
        )

        if not ticket:
            return Response(
                {"error": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        review_remarks = request.data.get("review_remarks", "")

        if review_remarks is None:
            review_remarks = ""

        review_remarks = str(review_remarks).strip()

        if not review_remarks:
            return Response(
                {
                    "error": (
                        "Review remarks are required when rejecting "
                        "a priority change request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        current_priority = (
            ticket.priority.priority_level
            if ticket.priority
            else "Unassigned"
        )

        requested_priority = (
            priority_request.requested_priority.priority_level
            if priority_request.requested_priority
            else "Unknown"
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.PRIORITY_REQUEST_REJECTED
            ),
            old_value=requested_priority,
            new_value=current_priority,
            remarks=review_remarks,
            created_by=request.user,
            changed_by=request.user,
            visibility=TicketStatusHistory.Visibility.ALL,
        )

        priority_request.status = (
            TicketPriorityRequest.RequestStatus.REJECTED
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

        Notifications.objects.filter(
            ticket_id=priority_request.ticket_id,
            notification_type=(
                Notifications.NotificationType.REVIEW_REQUIRED
            ),
            is_read=False,
        ).update(
            is_read=True,
            updated_by=request.user,
        )

        if ticket.submitted_by:
            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your priority change request for ticket "
                    f"{ticket.ticket_code} was rejected by the "
                    "Service Desk."
                ),
                created_by=request.user,
            )

        if priority_request.requested_by:
            create_notification(
                user=priority_request.requested_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your priority change request for ticket "
                    f"{ticket.ticket_code} was rejected. "
                    f"The priority remains {current_priority}."
                ),
                created_by=request.user,
            )

        serializer = PriorityRequestDetailSerializer(
            priority_request
        )

        return Response(
            {
                "success": True,
                "message": (
                    "Priority change request rejected successfully."
                ),
                "request": serializer.data,
            },
            status=status.HTTP_200_OK,
        )

class ReturnTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        serializer = ReturnTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=pk)
            .first()
        )

        if not ticket:
            return Response(
                {"error": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        role_name = (
            request.user.role.name
            if request.user.role
            else None
        )

        # IT Support Specialists must be assigned to the ticket.
        if role_name == "IT Support Specialist":
            if ticket.assigned_to_id != request.user.id:
                return Response(
                    {
                        "error": (
                            "You are not assigned to this ticket."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        # Supervisors can return escalated tickets
        # regardless of assignment.
        elif role_name == "IT Supervisor":
            if not ticket.is_escalated:
                return Response(
                    {
                        "error": (
                            "IT Supervisor can only manage "
                            "escalated tickets."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN,
                )

        else:
            return Response(
                {
                    "error": (
                        "You do not have permission "
                        "to return this ticket."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if ticket.is_under_review:
            return Response(
                {
                    "error": (
                        "This ticket is already under "
                        "Service Desk review."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_return = TicketReturn.objects.filter(
            ticket=ticket,
            status=TicketReturn.ReturnStatus.PENDING,
        ).exists()

        if existing_return:
            return Response(
                {
                    "error": (
                        "This ticket already has a pending "
                        "return request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = serializer.validated_data["reason"]
        previous_status = ticket.status

        return_request = TicketReturn.objects.create(
            ticket=ticket,
            returned_by=request.user,
            reason=reason,
            status=TicketReturn.ReturnStatus.PENDING,
        )

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

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.RETURNED,
            old_value=previous_status,
            new_value="Service Desk",
            remarks=return_request.reason,
            created_by=request.user,
            changed_by=request.user,
            visibility=TicketStatusHistory.Visibility.INTERNAL,
        )

        service_desk_users = User.objects.filter(
            role__name="IT Service Desk",
            is_active=True,
        )

        for service_desk_user in service_desk_users:
            create_notification(
                user=service_desk_user,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.REVIEW_REQUIRED
                ),
                message=(
                    f"Ticket {ticket.ticket_code} has been returned "
                    "to the Service Desk and requires review."
                ),
                created_by=request.user,
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
                    "returned_by": request.user.user_code,
                    "reason": return_request.reason,
                    "status": return_request.status,
                    "requested_at": return_request.requested_at,
                },
            },
            status=status.HTTP_201_CREATED,
        )

class AcknowledgeEscalationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=pk)
            .first()
        )

        if not ticket:
            return Response(
                {"error": "Ticket not found."},
                status=404,
            )

        role_name = (
            request.user.role.name
            if request.user.role
            else None
        )

        if role_name != "IT Supervisor":
            return Response(
                {
                    "error": (
                        "Only IT Supervisor can acknowledge "
                        "ticket escalations."
                    )
                },
                status=403,
            )

        if not ticket.is_escalated:
            return Response(
                {
                    "error": (
                        "This ticket has not been escalated."
                    )
                },
                status=400,
            )

        escalation = (
            TicketEscalation.objects
            .select_for_update()
            .filter(ticket=ticket)
            .first()
        )

        if not escalation:
            return Response(
                {
                    "error": (
                        "No escalation record exists "
                        "for this ticket."
                    )
                },
                status=400,
            )

        if (
            escalation.status
            == TicketEscalation.Status.ACKNOWLEDGED
        ):
            return Response(
                {
                    "error": (
                        "This ticket escalation has "
                        "already been acknowledged."
                    )
                },
                status=400,
            )

        if (
            escalation.status
            == TicketEscalation.Status.COMPLETED
        ):
            return Response(
                {
                    "error": (
                        "This ticket escalation has "
                        "already been completed."
                    )
                },
                status=400,
            )

        if (
            escalation.status
            != TicketEscalation.Status.OPEN
        ):
            return Response(
                {
                    "error": (
                        "This ticket escalation cannot "
                        "be acknowledged."
                    )
                },
                status=400,
            )

        now = timezone.now()

        escalation.status = (
            TicketEscalation.Status.ACKNOWLEDGED
        )

        escalation.acknowledged_by = request.user
        escalation.acknowledged_at = now

        escalation.save(
            update_fields=[
                "status",
                "acknowledged_by",
                "acknowledged_at",
            ]
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.ACKNOWLEDGED
            ),
            old_value=ticket.status,
            new_value=ticket.status,
            remarks=(
                "Escalation acknowledged by "
                "IT Supervisor."
            ),
            created_by=request.user,
            changed_by=request.user,
            visibility=(
                TicketStatusHistory.Visibility.INTERNAL
            ),
        )

        AuditLogs.objects.create(
            user=request.user,
            module="Tickets",
            action="ESCALATION_ACKNOWLEDGED",
            reference_id=ticket.ticket_code,
            remarks=(
                "Ticket escalation acknowledged by "
                "IT Supervisor."
            ),
            created_by=request.user,
        )

        if ticket.assigned_to:
            Notifications.objects.create(
                user=ticket.assigned_to,
                ticket=ticket,
                message=(
                    f"Escalation for ticket "
                    f"{ticket.ticket_code} has been "
                    "acknowledged by the IT Supervisor."
                ),
                notification_type=(
                    Notifications.NotificationType
                    .ESCALATION_ACKNOWLEDGED
                ),
                created_by=request.user,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Ticket escalation acknowledged "
                    "successfully."
                ),
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "escalation_id": escalation.id,
                "escalation_status": escalation.status,
                "is_escalated": ticket.is_escalated,
                "acknowledged": True,
                "acknowledged_by": request.user.user_code,
                "acknowledged_at": (
                    escalation.acknowledged_at
                ),
                "ticket_status": ticket.status,
            },
            status=200,
        )
class ApproveReturnTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        serializer = ApproveReturnTicketSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        selected_symptom_id = serializer.validated_data[
            "symptom_code_id"
        ]

        review_remarks = serializer.validated_data.get(
            "review_remarks",
            "",
        )

        return_request = (
            TicketReturn.objects
            .select_for_update()
            .filter(pk=pk)
            .first()
        )

        if not return_request:
            return Response(
                {"error": "Return request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            return_request.status
            != TicketReturn.ReturnStatus.PENDING
        ):
            return Response(
                {
                    "error": (
                        "This return request has already been reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not return_request.ticket_id:
            return Response(
                {
                    "error": (
                        "This return request is not linked to a ticket."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=return_request.ticket_id)
            .first()
        )

        if not ticket:
            return Response(
                {"error": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
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
                {"error": "Selected symptom code not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        new_department = (
            selected_symptom.category.it_department
            if selected_symptom.category
            else None
        )

        if not new_department:
            return Response(
                {
                    "error": (
                        "The selected symptom code's category does "
                        "not have an IT department assigned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            ticket.it_department_id
            and ticket.it_department_id == new_department.id
        ):
            return Response(
                {
                    "error": (
                        "The selected symptom code belongs to the "
                        "same IT department as the current ticket."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_symptom = ticket.symptom_code
        old_assignee = ticket.assigned_to
        old_status = ticket.status

        ticket.symptom_code = selected_symptom
        ticket.category = selected_symptom.category
        ticket.it_department = new_department
        ticket.assigned_to = None
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

        if (
            old_symptom
            and old_symptom.id != selected_symptom.id
        ):
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=(
                    TicketStatusHistory.EventType.SYMPTOM_CODE_CHANGED
                ),
                old_value=str(old_symptom),
                new_value=str(selected_symptom),
                remarks=(
                    review_remarks
                    or (
                        "Symptom code changed during "
                        "Service Desk review."
                    )
                ),
                created_by=request.user,
                changed_by=request.user,
                visibility=(
                    TicketStatusHistory.Visibility.INTERNAL
                ),
            )

        if old_assignee:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=(
                    TicketStatusHistory.EventType.REASSIGNED
                ),
                old_value=(
                    f"{old_assignee.first_name} "
                    f"{old_assignee.last_name}"
                ).strip(),
                new_value="Unassigned",
                remarks=(
                    "Ticket returned to Service Desk and "
                    "rerouted to another IT department."
                ),
                created_by=request.user,
                changed_by=request.user,
                visibility=(
                    TicketStatusHistory.Visibility.INTERNAL
                ),
            )

        if old_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=(
                    TicketStatusHistory.EventType.STATUS_CHANGED
                ),
                old_value=old_status,
                new_value=Ticket.TicketStatus.OPEN,
                remarks=(
                    review_remarks
                    or "Return request approved by Service Desk."
                ),
                created_by=request.user,
                changed_by=request.user,
                visibility=(
                    TicketStatusHistory.Visibility.ALL
                ),
            )

        return_request.status = (
            TicketReturn.ReturnStatus.APPROVED
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

        Notifications.objects.filter(
            ticket=ticket,
            notification_type=(
                Notifications.NotificationType.REVIEW_REQUIRED
            ),
            is_read=False,
        ).update(
            is_read=True,
            updated_by=request.user,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.RETURN_APPROVED
            ),
            old_value="Service Desk",
            new_value=new_department.name,
            remarks=(
                review_remarks
                or "Return request approved and ticket rerouted."
            ),
            created_by=request.user,
            changed_by=request.user,
            visibility=(
                TicketStatusHistory.Visibility.ALL
            ),
        )

        assigned_support = assign_ticket_automatically(ticket)

        if ticket.submitted_by:
            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your ticket {ticket.ticket_code} was reviewed "
                    "by the Service Desk, approved for rerouting, "
                    f"and forwarded to {new_department.name}."
                ),
                created_by=request.user,
            )

        if old_assignee:
            create_notification(
                user=old_assignee,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Ticket {ticket.ticket_code} was returned to "
                    "the Service Desk and rerouted to "
                    f"{new_department.name}."
                ),
                created_by=request.user,
            )

        if assigned_support:
            create_notification(
                user=assigned_support.user,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.TICKET_ASSIGNED
                ),
                message=(
                    f"Ticket {ticket.ticket_code} has been assigned "
                    "to you."
                ),
                created_by=request.user,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Return request approved and ticket "
                    "rerouted successfully."
                ),
                "request": {
                    "id": return_request.id,
                    "ticket": ticket.ticket_code,
                    "status": return_request.status,
                    "reviewed_by": request.user.user_code,
                    "reviewed_at": return_request.reviewed_at,
                    "review_remarks": (
                        return_request.review_remarks
                    ),
                },
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "status": ticket.status,
                    "it_department": (
                        ticket.it_department.name
                        if ticket.it_department
                        else None
                    ),
                    "assigned_to": (
                        assigned_support.user.user_code
                        if assigned_support
                        else None
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )

class RejectReturnTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        serializer = RejectReturnTicketSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        review_remarks = serializer.validated_data.get(
            "review_remarks",
            "",
        )

        return_request = (
            TicketReturn.objects
            .select_for_update()
            .filter(pk=pk)
            .first()
        )

        if not return_request:
            return Response(
                {"error": "Return request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if (
            return_request.status
            != TicketReturn.ReturnStatus.PENDING
        ):
            return Response(
                {
                    "error": (
                        "This return request has already been reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not return_request.ticket_id:
            return Response(
                {
                    "error": (
                        "This return request is not linked to a ticket."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=return_request.ticket_id)
            .first()
        )

        if not ticket:
            return Response(
                {"error": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
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

        previous_status = return_request.ticket.status

        return_request.status = (
            TicketReturn.ReturnStatus.REJECTED
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

        ticket.is_under_review = False
        ticket.updated_by = request.user

        ticket.save(
            update_fields=[
                "is_under_review",
                "updated_by",
                "updated_at",
            ]
        )

        if previous_status != ticket.status:
            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=(
                    TicketStatusHistory.EventType.STATUS_CHANGED
                ),
                old_value=previous_status,
                new_value=ticket.status,
                remarks=(
                    review_remarks
                    or "Return request rejected by Service Desk."
                ),
                created_by=request.user,
                changed_by=request.user,
                visibility=(
                    TicketStatusHistory.Visibility.ALL
                ),
            )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.RETURN_REJECTED
            ),
            old_value="Service Desk",
            new_value=ticket.status,
            remarks=(
                review_remarks
                or "Return request rejected by Service Desk."
            ),
            created_by=request.user,
            changed_by=request.user,
            visibility=(
                TicketStatusHistory.Visibility.ALL
            ),
        )

        Notifications.objects.filter(
            ticket=ticket,
            notification_type=(
                Notifications.NotificationType.REVIEW_REQUIRED
            ),
            is_read=False,
        ).update(
            is_read=True,
            updated_by=request.user,
        )

        if ticket.submitted_by:
            create_notification(
                user=ticket.submitted_by,
                ticket=ticket,
                notification_type=(
                    Notifications.NotificationType.STATUS_UPDATED
                ),
                message=(
                    f"Your ticket {ticket.ticket_code} was reviewed "
                    "by the Service Desk, but the return request "
                    "was rejected."
                ),
                created_by=request.user,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Return request rejected successfully."
                ),
                "request": {
                    "id": return_request.id,
                    "ticket": ticket.ticket_code,
                    "status": return_request.status,
                    "reviewed_by": request.user.user_code,
                    "reviewed_at": return_request.reviewed_at,
                    "review_remarks": (
                        return_request.review_remarks
                    ),
                },
                "ticket": {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "status": ticket.status,
                },
            },
            status=status.HTTP_200_OK,
        )

class ReturnedTicketRequestListView(generics.ListAPIView):
    serializer_class = ReturnedTicketRequestListSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = TicketPagination

    def get_queryset(self):
        queryset = (
            TicketReturn.objects
            .select_related(
                "ticket",
                "returned_by",
                "returned_by__it_support_profile",
                "returned_by__it_support_profile__it_department",
                "returned_by__profile",
                "returned_by__profile__office_location",
            )
            .order_by("-requested_at")
        )

        search = self.request.query_params.get(
            "search",
            ""
        ).strip()

        status_filter = self.request.query_params.get(
            "status",
            ""
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(ticket__ticket_code__icontains=search)
                | Q(ticket__subject__icontains=search)
                | Q(
                    returned_by__first_name__icontains=search
                )
                | Q(
                    returned_by__last_name__icontains=search
                )
            )

        if status_filter:
            queryset = queryset.filter(
                status=status_filter
            )

        return queryset

class ReturnedTicketDetailRetrieve(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        return_request = (
            TicketReturn.objects
            .filter(pk=pk)
            .select_related(
                "ticket",
                "ticket__submitted_by",
                "ticket__submitted_by__profile",
                "ticket__submitted_by__profile__office_location",
                "ticket__submitted_by__it_support_profile",
                "ticket__submitted_by__it_support_profile__it_department",
                "ticket__it_department",
                "returned_by",
                "returned_by__profile",
                "returned_by__profile__office_location",
                "returned_by__it_support_profile",
                "returned_by__it_support_profile__it_department",
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

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
# --- Count ---
class PendingReturnTicketRequestCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = TicketReturn.objects.filter(
            status=TicketReturn.ReturnStatus.PENDING,
        ).count()

        return Response(
            {"count": count},
            status=status.HTTP_200_OK,
        )

class PendingPriorityRequestCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = TicketPriorityRequest.objects.filter(
            status=TicketPriorityRequest.RequestStatus.PENDING,
        ).count()

        return Response(
            {"count": count},
            status=status.HTTP_200_OK,
        )

class EmployeeCurrentActiveTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        active_statuses = [
            Ticket.TicketStatus.IN_PROGRESS,
            Ticket.TicketStatus.UNDER_REVIEW,
            Ticket.TicketStatus.REOPENED,
            Ticket.TicketStatus.OPEN,
        ]

        status_priority = {
            Ticket.TicketStatus.IN_PROGRESS: 1,
            Ticket.TicketStatus.UNDER_REVIEW: 2,
            Ticket.TicketStatus.REOPENED: 3,
            Ticket.TicketStatus.OPEN: 4,
        }

        tickets = (
            Ticket.objects
            .filter(
                submitted_by=request.user,
                status__in=active_statuses,
            )
            .select_related(
                "assigned_to",
                "priority",
            )
        )

        if not tickets.exists():
            return Response({"ticket": None})

        current_ticket = min(
            tickets,
            key=lambda ticket: (
                status_priority.get(ticket.status, 99),
                -ticket.updated_at.timestamp(),
            ),
        )

        serializer = TicketDetailEmployeeSerializer(
            current_ticket
        )

        return Response({
            "ticket": serializer.data
        })

# --- Escalation --- 
from django.db import transaction
class CompleteEscalationView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        ticket = (
            Ticket.objects
            .select_for_update()
            .filter(pk=pk)
            .first()
        )

        if not ticket:
            return Response(
                {
                    "error": "Ticket not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        role_name = (
            request.user.role.name
            if request.user.role
            else None
        )

        if role_name != "IT Supervisor":
            return Response(
                {
                    "error": (
                        "Only IT Supervisor can complete "
                        "ticket escalations."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not ticket.is_escalated:
            return Response(
                {
                    "error": "This ticket has not been escalated."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        escalation = (
            TicketEscalation.objects
            .select_for_update()
            .filter(ticket=ticket)
            .first()
        )

        if not escalation:
            return Response(
                {
                    "error": (
                        "No escalation record exists "
                        "for this ticket."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            escalation.status
            != TicketEscalation.Status.ACKNOWLEDGED
        ):
            return Response(
                {
                    "error": (
                        "The escalation must be acknowledged "
                        "before it can be completed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        resolution_type = request.data.get(
            "resolution_type"
        )

        resolution_remarks = request.data.get(
            "resolution_remarks",
            "",
        ).strip()

        valid_resolution_types = {
            choice[0]
            for choice in TicketEscalation.ResolutionType.choices
        }

        if resolution_type not in valid_resolution_types:
            return Response(
                {
                    "error": (
                        "Please select a valid resolution type."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not resolution_remarks:
            return Response(
                {
                    "error": (
                        "Resolution remarks are required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(resolution_remarks) > 1000:
            return Response(
                {
                    "error": (
                        "Resolution remarks cannot exceed "
                        "1000 characters."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()

        escalation.status = (
            TicketEscalation.Status.COMPLETED
        )

        escalation.resolution_type = resolution_type

        escalation.resolution_remarks = resolution_remarks

        escalation.resolved_by = request.user

        escalation.resolved_at = now

        escalation.save(
            update_fields=[
                "status",
                "resolution_type",
                "resolution_remarks",
                "resolved_by",
                "resolved_at",
            ]
        )

        resolution_display = (
            escalation.get_resolution_type_display()
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.ESCALATION_COMPLETED
            ),
            old_value=ticket.status,
            new_value=ticket.status,
            remarks=(
                "Ticket escalation completed by "
                "IT Supervisor. "
                f"Resolution type: {resolution_display}. "
                f"Remarks: {resolution_remarks}"
            ),
            created_by=request.user,
            changed_by=request.user,
            visibility=(
                TicketStatusHistory.Visibility.INTERNAL
            ),
        )

        AuditLogs.objects.create(
            user=request.user,
            module="Tickets",
            action="ESCALATION_COMPLETED",
            reference_id=ticket.ticket_code,
            remarks=(
                "Ticket escalation completed by "
                "IT Supervisor. "
                f"Resolution type: {resolution_display}. "
                f"Remarks: {resolution_remarks}"
            ),
            created_by=request.user,
        )

        if ticket.assigned_to:
            Notifications.objects.create(
                user=ticket.assigned_to,
                ticket=ticket,
                message=(
                    f"Escalation for ticket "
                    f"{ticket.ticket_code} has been "
                    "completed by the IT Supervisor."
                ),
                notification_type=(
                    Notifications.NotificationType
                    .ESCALATION_COMPLETED
                ),
                created_by=request.user,
            )

        return Response(
            {
                "success": True,
                "message": (
                    "Ticket escalation completed successfully."
                ),
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "escalation_id": escalation.id,
                "escalation_status": escalation.status,
                "resolution_type": escalation.resolution_type,
                "resolution_type_display": (
                    resolution_display
                ),
                "resolution_remarks": (
                    escalation.resolution_remarks
                ),
                "resolved_by": request.user.user_code,
                "resolved_at": escalation.resolved_at,
                "ticket_status": ticket.status,
                "is_escalated": ticket.is_escalated,
            },
            status=status.HTTP_200_OK,
        )

class EscalateTicketView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            ticket = (
                Ticket.objects
                .select_related(
                    "submitted_by",
                    "assigned_to",
                )
                .get(pk=pk)
            )
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found."},
                status=404,
            )

        reason = str(
            request.data.get("reason", "")
        ).strip()

        if not reason:
            return Response(
                {
                    "error": (
                        "Escalation reason is required."
                    )
                },
                status=400,
            )

        if len(reason) > 500:
            return Response(
                {
                    "error": (
                        "Escalation reason must not "
                        "exceed 500 characters."
                    )
                },
                status=400,
            )

        if ticket.is_escalated:
            return Response(
                {
                    "error": (
                        "This ticket has already "
                        "been escalated."
                    )
                },
                status=400,
            )

        if ticket.status in [
            Ticket.TicketStatus.CLOSED,
            Ticket.TicketStatus.CANCELLED,
        ]:
            return Response(
                {
                    "error": (
                        "Closed or cancelled tickets "
                        "cannot be escalated."
                    )
                },
                status=400,
            )

        now = timezone.now()

        escalation = TicketEscalation.objects.create(
            ticket=ticket,
            escalated_by=request.user,
            reason=reason,
            status=TicketEscalation.Status.OPEN,
        )

        ticket.is_escalated = True
        ticket.escalated_at = now
        ticket.updated_by = request.user

        ticket.save(
            update_fields=[
                "is_escalated",
                "escalated_at",
                "updated_by",
                "updated_at",
            ]
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory
                .EventType
                .ESCALATED
            ),
            old_value=ticket.status,
            new_value=ticket.status,
            remarks=reason,
            changed_by=request.user,
            created_by=request.user,
            visibility=(
                TicketStatusHistory
                .Visibility
                .ALL
            ),
        )

        AuditLogs.objects.create(
            user=request.user,
            module="Tickets",
            action="Ticket Escalated",
            reference_id=str(ticket.id),
            remarks=reason,
            created_by=request.user,
        )

        supervisors = User.objects.filter(
            role__name="IT Supervisor",
            is_active=True,
        )

        notifications = [
            Notifications(
                user=supervisor,
                ticket=ticket,
                message=(
                    f"Ticket {ticket.ticket_code} "
                    "has been escalated and requires "
                    "your review."
                ),
                notification_type=(
                    Notifications
                    .NotificationType
                    .TICKET_ESCALATED
                ),
                created_by=request.user,
            )
            for supervisor in supervisors
        ]

        if notifications:
            Notifications.objects.bulk_create(
                notifications
            )

        return Response(
            {
                "message": (
                    "Ticket has been escalated "
                    "successfully."
                ),
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "escalation_id": escalation.id,
                "is_escalated": ticket.is_escalated,
                "escalation_status": escalation.status,
                "escalated_at": ticket.escalated_at,
            },
            status=200,
        )
class SupervisorEscalatedTicketsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tickets = (
            Ticket.objects
            .filter(is_escalated=True)
            .select_related(
                "submitted_by",
                "assigned_to",
                "it_department",
                "employee_department",
                "category",
                "symptom_code",
                "priority",
            )
            .order_by("-escalated_at")
        )

        search = request.query_params.get(
            "search",
            "",
        ).strip()

        status = request.query_params.get(
            "status",
            "",
        ).strip()

        priority = request.query_params.get(
            "priority",
            "",
        ).strip()

        if search:
            tickets = tickets.filter(
                Q(ticket_code__icontains=search)
                | Q(subject__icontains=search)
                | Q(
                    submitted_by__first_name__icontains=search
                )
                | Q(
                    submitted_by__last_name__icontains=search
                )
                | Q(
                    submitted_by__username__icontains=search
                )
                | Q(
                    assigned_to__first_name__icontains=search
                )
                | Q(
                    assigned_to__last_name__icontains=search
                )
                | Q(
                    assigned_to__username__icontains=search
                )
            )

        if status:
            tickets = tickets.filter(
                status=status
            )

        if priority:
            tickets = tickets.filter(
                priority__name=priority
            )

        paginator = TicketPagination()

        page = paginator.paginate_queryset(
            tickets,
            request,
            view=self,
        )

        serializer = SupervisorEscalatedTicketSerializer(
            page,
            many=True,
            context={"request": request},
        )

        return paginator.get_paginated_response(
            serializer.data
        )
class RequestTicketAssistanceView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, ticket_id):
        ticket = get_object_or_404(
            Ticket,
            id=ticket_id,
        )

        user = request.user

        if ticket.assigned_to_id != user.id:
            return Response(
                {
                    "message": (
                        "Only the assigned technician can "
                        "request assistance for this ticket."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if ticket.status in [
            Ticket.TicketStatus.RESOLVED,
            Ticket.TicketStatus.CLOSED,
            Ticket.TicketStatus.CANCELLED,
        ]:
            return Response(
                {
                    "message": (
                        "Assistance cannot be requested "
                        "for a completed ticket."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TicketAssistanceRequestCreateSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        requested_department_ids = (
            serializer.validated_data[
                "requested_departments"
            ]
        )

        reason = serializer.validated_data[
            "reason"
        ]

        departments = list(
            ITDepartment.objects.filter(
                id__in=requested_department_ids
            )
        )

        departments_by_id = {
            department.id: department
            for department in departments
        }

        created_requests = []
        skipped_departments = []

        for department_id in requested_department_ids:
            department = departments_by_id.get(
                department_id
            )

            if not department:
                continue

            has_pending_request = (
                TicketAssistanceRequest.objects.filter(
                    ticket=ticket,
                    requested_department_id=department_id,
                    status=(
                        TicketAssistanceRequest
                        .RequestStatus
                        .PENDING
                    ),
                ).exists()
            )

            if has_pending_request:
                skipped_departments.append(
                    {
                        "department": department.name,
                        "reason": (
                            "A pending assistance request "
                            "already exists for this department."
                        ),
                    }
                )
                continue

            assistance_request = (
                TicketAssistanceRequest.objects.create(
                    ticket=ticket,
                    requested_by=user,
                    requested_department=department,
                    reason=reason,
                    status=(
                        TicketAssistanceRequest
                        .RequestStatus
                        .PENDING
                    ),
                )
            )

            created_requests.append(
                assistance_request
            )

            AuditLogs.objects.create(
                user=user,
                module="Tickets",
                action="ASSISTANCE_REQUESTED",
                reference_id=ticket.ticket_code,
                remarks=(
                    f"Assistance requested from "
                    f"{department.name}. "
                    f"Details: {reason}"
                ),
                created_by=user,
            )

            TicketStatusHistory.objects.create(
                ticket=ticket,
                event_type=(
                    TicketStatusHistory
                    .EventType
                    .ASSISTANCE_REQUESTED
                ),
                new_value=ticket.status,
                changed_by=user,
                created_by=user,
                visibility=(
                    TicketStatusHistory
                    .Visibility
                    .INTERNAL
                ),
            )

        if not created_requests:
            return Response(
                {
                    "message": (
                        "No new assistance requests were created."
                    ),
                    "skipped_departments": (
                        skipped_departments
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serialized_requests = (
            TicketAssistanceRequestSerializer(
                created_requests,
                many=True,
            ).data
        )

        created_department_names = [
            request_item.requested_department.name
            for request_item in created_requests
        ]

        if len(created_department_names) == 1:
            message = (
                f"Assistance request sent to "
                f"{created_department_names[0]}."
            )
        else:
            message = (
                "Assistance requests sent to "
                + ", ".join(
                    created_department_names
                )
                + "."
            )

        return Response(
            {
                "message": message,
                "assistance_requests": (
                    serialized_requests
                ),
                "skipped_departments": (
                    skipped_departments
                ),
            },
            status=status.HTTP_201_CREATED,
        )

class CancelTicketAssistanceRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, request_id):
        user = request.user

        if getattr(user.role, "name", None) != "IT Support Specialist":
            return Response(
                {
                    "message": (
                        "Only IT Support Specialists can cancel "
                        "assistance requests."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assistance_request = get_object_or_404(
            TicketAssistanceRequest.objects.select_for_update(),
            id=request_id,
        )

        if (
            assistance_request.status
            != TicketAssistanceRequest.RequestStatus.PENDING
        ):
            return Response(
                {
                    "message": (
                        "Only pending assistance requests "
                        "can be cancelled."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = assistance_request.ticket

        if ticket.assigned_to_id != user.id:
            return Response(
                {
                    "message": (
                        "Only the primary assigned technician "
                        "can cancel this assistance request."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if assistance_request.requested_by_id != user.id:
            return Response(
                {
                    "message": (
                        "Only the technician who requested "
                        "the assistance can cancel it."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assistance_request.status = (
            TicketAssistanceRequest.RequestStatus.CANCELLED
        )
        assistance_request.save(update_fields=["status"])

        AuditLogs.objects.create(
            user=user,
            module="Tickets",
            action="ASSISTANCE_REQUEST_CANCELLED",
            reference_id=ticket.ticket_code,
            remarks=(
                f"Cancelled assistance request to "
                f"{assistance_request.requested_department.name}. "
                f"Details: {assistance_request.reason}"
            ),
            created_by=user,
        )

        return Response(
            {
                "message": (
                    f"Assistance request to "
                    f"{assistance_request.requested_department.name} "
                    f"was cancelled."
                ),
                "request_id": assistance_request.id,
                "status": assistance_request.status,
            },
            status=status.HTTP_200_OK,
        )
class CompleteTicketAssistanceView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, assistance_id):
        user = request.user

        if getattr(user.role, "name", None) != "IT Support Specialist":
            return Response(
                {
                    "message": (
                        "Only IT Support Specialists can "
                        "complete assistance."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assistance = get_object_or_404(
            TicketAssistance.objects.select_for_update(),
            id=assistance_id,
        )

        if assistance.assisted_by_id != user.id:
            return Response(
                {
                    "message": (
                        "You can only complete your own assistance."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if (
            assistance.status
            != TicketAssistance.AssistanceStatus.ONGOING
        ):
            return Response(
                {
                    "message": (
                        "This assistance is no longer ongoing."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        note = str(
            request.data.get("assisted_note", "")
        ).strip()

        if not note:
            return Response(
                {
                    "message": (
                        "Assistance remarks are required "
                        "before completing."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if len(note) > 300:
            return Response(
                {
                    "message": (
                        "Assistance remarks cannot exceed "
                        "300 characters."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        ticket = assistance.ticket
        now = timezone.now()

        assistance.assisted_note = note
        assistance.status = (
            TicketAssistance.AssistanceStatus.COMPLETED
        )
        assistance.completed_at = now
        assistance.updated_by = user

        assistance.save(
            update_fields=[
                "assisted_note",
                "status",
                "completed_at",
                "updated_by",
                "updated_at",
            ]
        )

        AuditLogs.objects.create(
            user=user,
            module="Tickets",
            action="ASSISTANCE_COMPLETED",
            reference_id=ticket.ticket_code,
            remarks=(
                f"{user.get_full_name() or user.username} "
                f"completed assistance on ticket "
                f"{ticket.ticket_code}. "
                f"Assistance remarks: {note}"
            ),
            created_by=user,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory
                .EventType
                .ASSISTANCE_COMPLETED
            ),
            new_value=ticket.status,
            changed_by=user,
            created_by=user,
            visibility=(
                TicketStatusHistory
                .Visibility
                .INTERNAL
            ),
        )

        return Response(
            {
                "message": (
                    "Assistance completed successfully."
                ),
                "assistance": {
                    "id": assistance.id,
                    "ticket": assistance.ticket_id,
                    "assisted_by": assistance.assisted_by_id,
                    "status": assistance.status,
                    "assisted_note": assistance.assisted_note,
                    "completed_at": assistance.completed_at,
                },
            },
            status=status.HTTP_200_OK,
        )
class AssistanceQueueListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if getattr(user.role, "name", None) != "IT Support Specialist":
            return Response(
                {
                    "message": (
                        "Only IT Support Specialists can access "
                        "the assistance queue."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            support_profile = user.it_support_profile
        except ITSupportProfile.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Your IT Support profile is not configured."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not support_profile.it_department_id:
            return Response(
                {
                    "message": (
                        "Your IT department is not configured."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        queryset = (
            TicketAssistanceRequest.objects
            .select_related(
                "ticket",
                "ticket__priority",
                "ticket__symptom_code",
                "requested_by",
                "requested_department",
            )
            .filter(
                requested_department_id=(
                    support_profile.it_department_id
                ),
                status=(
                    TicketAssistanceRequest.RequestStatus.PENDING
                ),
            )
            .order_by("-requested_at")
        )

        search = request.query_params.get(
            "search",
            "",
        ).strip()

        request_status = request.query_params.get(
            "status",
            "",
        ).strip()

        priority = request.query_params.get(
            "priority",
            "",
        ).strip()

        symptom_code = request.query_params.get(
            "symptom_code",
            "",
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(ticket__ticket_code__icontains=search)
                | Q(ticket__subject__icontains=search)
                | Q(
                    requested_by__first_name__icontains=search
                )
                | Q(
                    requested_by__last_name__icontains=search
                )
                | Q(
                    requested_by__username__icontains=search
                )
                | Q(reason__icontains=search)
            )

        if request_status:
            queryset = queryset.filter(
                status=request_status
            )

        if priority:
            queryset = queryset.filter(
                ticket__priority__priority_level=priority
            )

        if symptom_code:
            queryset = queryset.filter(
                ticket__symptom_code__code=symptom_code
            )

        try:
            page = max(
                int(
                    request.query_params.get(
                        "page",
                        1,
                    )
                ),
                1,
            )
        except (TypeError, ValueError):
            page = 1

        try:
            page_size = int(
                request.query_params.get(
                    "page_size",
                    15,
                )
            )
        except (TypeError, ValueError):
            page_size = 15

        page_size = min(
            max(page_size, 1),
            100,
        )

        paginator = Paginator(
            queryset,
            page_size,
        )

        if (
            page > paginator.num_pages
            and paginator.num_pages > 0
        ):
            page = paginator.num_pages

        page_obj = paginator.get_page(page)

        serializer = TicketAssistanceRequestQueueListSerializer(
            page_obj.object_list,
            many=True,
        )

        return Response(
            {
                "count": paginator.count,
                "page": page,
                "page_size": page_size,
                "total_pages": paginator.num_pages or 1,
                "results": serializer.data,
            },
            status=status.HTTP_200_OK,
        )


class AcceptTicketAssistanceView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, request_id):
        user = request.user

        if getattr(user.role, "name", None) != "IT Support Specialist":
            return Response(
                {
                    "message": (
                        "Only IT Support Specialists can "
                        "accept assistance requests."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            support_profile = user.it_support_profile
        except ITSupportProfile.DoesNotExist:
            return Response(
                {
                    "message": (
                        "Your IT Support profile is "
                        "not configured."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not support_profile.it_department_id:
            return Response(
                {
                    "message": (
                        "Your IT department is "
                        "not configured."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        assistance_request = get_object_or_404(
            TicketAssistanceRequest.objects.select_for_update(),
            id=request_id,
        )

        ticket = assistance_request.ticket

        if assistance_request.status != (
            TicketAssistanceRequest.RequestStatus.PENDING
        ):
            return Response(
                {
                    "message": (
                        "This assistance request "
                        "is no longer pending."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if (
            assistance_request.requested_department_id
            != support_profile.it_department_id
        ):
            return Response(
                {
                    "message": (
                        "You cannot accept an assistance "
                        "request for another IT department."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if assistance_request.requested_by_id == user.id:
            return Response(
                {
                    "message": (
                        "You cannot accept your own "
                        "assistance request."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ticket.status in [
            Ticket.TicketStatus.RESOLVED,
            Ticket.TicketStatus.CLOSED,
            Ticket.TicketStatus.CANCELLED,
        ]:
            return Response(
                {
                    "message": (
                        "Assistance cannot be accepted "
                        "for a completed ticket."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        existing_assistance = TicketAssistance.objects.filter(
            ticket=ticket,
            assisted_by=user,
            status=TicketAssistance.AssistanceStatus.ONGOING,
        ).exists()

        if existing_assistance:
            return Response(
                {
                    "message": (
                        "You are already assisting "
                        "this ticket."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        now = timezone.now()

        assistance = TicketAssistance.objects.create(
            ticket=ticket,
            assisted_by=user,
            status=TicketAssistance.AssistanceStatus.ONGOING,
            created_by=user,
        )

        assistance_request.status = (
            TicketAssistanceRequest.RequestStatus.ACCEPTED
        )
        assistance_request.accepted_by = user
        assistance_request.accepted_at = now

        assistance_request.save(
            update_fields=[
                "status",
                "accepted_by",
                "accepted_at",
            ]
        )

        full_name = (
            user.get_full_name().strip()
            or user.username
        )

        AuditLogs.objects.create(
            user=user,
            module="Tickets",
            action="ASSISTANCE_ACCEPTED",
            reference_id=ticket.ticket_code,
            remarks=(
                f"{full_name} accepted the assistance request."
            ),
            created_by=user,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=(
                TicketStatusHistory.EventType.ASSISTANCE_ACCEPTED
            ),
            new_value=ticket.status,
            changed_by=user,
            created_by=user,
            visibility=(
                TicketStatusHistory.Visibility.INTERNAL
            ),
        )

        if assistance_request.requested_by_id:
            Notifications.objects.create(
                user=assistance_request.requested_by,
                ticket=ticket,
                message=(
                    f"{full_name} accepted your assistance "
                    f"request for {ticket.ticket_code}."
                ),
                notification_type=(
                    Notifications.NotificationType.ASSISTANCE_ACCEPTED
                ),
                created_by=user,
            )

        return Response(
            {
                "message": (
                    "Assistance request accepted successfully."
                ),
                "assistance_request_id": (
                    assistance_request.id
                ),
                "assistance_id": assistance.id,
                "accepted_by": user.id,
                "accepted_at": assistance_request.accepted_at,
            },
            status=status.HTTP_200_OK,
        )

class AssistedTicketListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if getattr(user.role, "name", None) != "IT Support Specialist":
            return Response(
                {
                    "message": (
                        "Only IT Support Specialists can access "
                        "assisted tickets."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assistance_statuses = [
            TicketAssistance.AssistanceStatus.ONGOING,
            TicketAssistance.AssistanceStatus.COMPLETED,
        ]

        current_user_assistance = (
            TicketAssistance.objects.filter(
                ticket=OuterRef("pk"),
                assisted_by=user,
                status__in=assistance_statuses,
            )
            .order_by("-created_at")
        )

        any_ongoing_assistance = TicketAssistance.objects.filter(
            ticket=OuterRef("pk"),
            status=TicketAssistance.AssistanceStatus.ONGOING,
        )

        queryset = (
            Ticket.objects
            .select_related(
                "priority",
                "symptom_code",
                "submitted_by",
                "submitted_by__profile",
                "employee_department",
                "assigned_to",
            )
            .annotate(
                current_user_assistance_id=Subquery(
                    current_user_assistance.values("id")[:1]
                ),
                current_user_assistance_since=Subquery(
                    current_user_assistance.values("created_at")[:1]
                ),
                ongoing_assistance_id=Subquery(
                    any_ongoing_assistance.values("id")[:1]
                ),
                ongoing_assistance_since=Subquery(
                    any_ongoing_assistance.values("created_at")[:1]
                ),
            )
            .filter(
                Q(
                    current_user_assistance_id__isnull=False
                )
                |
                Q(
                    assigned_to=user,
                    ongoing_assistance_id__isnull=False,
                )
            )
            .order_by(
                "-current_user_assistance_since",
                "-ongoing_assistance_since",
            )
        )

        search = request.query_params.get(
            "search",
            "",
        ).strip()

        if search:
            queryset = queryset.filter(
                Q(ticket_code__icontains=search)
                | Q(subject__icontains=search)
                | Q(
                    submitted_by__first_name__icontains=search
                )
                | Q(
                    submitted_by__last_name__icontains=search
                )
                | Q(
                    submitted_by__username__icontains=search
                )
                | Q(
                    symptom_code__code__icontains=search
                )
            )

        ticket_status = request.query_params.get(
            "status",
            "",
        ).strip()

        if ticket_status:
            queryset = queryset.filter(
                status=ticket_status
            )

        priority = request.query_params.get(
            "priority",
            "",
        ).strip()

        if priority:
            queryset = queryset.filter(
                priority__priority_level=priority
            )

        symptom_code = request.query_params.get(
            "symptom_code",
            "",
        ).strip()

        if symptom_code:
            queryset = queryset.filter(
                symptom_code__code=symptom_code
            )

        try:
            page = max(
                int(
                    request.query_params.get(
                        "page",
                        1,
                    )
                ),
                1,
            )
        except (
            TypeError,
            ValueError,
        ):
            page = 1

        try:
            page_size = int(
                request.query_params.get(
                    "page_size",
                    15,
                )
            )
        except (
            TypeError,
            ValueError,
        ):
            page_size = 15

        page_size = min(
            max(page_size, 1),
            100,
        )

        paginator = Paginator(
            queryset,
            page_size,
        )

        if (
            page > paginator.num_pages
            and paginator.num_pages > 0
        ):
            page = paginator.num_pages

        page_obj = paginator.get_page(page)

        now = timezone.now()
        results = []

        for ticket in page_obj.object_list:
            submitted_by = ticket.submitted_by

            submitted_by_name = (
                submitted_by.get_full_name().strip()
                if submitted_by
                else ""
            )

            if not submitted_by_name and submitted_by:
                submitted_by_name = submitted_by.username

            submitted_by_department = ""

            if submitted_by:
                try:
                    profile = submitted_by.profile

                    if profile.employee_department:
                        submitted_by_department = (
                            profile.employee_department.name
                        )
                except Exception:
                    submitted_by_department = ""

            assigned_to_name = ""

            if ticket.assigned_to:
                assigned_to_name = (
                    ticket.assigned_to.get_full_name().strip()
                )

                if not assigned_to_name:
                    assigned_to_name = (
                        ticket.assigned_to.username
                    )

            sla_remaining = "-"

            if ticket.resolution_deadline:
                difference = (
                    ticket.resolution_deadline - now
                )

                total_seconds = int(
                    difference.total_seconds()
                )

                if total_seconds <= 0:
                    sla_remaining = "Breached"
                else:
                    days = total_seconds // 86400

                    hours = (
                        total_seconds % 86400
                    ) // 3600

                    minutes = (
                        total_seconds % 3600
                    ) // 60

                    parts = []

                    if days:
                        parts.append(
                            f"{days}d"
                        )

                    if hours:
                        parts.append(
                            f"{hours}h"
                        )

                    if minutes:
                        parts.append(
                            f"{minutes}m"
                        )

                    sla_remaining = (
                        " ".join(parts)
                        if parts
                        else "<1m"
                    )

            is_primary_assigned = (
                ticket.assigned_to_id == user.id
            )

            has_current_user_assistance = (
                ticket.current_user_assistance_id
                is not None
            )

            has_ongoing_assistance = (
                ticket.ongoing_assistance_id
                is not None
            )

            assisting_since = (
                ticket.current_user_assistance_since
                if has_current_user_assistance
                else ticket.ongoing_assistance_since
            )

            results.append(
                {
                    "id": ticket.id,
                    "ticket_code": ticket.ticket_code,
                    "subject": ticket.subject,
                    "submitted_by_name": (
                        submitted_by_name or "-"
                    ),
                    "submitted_by_department": (
                        submitted_by_department or "-"
                    ),
                    "symptom_code": (
                        ticket.symptom_code.code
                        if ticket.symptom_code
                        else "-"
                    ),
                    "affected_scope": (
                        ticket.get_affected_scope_display()
                    ),
                    "priority": (
                        ticket.priority.priority_level
                        if ticket.priority
                        else "-"
                    ),
                    "status": (
                        ticket.get_status_display()
                    ),
                    "assigned_to": (
                        assigned_to_name or "Unassigned"
                    ),
                    "resolution_time_remaining": (
                        sla_remaining
                    ),
                    "assisting_since": (
                        assisting_since
                    ),
                    "assistance_id": (
                        ticket.current_user_assistance_id
                    ),
                    "is_primary_technician": (
                        is_primary_assigned
                    ),
                }
            )

        return Response(
            {
                "count": paginator.count,
                "page": page,
                "page_size": page_size,
                "total_pages": (
                    paginator.num_pages or 1
                ),
                "results": results,
            },
            status=status.HTTP_200_OK,
        )

class TeamWorkloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        support_profile = getattr(
            user,
            "it_support_profile",
            None,
        )

        supervisor_profile = getattr(
            user,
            "it_supervisor_profile",
            None,
        )

        if support_profile:
            department = support_profile.it_department

            if not department:
                return Response(
                    {
                        "scope": "department",
                        "department": None,
                        "departments": [],
                    },
                    status=status.HTTP_200_OK,
                )

            departments = [department]
            scope = "department"

        elif supervisor_profile:
            departments = (
                ITDepartment.objects
                .all()
                .order_by("name")
            )

            scope = "all_departments"

        else:
            return Response(
                {
                    "error": (
                        "You are not authorized to view "
                        "team workload."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        department_results = []

        for department in departments:
            profiles_queryset = (
                ITSupportProfile.objects
                .filter(
                    it_department=department,
                )
                .select_related(
                    "user",
                    "it_department",
                )
                .prefetch_related(
                    "specializations__specialization",
                )
                .order_by(
                    "user__first_name",
                    "user__last_name",
                )
            )

            paginator = WorkloadPagination()

            paginated_profiles = paginator.paginate_queryset(
                profiles_queryset,
                request,
                view=self,
            )

            technicians = []

            for profile in paginated_profiles:
                current_workload = get_current_workload(
                    profile
                )

                workload_limit = (
                    profile.workload_limit or 0
                )

                if workload_limit > 0:
                    workload_ratio = (
                        current_workload /
                        workload_limit
                    )
                else:
                    workload_ratio = 0

                workload_tickets = (
                    Ticket.objects
                    .filter(
                        assigned_to=profile.user,
                        status__in=WORKLOAD_STATUSES,
                    )
                    .order_by("created_at")
                    .values(
                        "ticket_code",
                        "status",
                    )
                )

                full_name = (
                    f"{profile.user.first_name} "
                    f"{profile.user.last_name}"
                ).strip() or profile.user.username

                technicians.append(
                    {
                        "profile_id": profile.id,
                        "user_id": profile.user.id,
                        "name": full_name,
                        "username": profile.user.username,
                        "email": profile.user.email,
                        "availability_status": (
                            profile.availability_status
                        ),
                        "workload": current_workload,
                        "workload_limit": workload_limit,
                        "workload_ratio": workload_ratio,
                        "tickets": list(
                            workload_tickets
                        ),
                    }
                )

            workload_paginator = getattr(
                paginator,
                "workload_paginator",
                None,
            )

            if workload_paginator is not None:
                requested_page = getattr(
                    paginator,
                    "workload_page_number",
                    1,
                )

                total_pages = workload_paginator.num_pages

                if paginator.page is not None:
                    current_page = paginator.page.number
                else:
                    current_page = requested_page

                pagination_data = {
                    "count": workload_paginator.count,
                    "page": current_page,
                    "page_size": paginator.get_page_size(
                        request
                    ),
                    "total_pages": total_pages,
                    "has_next": current_page < total_pages,
                    "has_previous": current_page > 1,
                }
            else:
                pagination_data = {
                    "count": 0,
                    "page": 1,
                    "page_size": paginator.get_page_size(
                        request
                    ),
                    "total_pages": 1,
                    "has_next": False,
                    "has_previous": False,
                }

            department_results.append(
                {
                    "id": department.id,
                    "name": department.name,
                    "technicians": technicians,
                    "pagination": pagination_data,
                }
            )

        return Response(
            {
                "scope": scope,
                "departments": department_results,
            },
            status=status.HTTP_200_OK,
        )

class AssignTicketToMeView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        profile = (
            ITSupportProfile.objects
            .select_related("it_department")
            .filter(user=request.user)
            .first()
        )

        if not profile:
            return Response(
                {
                    "error": (
                        "Only IT Support Specialists can "
                        "assign tickets to themselves."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not profile.it_department:
            return Response(
                {
                    "error": (
                        "You must belong to an IT department "
                        "to claim tickets."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            ticket = (
                Ticket.objects
                .select_for_update(of=("self",))
                .select_related(
                    "it_department",
                    "assigned_to",
                )
                .get(pk=pk)
            )
        except Ticket.DoesNotExist:
            return Response(
                {"error": "Ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if ticket.is_under_review or (
            ticket.status == Ticket.TicketStatus.UNDER_REVIEW
        ):
            return Response(
                {
                    "error": (
                        "This ticket is under Service Desk "
                        "review and cannot be claimed."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if (
            not ticket.it_department_id
            or ticket.it_department_id != profile.it_department_id
        ):
            return Response(
                {
                    "error": (
                        "You can only claim tickets belonging "
                        "to your own IT department."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if ticket.status != Ticket.TicketStatus.OPEN:
            return Response(
                {
                    "error": (
                        "Only open tickets can be claimed."
                    ),
                    "ticket_status": ticket.status,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ticket.assigned_to_id:
            if ticket.assigned_to_id == request.user.id:
                return Response(
                    {
                        "success": True,
                        "message": "You are already assigned to this ticket.",
                        "ticket_id": ticket.id,
                        "ticket_code": ticket.ticket_code,
                        "assigned_to": request.user.username,
                        "status": ticket.status,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response(
                {
                    "error": (
                        "This ticket has already been assigned "
                        "to another technician."
                    )
                },
                status=status.HTTP_409_CONFLICT,
            )

        old_status = ticket.status
        technician_name = (
            request.user.get_full_name()
            or request.user.username
        )
        now = timezone.now()

        ticket.assigned_to = request.user
        ticket.status = Ticket.TicketStatus.IN_PROGRESS
        ticket.assigned_at = now
        ticket.updated_by = request.user

        ticket.save(
            update_fields=[
                "assigned_to",
                "status",
                "assigned_at",
                "updated_by",
                "updated_at",
            ]
        )

        profile.last_assigned_at = now
        profile.save(
            update_fields=[
                "last_assigned_at",
                "updated_at",
            ]
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.ASSIGNED,
            old_value=None,
            new_value=technician_name,
            remarks="Ticket manually claimed by the assigned IT Support.",
            visibility=TicketStatusHistory.Visibility.ALL,
            changed_by=request.user,
            created_by=request.user,
        )

        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
            old_value=old_status,
            new_value=ticket.status,
            visibility=TicketStatusHistory.Visibility.ALL,
            changed_by=request.user,
            created_by=request.user,
        )

        update_sla(ticket)

        return Response(
            {
                "success": True,
                "message": "Ticket assigned to you successfully.",
                "ticket_id": ticket.id,
                "ticket_code": ticket.ticket_code,
                "assigned_to": request.user.username,
                "assigned_to_name": technician_name,
                "status": ticket.status,
                "assigned_at": ticket.assigned_at,
                "response_sla_status": ticket.response_sla_status,
                "resolution_sla_status": ticket.resolution_sla_status,
            },
            status=status.HTTP_200_OK,
        )