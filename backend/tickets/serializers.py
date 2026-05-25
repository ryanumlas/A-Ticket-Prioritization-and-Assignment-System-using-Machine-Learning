from rest_framework import serializers
from .models import Ticket, Category, SymptomCode, TicketComments, SLARules, ReviewFlags, TicketAssistance
from django.utils import timezone
from datetime import timedelta

from rest_framework import serializers
from tickets.models import Ticket


class TicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = [
            'id',
            'submitted_by',
            'assigned_to',
            'created_by',
            'updated_by',
            'department',
            'subject',
            'description',
            'category',
            'symptom_code',
            'status',
            'priority',
            'is_under_review',
            'estimated_resolution_time',
            'is_escalated',
            'resolved_at',
            'resolved_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'submitted_by',
            'created_by',
            'updated_by',
            'resolved_at',
            'created_at',
            'updated_at',
        ]

class TicketAssistanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketAssistance
        fields = ['id', 'ticket', 'assisted_by', 'assisted_note', 'created_at']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']

class TicketCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketComments
        fields = ['id', 'ticket', 'commented_by', 'message', 'created_at', 'comment_type', 'is_internal']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']
        
class TicketStatusHistory(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['id', 'ticket', 'previous_status', 'new_status', 'remarks', 'created_by', 'created_at']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']

# --- SLA Rules Serializer ---
class SLARulesSerializer(serializers.ModelSerializer):
    class Meta:
        model = SLARules
        fields = ['id', 'priority_level', 'response_time', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'created_by', 'updated_at', 'updated_by']

class SLARulesUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SLARules
        fields = ['priority_level', 'response_time']
# --- Category Serializer --- 

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'department', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCode
        fields = ['id', 'symptom_code', 'category', 'priority', 'keyword', 'score', 'active_flag', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

class SymptomCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomCode
        fields = ['id', 'code', 'category', 'description', 'created_by', 'updated_by', 'created_at', 'updated_at']
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

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