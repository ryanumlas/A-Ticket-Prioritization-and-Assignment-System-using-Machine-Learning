from django.db import models
from users.models import User
from departments.models import Department

class TicketAnalysis(models.Model):
    class ModelType(models.TextChoices):
        RULE_BASED = 'rule_based', 'Rule-Based'
        MACHINE_LEARNING = 'machine_learning', 'Machine Learning'
        MANUAL_OVERRIDE = 'manual_override', 'Manual Override'

    ticket = models.OneToOneField('tickets.Ticket', on_delete=models.CASCADE, related_name='ai_prediction')
    predicted_symptom_code = models.ForeignKey('tickets.SymptomCode', on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_predictions')
    recommended_department = models.ForeignKey('departments.Department', on_delete=models.SET_NULL, null=True, blank=True, related_name='ai_recommendations')
    estimated_resolution_time = models.DurationField(null=True, blank=True)  
    model_used = models.CharField(max_length=255, blank=True, null=True)
    overall_confidence = models.FloatField(null=True, blank=True)
    was_overridden = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_ai_predictions')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_ai_predictions')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    class Meta:
        db_table = 'ticket_analysis'

    def __str__(self):
        return f"Ticket Analysis for Ticket #{self.ticket.id}"

class TicketAIAnalysis(models.Model):
    ticket = models.OneToOneField('tickets.Ticket', on_delete=models.CASCADE, related_name='ai_analysis')
    cleaned_text = models.TextField(blank=True, null=True)
    summary = models.TextField(blank=True, null=True)
    keywords = models.JSONField(blank=True, null=True)
    model_version = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticket_ai_analysis'

    def __str__(self):
        return f"AI Analysis for Ticket #{self.ticket.id}"


# class AIPredictionAdmin(models.Model):
#     ai_prediction = models.ForeignKey(AIPrediction, on_delete=models.CASCADE, related_name='administrators')
#     admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_prediction_administrations')
#     score = models.FloatField()

#     class Meta:
#         db_table = 'ai_prediction_admin'