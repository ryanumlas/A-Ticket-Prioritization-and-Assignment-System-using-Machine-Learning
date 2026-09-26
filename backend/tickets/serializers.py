from rest_framework import serializers
from .models import Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketAssistance, Keyword, TicketStatusHistory, TicketReturn, TicketPriorityRequest
from users.models import  ITSupportProfile
from ai.models import TicketAnalysis, TicketAIAnalysis
from departments.models import ITDepartment
from tickets.services import (
    normalize_text,
    phrase_matches,
)
from django.utils import timezone
from datetime import timedelta
from rest_framework import serializers


class TicketSerializer(serializers.ModelSerializer):
    status = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    assigned_to = serializers.SerializerMethodField()
    submitted_by_name = serializers.SerializerMethodField()
    submitted_by_department = serializers.SerializerMethodField()

    resolution_time_remaining = serializers.SerializerMethodField()
    response_time_remaining = serializers.SerializerMethodField()

    symptom_code = serializers.CharField(
        source="symptom_code.code",
        read_only=True,
    )

    priority = serializers.CharField(
        source="priority.priority_level",
        read_only=True,
    )
    it_department_name = serializers.CharField(
        source="it_department.name",
        read_only=True,
    )

    created_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Ticket

        fields = [
            "id",
            "ticket_code",
            "submitted_by",
            "submitted_by_name",
            "submitted_by_department",
            "assigned_to",
            "updated_by",
            "it_department",
            "it_department_name",
            "employee_department",
            "subject",
            "description",
            "business_impact",
            "affected_scope",
            "category",
            "symptom_code",
            "status",
            "priority",
            "is_under_review",
            "response_deadline",
            "response_time_remaining",
            "resolution_deadline",
            "resolution_time_remaining",
            "is_escalated",
            "resolved_at",
            "resolved_by",
            "created_at",
            "created_at_formatted",
            "updated_at",
        ]

        read_only_fields = [
            "submitted_by",
            "updated_by",
            "resolved_at",
            "created_at",
            "updated_at",
        ]

    def get_submitted_by_name(self, obj):
        if not obj.submitted_by:
            return None

        return (
            f"{obj.submitted_by.first_name} "
            f"{obj.submitted_by.last_name}"
        ).strip()

    def get_submitted_by_department(self, obj):
        if not obj.submitted_by:
            return None

        profile = getattr(
            obj.submitted_by,
            "profile",
            None,
        )

        if not profile:
            return None

        department = getattr(
            profile,
            "employee_department",
            None,
        )

        if not department:
            return None

        return department.name

    def get_assigned_to(self, obj):
        if not obj.assigned_to:
            return None

        return (
            f"{obj.assigned_to.first_name} "
            f"{obj.assigned_to.last_name}"
        ).strip()

    def get_response_time_remaining(self, obj):
        if obj.response_at:
            return (
                obj.response_sla_status.upper()
                if obj.response_sla_status
                else None
            )

        if not obj.response_deadline:
            return None

        remaining = obj.response_deadline - timezone.now()

        if remaining.total_seconds() <= 0:
            return "OVERDUE"

        total_seconds = int(
            remaining.total_seconds()
        )

        days, remainder = divmod(
            total_seconds,
            86400,
        )

        hours, remainder = divmod(
            remainder,
            3600,
        )

        minutes, seconds = divmod(
            remainder,
            60,
        )

        if days > 0:
            return f"{days}d {hours}h {minutes}m"

        if hours > 0:
            return f"{hours}h {minutes}m"

        if minutes > 0:
            return f"{minutes}m {seconds}s"

        return f"{seconds}s"

    def get_resolution_time_remaining(self, obj):
        if obj.resolved_at:
            return (
                obj.resolution_sla_status.upper()
                if obj.resolution_sla_status
                else None
            )

        if not obj.resolution_deadline:
            return None

        remaining = (
            obj.resolution_deadline - timezone.now()
        )

        if remaining.total_seconds() <= 0:
            return "OVERDUE"

        total_seconds = int(
            remaining.total_seconds()
        )

        days, remainder = divmod(
            total_seconds,
            86400,
        )

        hours, remainder = divmod(
            remainder,
            3600,
        )

        minutes, seconds = divmod(
            remainder,
            60,
        )

        if days > 0:
            return f"{days}d {hours}h {minutes}m"

        if hours > 0:
            return f"{hours}h {minutes}m"

        if minutes > 0:
            return f"{minutes}m {seconds}s"

        return f"{seconds}s"

    def _get_remaining_time(self, deadline):
        if not deadline:
            return None

        remaining = deadline - timezone.now()

        if remaining.total_seconds() <= 0:
            return "Overdue"

        total_seconds = int(
            remaining.total_seconds()
        )

        days, remainder = divmod(
            total_seconds,
            86400,
        )

        hours, remainder = divmod(
            remainder,
            3600,
        )

        minutes, _ = divmod(
            remainder,
            60,
        )

        if days > 0:
            return f"{days}d {hours}h"

        if hours > 0:
            return f"{hours}h {minutes}m"

        return f"{minutes}m"

    def get_created_at_formatted(self, obj):
        return timezone.localtime(
            obj.created_at
        ).strftime(
            "%B %d, %Y %I:%M %p"
        )

class FlaggedTicketsListSerializer(serializers.ModelSerializer):
    ticket_code = serializers.CharField(source="ticket.ticket_code", read_only=True)
    subject = serializers.CharField(source="ticket.subject", read_only=True)
    description = serializers.CharField(source="ticket.description", read_only=True)
    reason = serializers.CharField(source="get_reason_display", read_only=True)
    status = serializers.CharField(source="get_status_display", read_only=True)
    first_name = serializers.CharField(source="ticket.submitted_by.first_name", read_only=True)
    last_name = serializers.CharField(source="ticket.submitted_by.last_name", read_only=True)
    employee_department = serializers.CharField(source='ticket.employee_department.name', read_only=True)
    class Meta:
        model = ReviewFlags
        fields = ["id", "ticket_code", "subject", "description", "reason", "status", "created_at", "first_name", "last_name", "employee_department"]

