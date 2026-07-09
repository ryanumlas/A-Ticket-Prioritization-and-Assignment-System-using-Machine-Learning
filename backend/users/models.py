from django.db import models
from django.contrib.auth.models import AbstractUser
from departments.models import ITDepartment

# class UserManager(BaseUserManager):
#     use_in_migrations = True

#     def _create_user(self, email, password, **extra_fields):
#         if not email:
#             raise ValueError('The email field must be set')
#         email = self.normalize_email(email)
#         user = self.model(email=email, **extra_fields)
#         user.set_password(password)
#         user.save(using=self._db)
#         return user

#     def create_user(self, email, password=None, **extra_fields):
#         extra_fields.setdefault('is_staff', False)
#         extra_fields.setdefault('is_superuser', False)
#         return self._create_user(email, password, **extra_fields)

#     def create_superuser(self, email, password, **extra_fields):
#         extra_fields.setdefault('is_staff', True)
#         extra_fields.setdefault('is_superuser', True)

#         if extra_fields.get('is_staff') is not True:
#             raise ValueError('Superuser must have is_staff=True.')
#         if extra_fields.get('is_superuser') is not True:
#             raise ValueError('Superuser must have is_superuser=True.')

#         return self._create_user(email, password, **extra_fields)

class UserRoles(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_user_roles')
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_user_roles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_roles'

    def __str__(self):
        return self.name

class User(AbstractUser):
    user_code = models.CharField(max_length=20, unique=True)
    role = models.ForeignKey(UserRoles, on_delete=models.SET_NULL, null=True, blank=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_users')
    updated_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_users')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.username 

class ITSupportProfile(models.Model):
    class AvailabilityStatus(models.TextChoices):
        available = 'available', 'Available'
        unavailable = 'unavailable', 'Unavailable'
        offline = 'offline', 'Offline'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='it_support_profile')
    it_department = models.ForeignKey(ITDepartment, on_delete=models.SET_NULL, null=True, blank=True, related_name='it_support_profiles')
    workload_limit = models.IntegerField(default=5)
    current_workload = models.IntegerField(default=0)
    availability_status = models.CharField(max_length=20, choices=AvailabilityStatus.choices, default=AvailabilityStatus.available)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_it_support_profiles')
    updated_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_it_support_profiles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'it_support_profiles'
    
    def __str__(self):
        return f"{self.user.username} - {self.department.name if self.department else 'No Department'}"

class Specializations(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_specializations')
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_specializations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'specializations'

    def __str__(self):
        return self.name
    
class ITSupportSpecialization(models.Model):
    it_support_profile = models.ForeignKey(ITSupportProfile, on_delete=models.CASCADE, related_name='specializations')
    specialization = models.ForeignKey(Specializations, on_delete=models.CASCADE, related_name='it_support_profiles')
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_it_support_specializations')
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_it_support_specializations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'it_support_specializations'
        unique_together = ('it_support_profile', 'specialization')

    def __str__(self):
        return f"{self.it_support_profile.user.username} - {self.specialization.name}"
    
class Modules(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_modules')
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_modules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'modules'

    def __str__(self):
        return self.name

class RoleModules(models.Model):
    role = models.ForeignKey(UserRoles, on_delete=models.CASCADE, related_name='modules')
    module = models.ForeignKey(Modules, on_delete=models.CASCADE, related_name='roles')
    can_view = models.BooleanField(default=False)
    can_create = models.BooleanField(default=False)
    can_update = models.BooleanField(default=False)
    can_delete = models.BooleanField(default=False)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_role_modules')
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_role_modules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'role_modules'
        unique_together = ('role', 'module')

    def __str__(self):
        return f"{self.role.name} - {self.module.name}"
    
class AuditLogs(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    module = models.CharField(max_length=100)
    action = models.CharField(max_length=255)
    reference_id = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_audit_logs')
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_audit_logs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'audit_logs'

    def __str__(self):
        return f"{self.user.username if self.user else 'Unknown User'} - {self.action} at {self.timestamp}"
    
class Notifications(models.Model):
    class NotificationType(models.TextChoices):
        TICKET_CREATED = 'ticket_created', 'Ticket Created'
        TICKET_ASSIGNED = 'ticket_assigned', 'Ticket Assigned'
        STATUS_UPDATED = 'status_updated', 'Status Updated'
        COMMENT_ADDED = 'comment_added', 'Comment Added'
        REVIEW_REQUIRED = 'review_required', 'Review Required'
        TICKET_RESOLVED = 'ticket_resolved', 'Ticket Resolved'
        TICKET_CLOSED = 'ticket_closed', 'Ticket Closed'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    ticket = models.ForeignKey('tickets.Ticket', on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    notification_type = models.CharField(max_length=50, choices=NotificationType.choices)
    is_read = models.BooleanField(default=False)
    created_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_notifications')
    updated_by = models.ForeignKey('User', on_delete=models.SET_NULL, null=True, blank=True, related_name='updated_notifications')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'notifications'

    def __str__(self):
        return f"Notification for {self.user.username} - {'Read' if self.is_read else 'Unread'}"