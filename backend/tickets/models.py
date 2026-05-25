from django.db import models
from users.models import User
from ai.models import TicketAnalysis
from departments.models import Department

# Create your models here.
class Ticket(models.Model):
    class TicketStatus(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        UNDER_REVIEW = 'under_review', 'Under Review'
        PENDING = 'pending', 'Pending'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'
        REOPENED = 'reopened', 'Reopened'
        CANCELLED = 'cancelled', 'Cancelled'
        # ESCALATED = 'escalated', 'Escalated'
        # EXPIRED = 'expired', 'Expired'
        # CLOSED = 'closed', 'Closed'
        # NEEDS_INPUT = 'needs_input', 'Needs Input'
    
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_tickets')
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_category')
    symptom_code = models.ForeignKey('SymptomCode', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_symptom_code')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_department')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    status = models.CharField(max_length=20, choices=TicketStatus.choices, default=TicketStatus.OPEN)
    priority = models.ForeignKey('SLARules', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_priority')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    is_under_review = models.BooleanField(default=False)
    estimated_resolution_time = models.DurationField(null=True, blank=True)
    is_escalated = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_tickets')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tickets')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tickets'
    
    def __str__(self):
        return f"Ticket #{self.id} - {self.subject}"

class TicketAssistance(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='assistances')
    assisted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='provided_assistance')
    assisted_note = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tickets_assistance')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_tickets_assistance')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticket_assistance'

    def __str__(self):
        return f"Assistance for Ticket #{self.ticket.id} by {self.assisted_by.email if self.assisted_by else 'Unknown'}"
    
class TicketComments(models.Model):
    class CommentType(models.TextChoices):
        PUBLIC_REPLY = 'public_reply', 'Public Reply'
        INTERNAL_NOTE = 'internal_note', 'Internal Note'
        SYSTEM_LOG = 'system_log', 'System Log'

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    commented_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ticket_comments')
    message = models.TextField()
    comment_type = models.CharField(max_length=20, choices=CommentType.choices, default=CommentType.PUBLIC_REPLY)
    is_internal = models.BooleanField(default=False)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tickets_comments')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_tickets_comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticket_comments'

class TicketStatusHistory(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='status_history')
    previous_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    remarks = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tickets_status_history')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_tickets_status_history')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticket_status_history'

class SLARules(models.Model):
    priority_level = models.CharField(max_length=20, unique=True)
    response_time = models.DurationField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_sla_rules')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_sla_rules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sla_rules'

    def __str__(self):
        return f"SLA Rule - {self.priority_level}"

class Category(models.Model):
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_categories')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_categories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'

class Keyword(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='keywords')
    symptom_code = models.ForeignKey('SymptomCode', on_delete=models.SET_NULL, null=True, blank=True, related_name='keywords_symptom_code')
    priority = models.ForeignKey(SLARules, on_delete=models.SET_NULL, null=True, blank=True, related_name='keywords_priority')
    keyword = models.CharField(max_length=100)
    score = models.IntegerField()
    active_flag = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_keywords')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_ckeywords')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'keywords'

class SymptomCode(models.Model):
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='symptom_codes')
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_symptom_codes')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_symptom_codes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'symptom_codes'

class ReviewFlags(models.Model):
    class Reasons(models.TextChoices):
        LOW_CONFIDENCE = 'low_confidence', 'Low Confidence'
        HIGH_PRIORITY = 'high_priority', 'High Priority'
        UNCLEAR_DESCRIPTION = 'unclear_description', 'Unclear Description'
        MANUAL_OVERRIDE = 'manual_override', 'Manual Override'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending Review'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        RESOLVED = 'resolved', 'Resolved'

    class SourceType(models.TextChoices):
        AI_PREDICTION = 'ai_prediction', 'AI Prediction'
        MANUAL_REVIEW = 'manual_review', 'Manual Review'
        SYSTEM_GENERATED = 'system_generated', 'System Generated'

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='review_flags_ticket')
    prediction = models.ForeignKey(TicketAnalysis, on_delete=models.CASCADE, related_name='review_flags_prediction')
    reason = models.CharField(max_length=20, choices=Reasons.choices)
    source_type = models.CharField(max_length=20, choices=SourceType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_review_flags')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_review_flags')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'review_flags'




























# class TicketAssignee(models.Model):
#     class Role(models.TextChoices):
#         PRIMARY = 'primary', 'Primary Assignee'
#         SECONDARY = 'secondary', 'Secondary Assignee'
#     ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='assignees')
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_assignments')
#     role = models.CharField(max_length=20, choices=Role.choices, default=Role.PRIMARY)
#     assigned_at = models.DateTimeField(auto_now_add=True)

#     class Meta:
#         db_table = 'ticket_assignee'
#         unique_together = ['ticket', 'user']

# class TicketSLA(models.Model):
#     ticket = models.OneToOneField(Ticket, on_delete=models.CASCADE, related_name='sla')
#     sla_deadline = models.DateTimeField(null=True, blank=True)
#     is_breached = models.BooleanField(default=False)
#     sla_warning_sent = models.BooleanField(default=False)

#     class Meta:
#         db_table = 'ticket_sla'

# class TicketEscalation(models.Model):
#     class EscalationStatus(models.TextChoices):
#         PENDING = 'pending', 'Pending'
#         ACCEPTED = 'accepted', 'Accepted'
#         REJECTED = 'rejected', 'Rejected'

#     ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='escalation')
#     escalated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='escalated_tickets')
#     escalated_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_escalations')
#     escalation_reason = models.TextField(null=True, blank=True)
#     escalated_at = models.DateTimeField(null=True, blank=True)
#     status = models.CharField(max_length=20, choices=EscalationStatus.choices, default=EscalationStatus.PENDING)
#     reject_reason = models.TextField(null=True, blank=True)
#     resolved_at = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         db_table = 'ticket_escalation'