class FlaggedTicketDetailSerializer(serializers.ModelSerializer):
    ticket_code = serializers.CharField(source="ticket.ticket_code", read_only=True)
    subject = serializers.CharField(source="ticket.subject", read_only=True)
    description = serializers.CharField(source="ticket.description", read_only=True)
    business_impact = serializers.CharField(source="ticket.business_impact", read_only=True)
    affected_scope = serializers.CharField(source="ticket.get_affected_scope_display", read_only=True)
    role = serializers.CharField(
        source="ticket.submitted_by.role",
        read_only=True
    )
    reason = serializers.CharField(source="get_reason_display", read_only=True)
    status = serializers.CharField(source="get_status_display", read_only=True)
    predicted_symptom_code = serializers.CharField(source="prediction.predicted_symptom_code.code", read_only=True, allow_null=True)
    second_predicted_symptom_code = serializers.CharField(source="prediction.second_predicted_symptom_code.code", read_only=True, allow_null=True)
    confidence = serializers.FloatField(source="prediction.confidence", read_only=True, allow_null=True)
    second_confidence = serializers.FloatField(source="prediction.second_confidence", read_only=True, allow_null=True)
    confidence_margin = serializers.FloatField(source="prediction.confidence_margin", read_only=True, allow_null=True)
    summary = serializers.CharField(source="ticket.ai_analysis.summary", read_only=True, allow_null=True)
    business_critical = serializers.BooleanField(source="ticket.ai_analysis.business_critical", read_only=True)
    is_unclear = serializers.BooleanField(source="ticket.ai_analysis.is_unclear", read_only=True)
    first_name = serializers.CharField(source="ticket.submitted_by.first_name", read_only=True)
    last_name = serializers.CharField(source="ticket.submitted_by.last_name", read_only=True)
    user_code = serializers.CharField(source='ticket.submitted_by.user_code', read_only=True)
    employee_department = serializers.CharField(source='ticket.employee_department.name', read_only=True)
    office_location = serializers.CharField(source='ticket.office_location.name', read_only=True)
    workstation = serializers.CharField(source="ticket.workstation", read_only=True)
    cleaned_text = serializers.CharField(source="ticket.ai_analysis.cleaned_text", read_only=True, allow_null=True)
    summary = serializers.CharField(source="ticket.ai_analysis.summary", read_only=True, allow_null=True)
    submitted_at = serializers.DateTimeField(source="ticket.created_at", read_only=True)
    submitted_by_first_name = serializers.CharField(source="ticket.submitted_by.first_name", read_only=True)
    submitted_by_last_name = serializers.CharField(source="ticket.submitted_by.last_name", read_only=True)
    submitted_by_user_code = serializers.CharField(source="ticket.submitted_by.user_code", read_only=True)
    submitted_by_role = serializers.CharField(source="ticket.submitted_by.role", read_only=True)
    class Meta:
        model = ReviewFlags
        fields = ["id", "role", "ticket_code", "subject", "description", "business_impact", "affected_scope", 
                  "reason", "status", "predicted_symptom_code", "second_predicted_symptom_code", "confidence", "second_confidence", 
                  "confidence_margin", "summary", "business_critical", "is_unclear", "created_at", "first_name", "last_name", "user_code", 
                  "employee_department", "office_location", "workstation", "cleaned_text", "summary", "submitted_at", 
                  "submitted_by_first_name", "submitted_by_last_name", "submitted_by_user_code", "submitted_by_role"]

class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ["workstation", "subject", "description" ,"business_impact", "affected_scope"]

    def validate_subject(self, value):
        value = value.strip()

        if len(value) < 5:
            raise serializers.ValidationError(
                "Subject must be at least 15 characters."
            )
        if len(value) > 100:
            raise serializers.ValidationError(
                "Subject cannot exceed 100 characters."
            )
        return value

    def validate_description(self, value):
        value = value.strip()

        if len(value) < 50:
            raise serializers.ValidationError(
                "Description must be at least 50 characters."
            )
        if len(value) > 750:
            raise serializers.ValidationError(
                "Description cannot exceed 750 characters."
            )

        return value

    def validate_business_impact(self, value):
        value = value.strip()

        if len(value) < 20:
            raise serializers.ValidationError(
                "Business Impact must be at least 20 characters."
            )
        if len(value) > 500:
            raise serializers.ValidationError(
                "Business impact cannot exceed 500 characters."
            )

        return value

    def validate(self, attrs):
        if not attrs.get("affected_scope"):
            raise serializers.ValidationError({
                "affected_scope": "Affected Scope is required."
            })

        return attrs

class TicketUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['assigned_to']

class TicketAssistanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketAssistance
        fields = ['id', 'ticket', 'assisted_by', 'assisted_note', 'created_at']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']

class TicketCommentSerializer(serializers.ModelSerializer):
    commented_by_name = serializers.SerializerMethodField()
    commented_by_role = serializers.SerializerMethodField()

    class Meta:
        model = TicketComments
        fields = ["id","ticket","commented_by","commented_by_name","commented_by_role","message","comment_type","created_at","updated_at",]
        read_only_fields = ["id","ticket","commented_by","commented_by_name","commented_by_role","created_at","updated_at",]

    def get_commented_by_name(self, obj):
        if not obj.commented_by:
            return "System"

        full_name = obj.commented_by.get_full_name().strip()
        return full_name or obj.commented_by.username

    def get_commented_by_role(self, obj):
        if not obj.commented_by:
            return "System"

        return obj.commented_by.role.name if obj.commented_by.role else None
        
class TicketStatusHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketStatusHistory
        fields = ['id', 'ticket', 'previous_status', 'new_status', 'remarks', 'created_by', 'created_at']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']

class TicketDetailEmployeeSerializer(serializers.ModelSerializer):
    status = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )

    is_under_review = serializers.BooleanField(
        read_only=True,
    )

    priority = serializers.CharField(
        source="priority.priority_level",
        read_only=True,
    )

    affected_scope = serializers.CharField(
        source="get_affected_scope_display",
        read_only=True,
    )

    assigned_to = serializers.SerializerMethodField()

    first_name = serializers.CharField(
        source="submitted_by.first_name",
        read_only=True,
    )

    last_name = serializers.CharField(
        source="submitted_by.last_name",
        read_only=True,
    )

    user_code = serializers.CharField(
        source="submitted_by.user_code",
        read_only=True,
    )

    employee_department = serializers.CharField(
        source="employee_department.name",
        read_only=True,
    )

    office_location = serializers.CharField(
        source="office_location.name",
        read_only=True,
    )

    class Meta:
        model = Ticket

        fields = [
            "id",
            "ticket_code",
            "status",
            "priority",
            "subject",
            "description",
            "assigned_to",
            "business_impact",
            "affected_scope",
            "updated_at",
            "created_at",
            "response_deadline",
            "resolution_deadline",
            "office_location",
            "workstation",
            "employee_department",
            "first_name",
            "last_name",
            "user_code",
            "is_under_review",
            "is_escalated",
            "resolved_at",
            "resolved_by",
        ]

    def get_assigned_to(self, obj):
        if not obj.assigned_to:
            return None

        full_name = (
            f"{obj.assigned_to.first_name} "
            f"{obj.assigned_to.last_name}"
        ).strip()

        return {
            "id": obj.assigned_to.id,
            "full_name": full_name or obj.assigned_to.username,
            "role": (
                obj.assigned_to.role.name
                if obj.assigned_to.role
                else None
            ),
        }
