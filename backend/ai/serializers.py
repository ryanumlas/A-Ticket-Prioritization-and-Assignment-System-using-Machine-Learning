from .models import TicketAnalysis
from rest_framework import serializers

class TicketAnalysisSerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketAnalysis
        fields = [
            'id',
            'ticket',
            'predicted_priority',
            'predicted_category',
            'predicted_symptom_code',
            'recommended_department',
            'estimated_resolution_time',
            'model_used',
            'overall_confidence',
            'created_by',
            'updated_by',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']