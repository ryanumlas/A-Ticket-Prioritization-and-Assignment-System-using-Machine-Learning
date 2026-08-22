from h11 import Response
from .models import Keyword, SymptomCode, Ticket, ReviewFlags, Category
from ai.models import TicketAIAnalysis
from machine_learning.predictor import predict_symptom_code
from django.utils import timezone

import re


def normalize_text(text):
    text = text.lower().strip()

    # Normalize curly apostrophes
    text = text.replace("’", "'")

    # Normalize whitespace
    text = re.sub(r"\s+", " ", text)

    return text


def phrase_matches(keyword, text):
    """
    Checks whether the keyword exists as a complete phrase
    inside the text.
    """

    keyword = normalize_text(keyword)
    text = normalize_text(text)

    if not keyword or not text:
        return False

    # Escape keyword so characters such as "." or "+" don't
    # behave as regex operators.
    pattern = rf"(?<!\w){re.escape(keyword)}(?!\w)"

    return re.search(pattern, text) is not None


def classify_ticket(ticket):
    analysis = TicketAIAnalysis.objects.get(ticket=ticket)

    keywords = analysis.keywords or []

    subject_text = normalize_text(ticket.subject or "")
    description_text = normalize_text(ticket.description or "")

    scores = {}

    for gemini_kw in keywords:

        gemini_kw = normalize_text(gemini_kw)

        if not gemini_kw:
            continue

        print(f"\nGemini Keyword: {gemini_kw}")

        # Find database keywords that can match this
        db_keywords = Keyword.objects.all()

        keyword_found = False

        for match in db_keywords:

            db_kw = normalize_text(match.keyword)

            # Check if database keyword is contained
            # as a complete phrase in Gemini's extracted keyword
            if not phrase_matches(db_kw, gemini_kw):
                continue

            keyword_found = True

            code = match.symptom_code.code
            base_weight = match.weight or 0

            # Longer keywords are more specific
            keyword_length = len(db_kw.split())

            specificity_bonus = keyword_length

            weight = base_weight + specificity_bonus

            # Check subject
            if phrase_matches(db_kw, subject_text):
                weight *= 3

            # Check description
            elif phrase_matches(db_kw, description_text):
                weight *= 1

            scores[code] = scores.get(code, 0) + weight

            print(
                f"Matched -> {match.keyword} | "
                f"{code} | Weight={weight}"
            )

        if not keyword_found:
            print("No database keyword match")

    if not scores:
        return {
            "symptom_code": None,
            "category": None,
            "scores": scores,
            "status": "No matching keywords found"
        }

    best_code = max(scores, key=scores.get)

    best_symptom = SymptomCode.objects.get(code=best_code)

    category = best_symptom.category

    return {
        "symptom_code": best_code,
        "category": category.name if category else None,
        "scores": scores,
        "status": "Classification successful"
    }


def calculate_priority(based_priority, affected_scope, business_critical):
    PRIORITY_ORDER = {
        "P5": 5,
        "P4": 4,
        "P3": 3,
        "P2": 2,
        "P1": 1
    }

    PRIORITY_LABELS = {
        5: "P5",
        4: "P4",
        3: "P3",
        2: "P2",
        1: "P1"
    }

    priority_number = PRIORITY_ORDER.get(based_priority)

    if priority_number is None:
        return "P5"
    
    if based_priority == "P5":
        if affected_scope == Ticket.AffectedScope.INDIVIDUAL:
            if business_critical:
                priority_number = 3
            else: 
                priority_number = 5
        
        elif affected_scope == Ticket.AffectedScope.GROUP:
            if business_critical:
                priority_number = 2
            else:
                priority_number = 5

        elif affected_scope == Ticket.AffectedScope.DEPARTMENT:
            if business_critical:
                priority_number = 2
            else:
                priority_number = 4
        
        elif affected_scope == Ticket.AffectedScope.ORGANIZATION_WIDE:
            if business_critical:
                priority_number = 1
            else:
                priority_number = 2
        else:
            raise ValueError(f"Invalid affected_scope: {affected_scope}")
        
    if based_priority == "P4":
        if affected_scope == Ticket.AffectedScope.INDIVIDUAL:
            if business_critical:
                priority_number = 3
            else: 
                priority_number = 4
        
        elif affected_scope == Ticket.AffectedScope.GROUP:
            if business_critical:
                priority_number = 2
            else:
                priority_number = 4

        elif affected_scope == Ticket.AffectedScope.DEPARTMENT:
            if business_critical:
                priority_number = 1
            else:
                priority_number = 3
        
        elif affected_scope == Ticket.AffectedScope.ORGANIZATION_WIDE:
            if business_critical:
                priority_number = 1
            else:
                priority_number = 2
        else:
            raise ValueError(f"Invalid affected_scope: {affected_scope}")

    if based_priority == "P3":
        if affected_scope == Ticket.AffectedScope.INDIVIDUAL:
            if business_critical:
                priority_number = 2
            else: 
                priority_number = 3
        
        elif affected_scope == Ticket.AffectedScope.GROUP:
            if business_critical:
                priority_number = 2
            else:
                priority_number = 3

        elif affected_scope == Ticket.AffectedScope.DEPARTMENT:
            if business_critical:
                priority_number = 1
            else:
                priority_number = 3
        
        elif affected_scope == Ticket.AffectedScope.ORGANIZATION_WIDE:
            if business_critical:
                priority_number = 1
            else:
                priority_number = 2
        else:
            raise ValueError(f"Invalid affected_scope: {affected_scope}")
        
    priority_number = max(1, priority_number)

    return PRIORITY_LABELS[priority_number]