class TicketDetailSupportSerializer(serializers.ModelSerializer):
    status = serializers.CharField(
        source="get_status_display",
        read_only=True
    )
    priority = serializers.CharField(
        source="priority.priority_level",
        read_only=True
    )
    affected_scope = serializers.CharField(
        source="get_affected_scope_display",
        read_only=True
    )
    assigned_to = serializers.SerializerMethodField()
    is_under_review = serializers.BooleanField(
        read_only=True
    )
    first_name = serializers.CharField(
        source="submitted_by.first_name",
        read_only=True
    )
    last_name = serializers.CharField(
        source="submitted_by.last_name",
        read_only=True
    )
    user_code = serializers.CharField(
        source="submitted_by.user_code",
        read_only=True
    )
    employee_department = serializers.CharField(
        source="employee_department.name",
        read_only=True
    )
    office_location = serializers.CharField(
        source="office_location.name",
        read_only=True
    )
    category = serializers.CharField(
        source="category.name",
        read_only=True
    )
    symptom_code = serializers.CharField(
        source="symptom_code.code",
        read_only=True
    )
    required_specialization = serializers.CharField(
        source="symptom_code.required_specialization.name",
        read_only=True
    )
    classification_source = serializers.SerializerMethodField()
    classification_confidence = serializers.SerializerMethodField()
    it_department = serializers.CharField(
        source="it_department.name",
        read_only=True
    )
    automation = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_code",
            "status",
            "priority",
            "subject",
            "is_under_review",
            "description",
            "assigned_to",
            "business_impact",
            "affected_scope",
            "updated_at",
            "created_at",
            "response_deadline",
            "resolution_deadline",
            "office_location",
            "workstation",
            "employee_department",
            "first_name",
            "last_name",
            "user_code",
            "is_escalated",
            "resolved_at",
            "resolved_by",
            "category",
            "symptom_code",
            "required_specialization",
            "classification_source",
            "classification_confidence",
            "it_department",
            "automation",
        ]

    def get_assigned_to(self, obj):
        if not obj.assigned_to:
            return None

        return {
            "id": obj.assigned_to.id,
            "first_name": obj.assigned_to.first_name,
            "last_name": obj.assigned_to.last_name,
            "full_name": (
                f"{obj.assigned_to.first_name} "
                f"{obj.assigned_to.last_name}"
            ).strip(),
        }

    def get_classification_source(self, obj):
        analysis = getattr(
            obj,
            "ai_prediction",
            None
        )

        if not analysis:
            return None

        if analysis.was_overridden:
            return "Service Desk Reviewed"

        if (
            analysis.model_type
            == TicketAnalysis.ModelType.RULE_BASED
        ):
            return "Rule-Based"

        if (
            analysis.model_type
            == TicketAnalysis.ModelType.MACHINE_LEARNING
        ):
            return "Machine Learning"

        if (
            analysis.model_type
            == TicketAnalysis.ModelType.MANUAL_OVERRIDE
        ):
            return "Manual Override"

        return "System Classified"

    def get_classification_confidence(self, obj):
        analysis = getattr(
            obj,
            "ai_prediction",
            None
        )

        if not analysis:
            return None

        return analysis.confidence

    def calculate_rule_based_score(
        self,
        obj,
        ai_analysis
    ):
        if not ai_analysis:
            return None

        keywords = ai_analysis.keywords or []

        subject_text = normalize_text(
            obj.subject or ""
        )

        description_text = normalize_text(
            obj.description or ""
        )

        db_keywords = (
            Keyword.objects
            .select_related("symptom_code")
            .all()
        )

        scores = {}

        for gemini_kw in keywords:
            gemini_kw = normalize_text(
                gemini_kw
            )

            if not gemini_kw:
                continue

            for match in db_keywords:
                db_kw = normalize_text(
                    match.keyword
                )

                if not phrase_matches(
                    db_kw,
                    gemini_kw
                ):
                    continue

                if not match.symptom_code:
                    continue

                code = match.symptom_code.code

                base_weight = match.weight or 0

                specificity_bonus = len(
                    db_kw.split()
                )

                weight = (
                    base_weight
                    + specificity_bonus
                )

                if phrase_matches(
                    db_kw,
                    subject_text
                ):
                    weight *= 3

                elif phrase_matches(
                    db_kw,
                    description_text
                ):
                    weight *= 1

                scores[code] = (
                    scores.get(code, 0)
                    + weight
                )

        if not scores:
            return 0

        return max(scores.values())

    def get_automation(self, obj):
        ai_analysis = getattr(
            obj,
            "ai_analysis",
            None
        )

        ticket_analysis = getattr(
            obj,
            "ai_prediction",
            None
        )

        technicians = []

        department_candidates = 0
        available_candidates = 0
        exact_specialization_matches = 0

        required_specialization = None
        required_specialization_id = None

        if obj.symptom_code:
            specialization = (
                obj.symptom_code.required_specialization
            )

            if specialization:
                required_specialization = (
                    specialization.name
                )

                required_specialization_id = (
                    specialization.id
                )

        profiles = []

        if obj.it_department:
            profiles = (
                ITSupportProfile.objects
                .filter(
                    it_department=obj.it_department
                )
                .select_related(
                    "user",
                    "it_department",
                )
                .prefetch_related(
                    "specializations__specialization"
                )
                .order_by("id")
            )

        department_candidates = len(profiles)

        for profile in profiles:
            workload = Ticket.objects.filter(
                assigned_to=profile.user,
                status__in=[
                    Ticket.TicketStatus.IN_PROGRESS,
                    Ticket.TicketStatus.REOPENED,
                ],
            ).count()

            workload_limit = (
                profile.workload_limit
            )

            workload_available = (
                workload_limit > 0
                and workload < workload_limit
            )

            availability = (
                profile.availability_status
                == ITSupportProfile.AvailabilityStatus.available
            )

            specializations = [
                specialization.specialization.name
                for specialization
                in profile.specializations.all()
                if specialization.specialization
            ]

            specialization_match = (
                required_specialization_id is not None
                and any(
                    specialization.specialization_id
                    == required_specialization_id
                    for specialization
                    in profile.specializations.all()
                    if specialization.specialization
                )
            )

            if availability:
                available_candidates += 1

            if specialization_match:
                exact_specialization_matches += 1

            eligible = (
                availability
                and specialization_match
                and workload_available
            )

            if eligible:
                eligibility_reason = (
                    "Eligible: available, within workload "
                    "limit, and specialization matched."
                )
            elif not availability:
                eligibility_reason = (
                    "Not eligible: technician is unavailable."
                )
            elif not specialization_match:
                eligibility_reason = (
                    "Not eligible: required specialization "
                    "does not match."
                )
            elif not workload_available:
                eligibility_reason = (
                    "Not eligible: workload limit reached."
                )
            else:
                eligibility_reason = (
                    "Not eligible."
                )

            selected = (
                obj.assigned_to_id
                == profile.user_id
                if obj.assigned_to_id
                else False
            )

            technicians.append({
                "id": profile.id,
                "profileId": profile.id,
                "user_id": profile.user_id,
                "name": (
                    f"{profile.user.first_name} "
                    f"{profile.user.last_name}"
                ).strip()
                or profile.user.username,
                "availability": (
                    profile.availability_status
                ),
                "current_workload": workload,
                "workload_limit": workload_limit,
                "last_assigned": (
                    profile.last_assigned_at.isoformat()
                    if profile.last_assigned_at
                    else None
                ),
                "specializations": specializations,
                "specialization_match": (
                    specialization_match
                ),
                "eligible": eligible,
                "eligibility_reason": (
                    eligibility_reason
                ),
                "selected": selected,
            })

        if obj.assigned_to:
            assigned_name = (
                f"{obj.assigned_to.first_name} "
                f"{obj.assigned_to.last_name}"
            ).strip() or obj.assigned_to.username

            assigned_profile = (
                ITSupportProfile.objects
                .filter(
                    user=obj.assigned_to
                )
                .first()
            )

            current_workload = (
                Ticket.objects.filter(
                    assigned_to=obj.assigned_to,
                    status__in=[
                        Ticket.TicketStatus.IN_PROGRESS,
                        Ticket.TicketStatus.REOPENED,
                    ],
                ).count()
            )

            workload_limit = (
                assigned_profile.workload_limit
                if assigned_profile
                else 0
            )

            workload_ratio = (
                current_workload / workload_limit
                if workload_limit > 0
                else 0
            )

            assignment = {
                "status": "assigned",
                "technician": {
                    "id": obj.assigned_to.id,
                    "user_id": obj.assigned_to.id,
                    "name": assigned_name,
                    "current_workload": (
                        current_workload
                    ),
                    "workload_limit": (
                        workload_limit
                    ),
                    "workload_ratio": (
                        workload_ratio
                    ),
                    "last_assigned": (
                        assigned_profile.last_assigned_at.isoformat()
                        if (
                            assigned_profile
                            and assigned_profile.last_assigned_at
                        )
                        else None
                    ),
                },
                "reason": (
                    "Ticket is currently assigned "
                    "to this technician."
                ),
            }

        else:
            if exact_specialization_matches == 0:
                reason = (
                    "No technician in the department "
                    "matched the required specialization."
                )

            elif available_candidates == 0:
                reason = (
                    "No available technician was found "
                    "in the department."
                )

            else:
                reason = (
                    "No technician is currently assigned "
                    "to this ticket."
                )

            assignment = {
                "status": "unassigned",
                "technician": None,
                "reason": reason,
            }

        if ticket_analysis:
            if ticket_analysis.model_type:
                processing_method = (
                    ticket_analysis.model_type
                )
            else:
                processing_method = "rule_based"

        elif ai_analysis:
            processing_method = "ai_assisted"

        else:
            processing_method = None

        if ai_analysis:
            processing_status = "completed"

        elif obj.is_under_review:
            processing_status = "review_required"

        else:
            processing_status = "completed"

        rule_based_score = None

        if (
            ticket_analysis
            and ticket_analysis.model_type
            == TicketAnalysis.ModelType.RULE_BASED
        ):
            rule_based_score = (
                self.calculate_rule_based_score(
                    obj,
                    ai_analysis
                )
            )

        return {
            "status": processing_status,

            "method": processing_method,

            "symptom_code": (
                obj.symptom_code.code
                if obj.symptom_code
                else None
            ),

            "required_specialization": (
                required_specialization
            ),

            "required_specialization_id": (
                required_specialization_id
            ),

            "department": (
                obj.it_department.name
                if obj.it_department
                else None
            ),

            "priority": (
                obj.priority.priority_level
                if obj.priority
                else None
            ),

            "department_candidates": (
                department_candidates
            ),

            "available_candidates": (
                available_candidates
            ),

            "exact_specialization_matches": (
                exact_specialization_matches
            ),

            "classification": {
                "method": processing_method,

                "model_used": (
                    ticket_analysis.model_used
                    if ticket_analysis
                    else None
                ),

                "confidence": (
                    ticket_analysis.confidence
                    if ticket_analysis
                    else None
                ),

                "second_confidence": (
                    ticket_analysis.second_confidence
                    if ticket_analysis
                    else None
                ),

                "confidence_margin": (
                    ticket_analysis.confidence_margin
                    if ticket_analysis
                    else None
                ),

                "was_overridden": (
                    ticket_analysis.was_overridden
                    if ticket_analysis
                    else False
                ),

                "rule_based_score": (
                    rule_based_score
                ),
            },

            "ai_analysis": {
                "summary": (
                    ai_analysis.summary
                    if ai_analysis
                    else None
                ),

                "cleaned_text": (
                    ai_analysis.cleaned_text
                    if ai_analysis
                    else None
                ),

                "keywords": (
                    ai_analysis.keywords
                    if ai_analysis
                    else None
                ),

                "business_critical": (
                    ai_analysis.business_critical
                    if ai_analysis
                    else False
                ),

                "is_unclear": (
                    ai_analysis.is_unclear
                    if ai_analysis
                    else False
                ),

                "is_time_critical": (
                    ai_analysis.is_time_critical
                    if ai_analysis
                    else False
                ),

                "model_version": (
                    ai_analysis.model_version
                    if ai_analysis
                    else None
                ),
            },

            "technicians_considered": (
                technicians
            ),

            "assignment": assignment,
        }

