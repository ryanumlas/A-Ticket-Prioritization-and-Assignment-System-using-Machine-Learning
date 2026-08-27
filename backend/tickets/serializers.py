from rest_framework import serializers
from .models import Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketAssistance, Keyword
from django.utils import timezone
from datetime import timedelta

from rest_framework import serializers
from tickets.models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display', read_only=True)
    assigned_to = serializers.SerializerMethodField()   
    resolution_time_remaining = serializers.SerializerMethodField()
    response_time_remaining = serializers.SerializerMethodField()
    
    priority = serializers.CharField(
        source='priority.priority_level',
        read_only=True
    )
    created_at_formatted = serializers.SerializerMethodField()
    class Meta:
        model = Ticket
        fields = [
            'id',
            'ticket_code',
            'submitted_by',
            'assigned_to',
            'updated_by',
            'it_department',
            'employee_department',
            'subject',
            'description',
            'business_impact',
            'affected_scope',
            'category',
            'symptom_code',
            'status',
            'priority',
            'is_under_review',
            "response_deadline",
            'response_time_remaining',
            'resolution_deadline',
            'resolution_time_remaining',
            'is_escalated',
            'resolved_at',
            'resolved_by',
            'created_at',
            'created_at_formatted',
            'updated_at',
        ]
        read_only_fields = [
            'submitted_by',
            'updated_by',
            'resolved_at',
            'created_at',
            'updated_at',
        ]   
    def get_response_time_remaining(self, obj):

            # Response SLA is already completed
            if obj.response_at:
                return "MET"

            if not obj.response_deadline:
                return None

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
            return "MET"

        if not obj.resolution_deadline:
            return None

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

    def _get_remaining_time(self, deadline):
        if not deadline:
            return None

        remaining = deadline - timezone.now()

        if remaining.total_seconds() <= 0:
            return "Overdue"

        total_seconds = int(remaining.total_seconds())

        days, remainder = divmod(total_seconds, 86400)
        hours, remainder = divmod(remainder, 3600)
        minutes, _ = divmod(remainder, 60)

        if days > 0:
            return f"{days}d {hours}h"

        if hours > 0:
            return f"{hours}h {minutes}m"

        return f"{minutes}m"

    def get_assigned_to(self, obj):
        if not obj.assigned_to:
            return None
        return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()

    def get_created_at_formatted(self, obj):
        return timezone.localtime(obj.created_at).strftime("%B %d, %Y %I:%M %p")
    # Priority: P3

    # Response SLA
    # • Deadline: July 18, 2026 3:30 PM
    # • Time Remaining: 42m

    # Resolution SLA
    # • Deadline: July 19, 2026 2:30 PM
    # • Time Remaining: 23h 42m
    # def get_response_deadline(self, obj):
    #     if not obj.response_deadline:
    #         return None

    #     return timezone.localtime(
    #         obj.response_deadline
    #     ).strftime("%B %d, %Y %I:%M %p")
    
    # def get_response_time_remaining(self, obj):
    #     if not obj.response_deadline:
    #         return None

    #     remaining = obj.response_deadline - timezone.now()

    #     if remaining.total_seconds() <= 0:
    #         return "Overdue"

    #     days = remaining.days
    #     hours = remaining.seconds // 3600
    #     minutes = (remaining.seconds % 3600) // 60

    #     return f"{days}d {hours}h {minutes}m"
    
    # def get_resolution_deadline(self, obj):
    #     if not obj.resolution_deadline:
    #         return None

    #     return timezone.localtime(
    #         obj.resolution_deadline
    #     ).strftime("%B %d, %Y %I:%M %p")

    # def get_resolution_time_remaining(self, obj):
    #     if not obj.resolution_deadline:
    #         return None

    #     remaining = obj.resolution_deadline - timezone.now()

    #     if remaining.total_seconds() <= 0:
    #         return "Overdue"

    #     days = remaining.days
    #     hours = remaining.seconds // 3600
    #     minutes = (remaining.seconds % 3600) // 60

        # return f"{days}d {hours}h {minutes}m"

class FlaggedTicketsListSerializer(serializers.ModelSerializer):
    ticket_code = serializers.CharField(source="ticket.ticket_code", read_only=True)
    subject = serializers.CharField(source="ticket.subject", read_only=True)
    reason = serializers.CharField(source="get_reason_display", read_only=True)
    status = serializers.CharField(source="get_status_display", read_only=True)
    class Meta:
        model = ReviewFlags
        fields = ["id", "ticket_code", "subject", "reason", "status", "created_at"]

class FlaggedTicketDetailSerializer(serializers.ModelSerializer):
    ticket_code = serializers.CharField(source="ticket.ticket_code", read_only=True)
    subject = serializers.CharField(source="ticket.subject", read_only=True)
    description = serializers.CharField(source="ticket.description", read_only=True)
    business_impact = serializers.CharField(source="ticket.business_impact", read_only=True)
    affected_scope = serializers.CharField(source="ticket.get_affected_scope_display", read_only=True)
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
    class Meta:
        model = ReviewFlags
        fields = ["id", "ticket_code", "subject", "description", "business_impact", "affected_scope", 
                  "reason", "status", "predicted_symptom_code", "second_predicted_symptom_code", "confidence", "second_confidence", 
                  "confidence_margin", "summary", "business_critical", "is_unclear", "created_at", "first_name", "last_name", "user_code", 
                  "employee_department", "office_location", "workstation", "cleaned_text", "summary"]

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
        if len(value) > 1000:
            raise serializers.ValidationError(
                "Description cannot exceed 1000 characters."
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
    class Meta:
        model = TicketComments
        fields = ['id', 'ticket', 'commented_by', 'message', 'created_at', 'comment_type']
        read_only_fields = ['created_at', 'updated_at', 'updated_by']
        
class TicketStatusHistory(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'ticket', 'previous_status', 'new_status', 'remarks', 'created_by', 'created_at']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']

class TicketDetailEmployeeSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display', read_only=True)
    priority = serializers.CharField(source='priority.priority_level', read_only=True)
    affected_scope = serializers.CharField(source='get_affected_scope_display', read_only=True)
    assigned_to = serializers.SerializerMethodField()
    first_name = serializers.CharField(source='submitted_by.first_name', read_only=True)
    last_name = serializers.CharField(source='submitted_by.last_name', read_only=True)
    user_code = serializers.CharField(source='submitted_by.user_code', read_only=True)
    employee_department = serializers.CharField(source='employee_department.name', read_only=True)
    office_location = serializers.CharField(source='office_location.name', read_only=True)
    class Meta:
        model = Ticket

        fields = ['id','ticket_code', 'status', 'priority', 'subject', 'description', 'assigned_to', 'business_impact', 'affected_scope', 'updated_at', 'created_at', 'response_deadline', 'resolution_deadline', 'office_location', 'workstation','employee_department', 'first_name', 'last_name', 'user_code', 'is_escalated', 'resolved_at', 'resolved_by']

    def get_assigned_to(self, obj):
        if not obj.assigned_to:
            return None
        return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
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
    class Meta:
        model = SymptomCode
        fields = ['id', 'code', 'category', 'description', 'created_by', 'updated_by', 'created_at', 'updated_at', 'based_priority']
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']
    
class UpdateSymptomCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCode
        fields = ['required_specialization']

class CreateSymptomCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCode
        fields = ['code', 'category', 'description', 'based_priority']

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