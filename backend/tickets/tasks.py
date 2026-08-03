from celery import shared_task
import logging
from .models import Ticket
from .services import update_sla

logger = logging.getLogger(__name__)

@shared_task
def update_all_sla():
    """
    Recalculate SLA status for all active tickets.
    """

    active_tickets = Ticket.objects.exclude(
        status__in=[
            Ticket.TicketStatus.RESOLVED,
            Ticket.TicketStatus.CLOSED,
        ]
    )
    logger.info(f"Updating {active_tickets.count()} active ticket(s).")
    for ticket in active_tickets:
        logger.info(f"Updating {ticket.ticket_code}")
        update_sla(ticket)

    return f"Updated {active_tickets.count()} ticket(s)."