class TicketStatusHistorySerializer(serializers.ModelSerializer):
    message = serializers.SerializerMethodField()
    class Meta:
        model = TicketStatusHistory
        fields = [
            "id",
            "event_type",
            "old_value",
            "new_value",
            "remarks",
            "changed_by",
            "created_at",
            "message",
        ]

    def get_message(self, obj):
        if obj.event_type == TicketStatusHistory.EventType.CREATED:
            return "Ticket was submitted."

        elif obj.event_type == TicketStatusHistory.EventType.ASSIGNED:
            return f"Ticket was assigned to {obj.new_value}."

        elif obj.event_type == TicketStatusHistory.EventType.REASSIGNED:
            return f"Ticket was reassigned to {obj.new_value}."

        elif obj.event_type == TicketStatusHistory.EventType.RETURNED:
            return "Ticket was returned to the Service Desk for rerouting."

        elif obj.event_type == TicketStatusHistory.EventType.REVIEW_COMPLETED:
            if (
                obj.old_value
                and obj.new_value
                and obj.old_value != obj.new_value
            ):
                return (
                    "The ticket review was completed "
                    "and the model recommendation was overridden."
                )

            return "The ticket review was completed successfully."

        elif (
            obj.event_type
            == TicketStatusHistory.EventType.PRIORITY_REVIEW_REQUESTED
        ):
            return "A priority level review was requested."

        elif obj.event_type == TicketStatusHistory.EventType.STATUS_CHANGED:
            if obj.new_value == Ticket.TicketStatus.UNDER_REVIEW:
                return "Ticket is now under review."

            elif obj.new_value == Ticket.TicketStatus.IN_PROGRESS:
                return "Ticket is now in progress."

            elif obj.new_value == Ticket.TicketStatus.RETURNED:
                return "Ticket was returned."

            elif obj.new_value == Ticket.TicketStatus.REOPENED:
                return "Ticket was reopened."

            elif obj.new_value == Ticket.TicketStatus.CANCELLED:
                return "Ticket was cancelled."

            elif obj.new_value == Ticket.TicketStatus.RESOLVED:
                return "The issue has been resolved."

            elif obj.new_value == Ticket.TicketStatus.CLOSED:
                return "Ticket was closed."

            elif obj.new_value == Ticket.TicketStatus.OPEN:
                return "Ticket is now open."

            return f"Ticket status changed to {obj.new_value}."

        elif obj.event_type == TicketStatusHistory.EventType.PRIORITY_CHANGED:
            return (
                f"Ticket priority changed from "
                f"{obj.old_value} to {obj.new_value}."
            )

        elif obj.event_type == TicketStatusHistory.EventType.ESCALATED:
            return "Ticket was escalated."

        return "Ticket was updated."
