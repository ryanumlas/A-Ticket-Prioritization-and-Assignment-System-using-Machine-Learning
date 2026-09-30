from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from .models import Ticket
from .services import update_sla

import logging


logger = logging.getLogger(__name__)


@shared_task
def update_all_sla():
    active_tickets = Ticket.objects.filter(
        resolved_at__isnull=True
    ).exclude(
        status=Ticket.TicketStatus.CLOSED
    )

    logger.info(
        f"Updating {active_tickets.count()} active ticket(s)."
    )

    for ticket in active_tickets:
        logger.info(
            f"Updating SLA for {ticket.ticket_code}"
        )

        update_sla(ticket)

    return (
        f"Updated {active_tickets.count()} ticket(s)."
    )


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