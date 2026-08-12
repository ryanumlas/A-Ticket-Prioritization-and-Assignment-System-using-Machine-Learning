from rest_framework import serializers
from .models import Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketAssistance, Keyword
from django.utils import timezone
from datetime import timedelta

from rest_framework import serializers
from tickets.models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display', read_only=True)
    
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
            'resolution_deadline',
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
    
    def get_created_at_formatted(self, obj):
        return timezone.localtime(obj.created_at).strftime("%B %d, %Y %I:%M %p")



class TicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            "workstation",
            "subject",
            "description",
            "business_impact",
            "affected_scope",
        ]

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
        fields = ['status']

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
    first_name = serializers.CharField(source='submitted_by.first_name', read_only=True)
    last_name = serializers.CharField(source='submitted_by.last_name', read_only=True)
    user_code = serializers.CharField(source='submitted_by.user_code', read_only=True)
    employee_department = serializers.CharField(source='employee_department.name', read_only=True)
    office_location = serializers.CharField(source='office_location.name', read_only=True)
    class Meta:
        model = Ticket

        fields = ['id','ticket_code', 'status', 'priority', 'subject', 'description', 'assigned_to', 'business_impact', 'affected_scope', 'updated_at', 'created_at', 'response_deadline', 'resolution_deadline', 'office_location', 'workstation','employee_department', 'first_name', 'last_name', 'user_code', 'is_escalated', 'resolved_at', 'resolved_by']

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