# --- SLA Rules Serializer ---
class SLARulesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SLARules
        fields = ['id', 'priority_level', 'response_time', 'resolution_time', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']

class SLARulesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SLARules
        fields = ['resolution_time']
# --- Category Serializer --- 

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'it_department', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

class CategoryUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['it_department']

# --- Keyword Serializer ---
class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ['id', 'symptom_code', 'keyword', 'weight', 'is_active', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

class KeywordUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ['weight']
class SymptomCodeSerializer(serializers.ModelSerializer):
    category = serializers.CharField(
        source="category.name",
        read_only=True
    )

    department = serializers.CharField(
        source="category.it_department.name",
        read_only=True
    )

    class Meta:
        model = SymptomCode
        fields = [
            "id",
            "code",
            "category",
            "department",
            "description",
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
            "based_priority",
        ]

        read_only_fields = [
            "created_by",
            "updated_by",
            "created_at",
            "updated_at",
        ]
class UpdateSymptomCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCode
        fields = ['description']

class CreateSymptomCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCode
        fields = ['code', 'category', 'description', 'based_priority']


class PriorityChangeRequestSerializer(serializers.Serializer):
    requested_priority = serializers.ChoiceField(
        choices=["P1", "P2", "P3"]
    )
    reason = serializers.CharField()

    def validate_reason(self, value):
        if not value.strip():
            raise serializers.ValidationError(
                "Reason for priority change is required."
            )

        return value.strip()

class PriorityRequestListSerializer(serializers.ModelSerializer):
    ticket_id = serializers.IntegerField(source="ticket.id", read_only=True)
    ticket_code = serializers.CharField(source="ticket.ticket_code", read_only=True)
    subject = serializers.CharField(source="ticket.subject", read_only=True)
    current_priority = serializers.CharField(source="current_priority.priority_level", read_only=True)
    requested_priority = serializers.CharField(source="requested_priority.priority_level", read_only=True)
    requested_by_first_name = serializers.CharField(source="requested_by.first_name", read_only=True)
    requested_by_last_name = serializers.CharField(source="requested_by.last_name", read_only=True)
    it_department = serializers.CharField(source="requested_by.it_support_profile.it_department.name", read_only=True)

    class Meta:
        model = TicketPriorityRequest
        fields = ["id", "ticket_id", "ticket_code", "subject", "current_priority", "requested_priority", "it_department", "requested_by_first_name", "requested_by_last_name", "reason", "status", "requested_at"]

class PriorityRequestDetailSerializer(serializers.ModelSerializer):
    ticket_id = serializers.IntegerField(source="ticket.id", read_only=True)
    ticket_code = serializers.CharField(source="ticket.ticket_code", read_only=True)
    subject = serializers.CharField(source="ticket.subject", read_only=True)
    description = serializers.CharField(source="ticket.description", read_only=True)
    business_impact = serializers.CharField(source="ticket.business_impact", read_only=True)
    affected_scope = serializers.CharField(source="ticket.get_affected_scope_display", read_only=True)

    current_priority = serializers.CharField(source="current_priority.priority_level", read_only=True)
    requested_priority = serializers.CharField(source="requested_priority.priority_level", read_only=True)

    requested_by_user_code = serializers.CharField(source="requested_by.user_code", read_only=True)
    requested_by_first_name = serializers.CharField(source="requested_by.first_name", read_only=True)
    requested_by_last_name = serializers.CharField(source="requested_by.last_name", read_only=True)
    requested_by_role = serializers.CharField(source="requested_by.role", read_only=True)
    it_department = serializers.CharField(source="requested_by.it_support_profile.it_department.name", read_only=True)
    employee_department = serializers.CharField(source="ticket.employee_department.name", read_only=True)
    office_location = serializers.CharField(source="requested_by.profile.office_location.name", read_only=True)

    reviewed_by_user_code = serializers.CharField(source="reviewed_by.user_code", read_only=True)
    reviewed_by_first_name = serializers.CharField(source="reviewed_by.first_name", read_only=True)
    reviewed_by_last_name = serializers.CharField(source="reviewed_by.last_name", read_only=True)
    reviewed_by_role = serializers.CharField(source="reviewed_by.role", read_only=True)

    submitted_at = serializers.DateTimeField(source="ticket.created_at", read_only=True)
    submitted_by_first_name = serializers.CharField(source="ticket.submitted_by.first_name", read_only=True)
    submitted_by_last_name = serializers.CharField(source="ticket.submitted_by.last_name", read_only=True)
    submitted_by_user_code = serializers.CharField(source="ticket.submitted_by.user_code", read_only=True)
    submitted_by_role = serializers.CharField(source="ticket.submitted_by.role", read_only=True)

    class Meta:
        model = TicketPriorityRequest
        fields = [
            "id",
            "ticket_id",
            "ticket_code",
            "subject",
            "description",
            "business_impact",
            "affected_scope",
            "current_priority",
            "requested_priority",
            "requested_by_user_code",
            "requested_by_first_name",
            "requested_by_last_name",
            "it_department",
            "office_location",
            "reason",
            "status",
            "requested_at",
            "reviewed_by_user_code",
            "reviewed_by_first_name",
            "reviewed_by_last_name",
            "reviewed_at",
            "review_remarks",
            "submitted_at", 
            "submitted_by_first_name", "submitted_by_last_name", "submitted_by_user_code", "submitted_by_role",
            "requested_by_role", "employee_department", "reviewed_by_role"
        ]


class ReturnTicketSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=True,
        allow_blank=False,
    )

    def validate_reason(self, value):
        value = value.strip()

        if len(value) < 15:
            raise serializers.ValidationError(
                "Additional details must be at least 15 characters."
            )

        if len(value) > 500:
            raise serializers.ValidationError(
                "Additional details cannot exceed 500 characters."
            )

        return value


class ReturnedTicketRequestListSerializer(serializers.ModelSerializer):
    ticket_id = serializers.IntegerField(
        source="ticket.id",
        read_only=True,
    )

    ticket_code = serializers.CharField(
        source="ticket.ticket_code",
        read_only=True,
    )

    subject = serializers.CharField(
        source="ticket.subject",
        read_only=True,
    )

    returned_by_user_code = serializers.CharField(
        source="returned_by.user_code",
        read_only=True,
    )

    returned_by_first_name = serializers.CharField(
        source="returned_by.first_name",
        read_only=True,
    )

    returned_by_last_name = serializers.CharField(
        source="returned_by.last_name",
        read_only=True,
    )

    it_department = serializers.CharField(
        source="returned_by.it_support_profile.it_department.name",
        read_only=True,
    )

    office_location = serializers.CharField(
        source="returned_by.profile.office_location.name",
        read_only=True,
    )

    class Meta:
        model = TicketReturn

        fields = [
            "id",
            "ticket_id",
            "ticket_code",
            "subject",
            "returned_by_user_code",
            "returned_by_first_name",
            "returned_by_last_name",
            "it_department",
            "office_location",
            "reason",
            "status",
            "requested_at",
        ]


class ReturnedTicketDetailSerializer(serializers.ModelSerializer):
    ticket_id = serializers.IntegerField(
        source="ticket.id",
        read_only=True,
    )

    ticket_code = serializers.CharField(
        source="ticket.ticket_code",
        read_only=True,
    )

    subject = serializers.CharField(
        source="ticket.subject",
        read_only=True,
    )

    description = serializers.CharField(
        source="ticket.description",
        read_only=True,
    )

    business_impact = serializers.CharField(
        source="ticket.business_impact",
        read_only=True,
    )

    affected_scope = serializers.CharField(
        source="ticket.get_affected_scope_display",
        read_only=True,
    )

    submitted_at = serializers.DateTimeField(
        source="ticket.created_at",
        read_only=True,
    )

    submitted_by_first_name = serializers.CharField(
        source="ticket.submitted_by.first_name",
        read_only=True,
    )

    submitted_by_last_name = serializers.CharField(
        source="ticket.submitted_by.last_name",
        read_only=True,
    )

    submitted_by_user_code = serializers.CharField(
        source="ticket.submitted_by.user_code",
        read_only=True,
    )

    submitted_by_role = serializers.CharField(
        source="ticket.submitted_by.role",
        read_only=True,
    )

    returned_by_first_name = serializers.CharField(
        source="returned_by.first_name",
        read_only=True,
    )

    returned_by_last_name = serializers.CharField(
        source="returned_by.last_name",
        read_only=True,
    )

    returned_by_user_code = serializers.CharField(
        source="returned_by.user_code",
        read_only=True,
    )

    returned_by_role = serializers.CharField(
        source="returned_by.role",
        read_only=True,
    )

    reviewed_by_first_name = serializers.CharField(
        source="reviewed_by.first_name",
        read_only=True,
    )

    reviewed_by_last_name = serializers.CharField(
        source="reviewed_by.last_name",
        read_only=True,
    )

    reviewed_by_user_code = serializers.CharField(
        source="reviewed_by.user_code",
        read_only=True,
    )

    reviewed_by_role = serializers.CharField(
        source="reviewed_by.role",
        read_only=True,
    )

    it_department = serializers.CharField(
        source="returned_by.it_support_profile.it_department.name",
        read_only=True,
    )

    employee_department = serializers.CharField(
        source="ticket.employee_department.name",
        read_only=True,
    )

    symptom_code = serializers.CharField(
        source="ticket.symptom_code.code",
        read_only=True,
    )

    category = serializers.CharField(
        source="ticket.category.name",
        read_only=True,
    )

    department = serializers.CharField(
        source="ticket.it_department.name",
        read_only=True,
    )

    returned_at = serializers.DateTimeField(
        source="requested_at",
        read_only=True,
    )

    class Meta:
        model = TicketReturn

        fields = [
            "id",
            "reason",
            "status",
            "review_remarks",
            "returned_at",
            "reviewed_at",

            "reviewed_by_first_name",
            "reviewed_by_last_name",
            "reviewed_by_user_code",
            "reviewed_by_role",

            "ticket_id",
            "ticket_code",
            "subject",
            "description",
            "business_impact",
            "affected_scope",
            "submitted_at",

            "submitted_by_first_name",
            "submitted_by_last_name",
            "submitted_by_user_code",
            "submitted_by_role",

            "returned_by_first_name",
            "returned_by_last_name",
            "returned_by_user_code",
            "returned_by_role",

            "it_department",
            "employee_department",
            "symptom_code",
            "category",
            "department",
        ]


class ApproveReturnTicketSerializer(serializers.Serializer):
    symptom_code_id = serializers.IntegerField(
        required=True,
    )

    review_remarks = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=500,
    )

    def validate_review_remarks(self, value):
        return value.strip()


