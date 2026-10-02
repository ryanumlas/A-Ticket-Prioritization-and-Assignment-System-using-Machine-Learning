from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from .models import Ticket
from .services import update_sla

import logging


logger = logging.getLogger(__name__)


@shared_task
def update_all_sla():
    active_tickets = (
        Ticket.objects
        .filter(resolved_at__isnull=True)
        .exclude(
            status__in=[
                Ticket.TicketStatus.RESOLVED,
                Ticket.TicketStatus.CLOSED,
                Ticket.TicketStatus.CANCELLED,
            ]
        )
    )

    total = active_tickets.count()

    logger.info(
        "Updating SLA for %s active ticket(s).",
        total,
    )

    for ticket in active_tickets.iterator():
        try:
            logger.info(
                "Updating SLA for %s",
                ticket.ticket_code,
            )

            update_sla(ticket)

        except Exception:
            logger.exception(
                "Failed to update SLA for %s",
                ticket.ticket_code,
            )

    return f"Updated {total} ticket(s)."


@shared_task
def close_resolved_tickets():
    cutoff = timezone.now() - timedelta(days=3)

    tickets_to_close = Ticket.objects.filter(
        status=Ticket.TicketStatus.RESOLVED,
        resolved_at__isnull=False,
        resolved_at__lte=cutoff,
    )

    closed_count = tickets_to_close.update(
        status=Ticket.TicketStatus.CLOSED
    )

    logger.info(
        f"Automatically closed {closed_count} resolved ticket(s)."
    )

    return (
        f"Automatically closed {closed_count} ticket(s)."
    )