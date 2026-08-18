from celery import shared_task
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