class RejectReturnTicketSerializer(serializers.Serializer):
    review_remarks = serializers.CharField(
        required=True,
        allow_blank=False,
        trim_whitespace=True,
    )
class ServiceDeskDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITDepartment
        fields = [
            "id",
            "name",
        ]

class EmployeeCurrentActiveTicketSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.SerializerMethodField()
    priority = serializers.SerializerMethodField()
    resolution_time_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Ticket
        fields = [
            "id",
            "ticket_code",
            "subject",
            "status",
            "priority",
            "assigned_to_name",
            "created_at",
            "resolution_deadline",
            "resolution_time_remaining",
        ]

    def get_assigned_to_name(self, obj):
        if not obj.assigned_to:
            return None

        full_name = obj.assigned_to.get_full_name()

        return full_name or obj.assigned_to.username

    def get_priority(self, obj):
        if not obj.priority:
            return None

        return obj.priority.priority_level

    def get_resolution_time_remaining(self, obj):
        if not obj.resolution_deadline:
            return None

        from django.utils import timezone

        remaining = obj.resolution_deadline - timezone.now()

        if remaining.total_seconds() <= 0:
            return "SLA Breached"

        total_seconds = int(remaining.total_seconds())

        days, remainder = divmod(total_seconds, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, _ = divmod(remainder, 60)

        if days > 0:
            return f"{days}d {hours}h"

        if hours > 0:
            return f"{hours}h {minutes}m"

        return f"{minutes}m"

# --- Escalation ---
from django.utils import timezone
from rest_framework import serializers


class SupervisorEscalatedTicketSerializer(serializers.ModelSerializer):
    submitted_by_name = serializers.SerializerMethodField()
    submitted_by_department = serializers.SerializerMethodField()
    assigned_to_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    status = serializers.CharField(
        source="get_status_display",
        read_only=True,
    )
    priority = serializers.CharField(
        source="priority.priority_level",
        read_only=True,
    )

    response_time_remaining = serializers.SerializerMethodField()
    resolution_time_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Ticket

        fields = [
            "id",
            "ticket_code",
            "subject",
            "status",
            "priority",
            "submitted_by_name",
            "submitted_by_department",
            "assigned_to_name",
            "department_name",
            "response_deadline",
            "response_time_remaining",
            "resolution_deadline",
            "resolution_time_remaining",
            "escalated_at",
            "updated_at",
        ]

    def get_submitted_by_name(self, obj):
        if not obj.submitted_by:
            return "-"

        return (
            obj.submitted_by.get_full_name()
            or obj.submitted_by.username
        )

    def get_submitted_by_department(self, obj):
        if not obj.submitted_by:
            return "-"

        profile = getattr(
            obj.submitted_by,
            "profile",
            None,
        )

        if not profile:
            return "-"

        department = getattr(
            profile,
            "employee_department",
            None,
        )

        if not department:
            return "-"

        return department.name

    def get_assigned_to_name(self, obj):
        if not obj.assigned_to:
            return "-"

        return (
            obj.assigned_to.get_full_name()
            or obj.assigned_to.username
        )

    def get_department_name(self, obj):
        if not obj.it_department:
            return "-"

        return obj.it_department.name

    def get_response_time_remaining(self, obj):
        if obj.response_at:
            if obj.response_sla_status:
                return obj.response_sla_status.upper()

            if (
                obj.response_deadline
                and obj.response_at <= obj.response_deadline
            ):
                return "MET"

            return "BREACHED"

        if not obj.response_deadline:
            return "-"

        remaining = obj.response_deadline - timezone.now()

        if remaining.total_seconds() <= 0:
            return "OVERDUE"

        total_seconds = int(remaining.total_seconds())

        days, remainder = divmod(total_seconds, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, seconds = divmod(remainder, 60)

        if days > 0:
            return f"{days}d {hours}h {minutes}m"

        if hours > 0:
            return f"{hours}h {minutes}m"

        if minutes > 0:
            return f"{minutes}m {seconds}s"

        return f"{seconds}s"

    def get_resolution_time_remaining(self, obj):
        if obj.resolved_at:
            if obj.resolution_sla_status:
                return obj.resolution_sla_status.upper()

            if (
                obj.resolution_deadline
                and obj.resolved_at <= obj.resolution_deadline
            ):
                return "MET"

            return "BREACHED"

        if not obj.resolution_deadline:
            return "-"

        remaining = obj.resolution_deadline - timezone.now()

        if remaining.total_seconds() <= 0:
            return "OVERDUE"

        total_seconds = int(remaining.total_seconds())

        days, remainder = divmod(total_seconds, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, seconds = divmod(remainder, 60)

        if days > 0:
            return f"{days}d {hours}h {minutes}m"

        if hours > 0:
            return f"{hours}h {minutes}m"

        if minutes > 0:
            return f"{minutes}m {seconds}s"

        return f"{seconds}s"
# class TicketSLASerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TicketSLA
#         fields = ['sla_deadline', 'is_breached', 'sla_warning_sent']

# class TicketEscalationSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TicketEscalation
#         fields = ['escalated_by', 'escalated_to', 'escalation_reason', 'escalated_at']
#         read_only_fields = ['escalated_by', 'escalated_at']

# class TicketAssigneeSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = TicketAssignee
#         fields = ['id', 'user', 'assigned_at']
#         read_only_fields = ['assigned_at']

# SLA_TIMES = {
#     "P1": timedelta(hours=2),
#     "P2": timedelta(hours=3),
#     "P3": timedelta(days=2),
#     "P4": timedelta(days=4),
#     "P5": timedelta(days=7),
# }


    # def create(self, validated_data):
    #     request = self.context.get('request')
    #     validated_data['submitted_by'] = request.user    

    #     # Might to remove this if training data is done.
    #     if validated_data.get('status') == 'resolved':
    #         validated_data['resolved_at'] = timezone.now()

    #     ticket = super().create(validated_data)

    #     if ticket.priority_level:
    #         sla_deadline = ticket.created_at + SLA_TIMES.get(
    #             ticket.priority_level, 
    #             timedelta(days=7)
    #         )
    #         TicketSLA.objects.create(
    #             ticket=ticket,
    #             sla_deadline=sla_deadline,
    #             is_breached=timezone.now() > sla_deadline
    #         )

    #     return ticket
    

    # def update(self, instance, validated_data):
    #     if validated_data.get('status') == 'resolved':
    #         validated_data['resolved_at'] = timezone.now()

    #     priority = validated_data.get('priority_level')
    #     if priority:
    #         sla_deadline = instance.created_at + SLA_TIMES.get(
    #             priority,
    #             timedelta(days=7)
    #         )
    #         TicketSLA.objects.update_or_create(
    #             ticket=instance,
    #             defaults={
    #                 'sla_deadline': sla_deadline,
    #                 'is_breached': timezone.now() > sla_deadline
    #             }
    #         )

    #     return super().update(instance, validated_data)