from django.db import models
from users.models import User
from ai.models import TicketAnalysis
from departments.models import ITDepartment, EmployeeDepartment, OfficeLocation
from users.models import UserProfile, Specializations

# Create your models here.
class Ticket(models.Model):
    class TicketStatus(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In Progress'
        UNDER_REVIEW = 'under_review', 'Under Review'
        RETURNED = 'returned', 'Returned'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'
        REOPENED = 'reopened', 'Reopened'   
        CANCELLED = 'cancelled', 'Cancelled'
        # EXPIRED = 'expired', 'Expired'
        # ESCALATED = 'escalated', 'Escalated'
        # CLOSED = 'closed', 'Closed'
        # NEEDS_INPUT = 'needs_input', 'Needs Input'
    class AffectedScope(models.TextChoices):
        INDIVIDUAL = 'individual', 'Individual'
        GROUP = 'group', 'Group'
        DEPARTMENT = 'department', 'Department'
        ORGANIZATION_WIDE = 'organization_wide', 'Organization Wide'

    class SLAStatus(models.TextChoices):
        SAFE = "SAFE", "Safe"
        WARNING = "WARNING", "Warning"
        CRITICAL = "CRITICAL", "Critical"
        BREACHED = "BREACHED", "Breached"
        MET = "MET", "Met"

    ticket_code = models.CharField(max_length=20, unique=True, editable=False)
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submitted_tickets')
    category = models.ForeignKey('Category', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_category')
    symptom_code = models.ForeignKey('SymptomCode', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_symptom_code')
    it_department = models.ForeignKey(ITDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_it_department')
    employee_department = models.ForeignKey(EmployeeDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_employee_department')
    office_location = models.ForeignKey(OfficeLocation, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_office_location')
    workstation = models.CharField(max_length=100, null=True, blank=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    status = models.CharField(max_length=20, choices=TicketStatus.choices, default=TicketStatus.OPEN)
    priority = models.ForeignKey('SLARules', on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_priority')
    subject = models.CharField(max_length=255)
    description = models.TextField()
    business_impact = models.TextField()
    affected_scope = models.CharField(max_length=20, choices=AffectedScope.choices, default=AffectedScope.INDIVIDUAL)
    response_sla_status = models.CharField(max_length=20, choices=SLAStatus.choices,default=SLAStatus.SAFE)
    resolution_sla_status = models.CharField(max_length=20,choices=SLAStatus.choices,default=SLAStatus.SAFE)
    response_deadline = models.DateTimeField(null=True, blank=True)
    resolution_deadline = models.DateTimeField(null=True, blank=True)   
    is_under_review = models.BooleanField(default=False)
    is_escalated = models.BooleanField(default=False)
    escalated_at = models.DateTimeField(null=True,blank=True)
    response_at = models.DateTimeField(null=True, blank=True)
    assigned_at = models.DateTimeField(null=True,blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='resolved_tickets')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_tickets')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tickets'
        
    def save(self, *args, **kwargs):
        is_new = self.pk is None

        super().save(*args, **kwargs)

        if is_new and not self.ticket_code:
            self.ticket_code = f"TKT-{self.id:06d}"
            super().save(update_fields=["ticket_code"])

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject}"


class TicketComments(models.Model):
    class CommentType(models.TextChoices):
        PUBLIC_REPLY = 'public_reply', 'Public Reply'
        INTERNAL_NOTE = 'internal_note', 'Internal Note'
        SYSTEM_LOG = 'system_log', 'System Log'

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    commented_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ticket_comments')
    message = models.TextField()
    comment_type = models.CharField(max_length=20, choices=CommentType.choices, default=CommentType.PUBLIC_REPLY)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ticket_comments'

class TicketStatusHistory(models.Model):
    class EventType(models.TextChoices):
        CREATED = "CREATED", "Ticket Created"
        STATUS_CHANGED = "STATUS_CHANGED", "Status Changed"
        ASSIGNED = "ASSIGNED", "Assigned"
        REASSIGNED = "REASSIGNED", "Reassigned"
        RETURNED = "RETURNED", "Returned to Service Desk"
        RETURN_APPROVED = "RETURN_APPROVED", "Return Request Approved"
        RETURN_REJECTED = "RETURN_REJECTED", "Return Request Rejected"
        SYMPTOM_CODE_CHANGED = "SYMPTOM_CHANGED", "Symptom Code Changed"
        REVIEW_COMPLETED = "REVIEW_COMPLETED", "Review Completed"
        PRIORITY_CHANGED = "PRIORITY_CHANGED", "Priority Changed"
        PRIORITY_REVIEW_REQUESTED = (
            "PRIORITY_REVIEW",
            "Priority Review Requested",
        )
        PRIORITY_REQUEST_REJECTED = (
            "PRIORITY_REJECTED",
            "Priority Request Rejected",
        )
        ESCALATED = "ESCALATED", "Escalated"
        RESOLVED = "RESOLVED", "Resolved"
        CLOSED = "CLOSED", "Closed"
    class Visibility(models.TextChoices):
        ALL = "ALL", "All"
        INTERNAL = "INTERNAL", "Internal Only"


    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='status_history')
    event_type = models.CharField(max_length=20, choices=EventType.choices)
    old_value = models.CharField(max_length=255, null=True, blank=True)
    new_value = models.CharField(max_length=255, null=True, blank=True)
    remarks = models.TextField(blank=True)
    visibility = models.CharField(max_length=20, choices=Visibility.choices, default=Visibility.INTERNAL)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_tickets_status_history')
    changed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='changed_tickets_status_history')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ticket_status_history'
        ordering = ['-created_at']

class SLARules(models.Model):
    priority_level = models.CharField(max_length=20, unique=True)
    response_time = models.DurationField()
    resolution_time = models.DurationField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_sla_rules')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_sla_rules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sla_rules'

    def __str__(self):
        return f"SLA Rule - {self.priority_level}"

class Category(models.Model):
    it_department = models.ForeignKey(ITDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='categories')
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_categories')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_categories')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'categories'

class Keyword(models.Model):
    symptom_code = models.ForeignKey('SymptomCode', on_delete=models.SET_NULL, null=True, blank=True, related_name='keywords_symptom_code')
    keyword = models.CharField(max_length=100)
    weight = models.PositiveIntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
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
    based_priority = models.CharField(max_length=20, null=True, blank=True)
    required_specialization = models.ForeignKey(Specializations, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_required_specialization')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_symptom_codes')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_symptom_codes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'symptom_codes'

    def __str__(self):
        return self.code

class ReviewFlags(models.Model):
    class Reasons(models.TextChoices):
        LOW_CONFIDENCE = 'low_confidence', 'Low Confidence'
        MISSING_DEPARTMENT = 'missing_department', 'Missing Department'
        UNCLEAR_DESCRIPTION = 'unclear_description', 'Unclear Description'
        OTHER = 'other', 'Other'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        RESOLVED = 'resolved', 'Resolved'

    class SourceType(models.TextChoices):
        AI_PREDICTION = 'ai_prediction', 'AI Prediction'
        MANUAL_REVIEW = 'manual_review', 'Manual Review'
        SYSTEM_GENERATED = 'system_generated', 'System Generated'

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='review_flags_ticket')
    prediction = models.ForeignKey(TicketAnalysis, on_delete=models.CASCADE, null=True, blank=True, related_name='review_flags_prediction')
    reason = models.CharField(max_length=20, choices=Reasons.choices)
    source_type = models.CharField(max_length=20, choices=SourceType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_flags')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta: 
        db_table = 'review_flags'

# class TicketRequest(models.Model):
#     class RequestType(models.TextChoices):
#         PRIORITY_CHANGE = 'priority_change', 'Priority Change'
#         RETURN_TO_SERVICE_DESK = 'return_to_service_desk', 'Return to Service Desk'
#         ASSISTANCE = 'assistance', 'Assistance'
#         ESCALATION = 'escalation', 'Escalation'

#     class RequestStatus(models.TextChoices):
#         PENDING = 'pending', 'Pending'
#         APPROVED = 'approved', 'Approved'
#         REJECTED = 'rejected', 'Rejected'
#         ACCEPTED = 'accepted', 'Accepted'
#         ACKNOWLEDGED = 'acknowledged', 'Acknowledged'
#         COMPLETED = 'completed', 'Completed'

#     ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='requests')
#     request_type = models.CharField(max_length=30, choices=RequestType.choices)
#     requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='ticket_requests')
#     reason = models.TextField()
#     status = models.CharField(max_length=20, choices=RequestStatus.choices, default=RequestStatus.PENDING)

#     current_priority = models.ForeignKey(SLARules, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_priority_requests')
#     requested_priority = models.ForeignKey(SLARules, on_delete=models.SET_NULL, null=True, blank=True, related_name='priority_change_requests')
#     assistance_department = models.ForeignKey(ITDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='assistance_requests')

#     reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='handled_ticket_requests')
#     review_remarks = models.TextField(null=True, blank=True)

#     requested_at = models.DateTimeField(auto_now_add=True)
#     reviewed_at = models.DateTimeField(null=True, blank=True)

#     class Meta:
#         db_table = 'ticket_requests'

class TicketAssistance(models.Model):
    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="assistances",
    )

    assisted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="provided_assistance",
    )

    assisted_note = models.TextField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_ticket_assistance",
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_ticket_assistance",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ticket_assistance"

class TicketPriorityRequest(models.Model):
    class RequestStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="priority_requests",
    )

    requested_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_priority_requests",
    )

    current_priority = models.ForeignKey(
        SLARules,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="current_priority_requests",
    )

    requested_priority = models.ForeignKey(
        SLARules,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="requested_priority_requests",
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=RequestStatus.choices,
        default=RequestStatus.PENDING,
    )

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_priority_requests",
    )

    review_remarks = models.TextField(
        blank=True,
        null=True,
    )

    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "ticket_priority_requests"

class TicketReturn(models.Model):
    class ReturnStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name="returns",
    )

    returned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="submitted_ticket_returns",
    )

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=ReturnStatus.choices,
        default=ReturnStatus.PENDING,
    )

    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_ticket_returns",
    )

    review_remarks = models.TextField(
        blank=True,
        null=True,
    )

    requested_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "ticket_returns"























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