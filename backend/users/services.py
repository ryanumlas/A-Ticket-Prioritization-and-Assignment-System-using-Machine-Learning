from .models import Notifications


def create_notification(
    user,
    ticket,
    notification_type,
    message,
    created_by=None,
):
    return Notifications.objects.create(
        user=user,
        ticket=ticket,
        notification_type=notification_type,
        message=message,
        created_by=created_by,
    )