def calculate_status(remaining, total_duration):
    WARNING_THRESHOLD = 50
    CRITICAL_THRESHOLD = 25

    if remaining.total_seconds() <= 0:
        return Ticket.SLAStatus.BREACHED

    percentage = (
        remaining.total_seconds()
        / total_duration.total_seconds()
    ) * 100

    if percentage <= CRITICAL_THRESHOLD:
        return Ticket.SLAStatus.CRITICAL

    if percentage <= WARNING_THRESHOLD:
        return Ticket.SLAStatus.WARNING
    
    return Ticket.SLAStatus.SAFE


def update_sla(ticket):
    if not ticket.priority:
        return
    now = timezone.now()

    if not ticket.response_deadline:
        ticket.response_deadline = (
            ticket.created_at + ticket.priority.response_time
        )

    if not ticket.resolution_deadline:
        ticket.resolution_deadline = (
            ticket.created_at + ticket.priority.resolution_time
        )

    if ticket.status in [
        Ticket.TicketStatus.IN_PROGRESS,
        Ticket.TicketStatus.RESOLVED,
        Ticket.TicketStatus.CLOSED,
    ]:
        if not ticket.response_at:
            ticket.response_at = now

        if ticket.response_at <= ticket.response_deadline:
            ticket.response_sla_status = Ticket.SLAStatus.MET
        else:
            ticket.response_sla_status = Ticket.SLAStatus.BREACHED

    else:
        response_remaining = ticket.response_deadline - now

        ticket.response_sla_status = calculate_status(
            response_remaining,
            ticket.priority.response_time,
        )

    if ticket.status in [
        Ticket.TicketStatus.RESOLVED,
        Ticket.TicketStatus.CLOSED,
    ]:
        if ticket.resolved_at:
            if ticket.resolved_at <= ticket.resolution_deadline:
                ticket.resolution_sla_status = (
                    Ticket.SLAStatus.MET
                )
            else:
                ticket.resolution_sla_status = (
                    Ticket.SLAStatus.BREACHED
                )

    else:
        resolution_remaining = ticket.resolution_deadline - now

        ticket.resolution_sla_status = calculate_status(
            resolution_remaining,
            ticket.priority.resolution_time,
        )
    print(ticket.ticket_code)
    print(ticket.response_deadline)
    print(ticket.resolution_deadline)

    ticket.save(
        update_fields=[
            "response_deadline",
            "resolution_deadline",
            "response_at",
            "response_sla_status",
            "resolution_sla_status",
        ]
    )

def predict_ticket(ticket):


# WAG NA TO PANGET PAG SCORING

# def calculate_priority(based_priority, affected_scope, urgency_detected):
#     PRIORITY_SCORE = {
#         "P5": 1,
#         "P4": 2,
#         "P3": 3,
#         "P2": 4,
#         "P1": 5
#     }

#     AFFECTED_SCOPE_SCORE = {
#         "individual": 1,
#         "group": 2,
#         "department": 3,
#         "organization_wide": 4
#     }

#     URGENCY_SCORE = {
#         False: 0,
#         True: 2
#     }

#     PRIORITY_LABELS = {
#         5: "P5",
#         4: "P4",
#         3: "P3",
#         2: "P2",
#         1: "P1"
#     }

#     technical_score = PRIORITY_SCORE[based_priority]
#     impact_score = AFFECTED_SCOPE_SCORE[affected_scope]
#     urgency_score = URGENCY_SCORE[urgency_detected]  

#     total_score = technical_score + impact_score + urgency_score

#     if total_score >= 10:
#         return "P1"
#     elif total_score >= 8:
#         return "P2"
#     elif total_score >= 6:
#         return "P3"
#     elif total_score >= 4:
#         return "P4"
#     else:
#         return "P5"