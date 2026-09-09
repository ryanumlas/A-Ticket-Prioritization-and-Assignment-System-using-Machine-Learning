from datetime import datetime, timezone as dt_timezone
from h11 import Response
from .models import Keyword, SymptomCode, Ticket, ReviewFlags, Category, SLARules, TicketStatusHistory
from users.models import ITSupportProfile
from ai.models import TicketAIAnalysis, TicketAnalysis
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
    MIN_RULE_SCORE = 15

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

        db_keywords = Keyword.objects.all()
        keyword_found = False

        for match in db_keywords:
            db_kw = normalize_text(match.keyword)

            # Check if DB keyword matches as a complete phrase
            if not phrase_matches(db_kw, gemini_kw):
                continue

            keyword_found = True

            code = match.symptom_code.code
            base_weight = match.weight or 0

            # Longer keywords are more specific
            specificity_bonus = len(db_kw.split())
            weight = base_weight + specificity_bonus

            # Stronger weight if keyword appears in subject
            if phrase_matches(db_kw, subject_text):
                weight *= 3

            # Normal weight if found in description
            elif phrase_matches(db_kw, description_text):
                weight *= 1

            scores[code] = scores.get(code, 0) + weight

            print(
                f"Matched -> {match.keyword} | "
                f"{code} | Weight={weight}"
            )

        if not keyword_found:
            print("No database keyword match")

    # No rule-based matches at all
    if not scores:
        return {
            "symptom_code": None,
            "category": None,
            "scores": {},
            "best_score": 0,
            "status": "No matching keywords found",
        }

    # Get highest scoring symptom
    best_code = max(scores, key=scores.get)
    best_score = scores[best_code]

    print("\nRule-Based Scores:", scores)
    print("Best Code:", best_code)
    print("Best Score:", best_score)

    # Weak rule-based result → let ML handle it
    if best_score < MIN_RULE_SCORE:
        return {
            "symptom_code": None,
            "category": None,
            "scores": scores,
            "best_score": best_score,
            "status": "Rule-based confidence insufficient - ML fallback required"
        }

    best_symptom = SymptomCode.objects.filter(
        code=best_code
    ).select_related("category").first()

    if not best_symptom:
        return {
            "symptom_code": None,
            "category": None,
            "scores": scores,
            "best_score": best_score,
            "status": "Matched symptom code does not exist",
        }

    category = best_symptom.category

    return {
        "symptom_code": best_code,
        "category": category.name if category else None,
        "scores": scores,
        "best_score": best_score,
        "status": "Classification successful",
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


def update_sla(ticket, response_start=None):
    if not ticket.priority:
        return

    now = timezone.now()

    if not response_start:
        response_start = ticket.created_at

    if not ticket.response_deadline:
        ticket.response_deadline = (
            response_start
            + ticket.priority.response_time
        )

    if not ticket.resolution_deadline:
        ticket.resolution_deadline = (
            ticket.created_at
            + ticket.priority.resolution_time
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
    print("\n========== SLA DEBUG ==========")
    print("Ticket:", ticket.ticket_code)

    print("Created at:", ticket.created_at)
    print("Response started at:", response_start)

    print("Response SLA duration:", ticket.priority.response_time)
    print("Resolution SLA duration:", ticket.priority.resolution_time)

    print("Response deadline:", ticket.response_deadline)
    print("Resolution deadline:", ticket.resolution_deadline)

    print(
        "Response time remaining:",
        ticket.response_deadline - now
    )

    print(
        "Resolution time remaining:",
        ticket.resolution_deadline - now
    )

    print(
        "Response SLA status:",
        ticket.response_sla_status
    )

    print(
        "Resolution SLA status:",
        ticket.resolution_sla_status
    )

    print("===============================\n")
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
    result = predict_symptom_code(
        ticket.subject,
        ticket.description
    )

    code_predicted = result["predicted_code"]
    second_code_predicted = result["second_predicted_code"]

    symptom = SymptomCode.objects.get(
        code=code_predicted
    )

    second_symptom = SymptomCode.objects.get(
        code=second_code_predicted
    )

    prediction, created = TicketAnalysis.objects.update_or_create(
        ticket=ticket,
        defaults={
            "predicted_symptom_code": symptom,
            "second_predicted_symptom_code": second_symptom,
            "model_type": TicketAnalysis.ModelType.MACHINE_LEARNING,
            "model_used": "TF-IDF and Logistic Regression",
            "confidence": result["confidence"],
            "second_confidence": result["second_confidence"],
            "confidence_margin": result["margin"],
        }
    )

    if result["requires_review"]:
        ReviewFlags.objects.get_or_create(
            ticket=ticket,
            prediction=prediction,
            reason=ReviewFlags.Reasons.LOW_CONFIDENCE,
            source_type=ReviewFlags.SourceType.AI_PREDICTION,
            defaults={
                "status": ReviewFlags.Status.PENDING,
            }
        )

    return result

def finalize_ticket_classification(ticket, symptom_code, response_start=None,):
    ticket.symptom_code = symptom_code
    ticket.category = symptom_code.category

    priority_level = calculate_priority(
        based_priority=symptom_code.based_priority,
        affected_scope=ticket.affected_scope,
        business_critical=ticket.ai_analysis.business_critical,
    )

    sla_rule = SLARules.objects.get(
        priority_level=priority_level
    )

    ticket.priority = sla_rule
    ticket.status = Ticket.TicketStatus.OPEN
    ticket.is_under_review = False

    ticket.save(
        update_fields=[
            "symptom_code",
            "category",
            "priority",
            "status",
            "is_under_review",
        ]
    )

    update_sla(
        ticket,
        response_start=response_start,
    )

    return ticket



WORKLOAD_STATUSES = [
    Ticket.TicketStatus.IN_PROGRESS,
    Ticket.TicketStatus.REOPENED,
]


def get_current_workload(profile):
    return Ticket.objects.filter(
        assigned_to=profile.user,
        status__in=WORKLOAD_STATUSES,
    ).count()


def get_last_assigned_at(profile):
    return profile.last_assigned_at or datetime.min.replace(tzinfo=dt_timezone.utc)


def get_eligible_technicians(ticket):
    required_specialization = ticket.symptom_code.required_specialization

    profiles = ITSupportProfile.objects.filter(
        it_department=ticket.it_department,
        availability_status=ITSupportProfile.AvailabilityStatus.available,
        specializations__specialization=required_specialization,
    ).distinct()

    eligible = []

    for profile in profiles:
        workload = get_current_workload(profile)

        if profile.workload_limit <= 0:
            continue

        if workload >= profile.workload_limit:
            continue

        eligible.append({
            "profile": profile,
            "current_workload": workload,
            "workload_ratio": workload / profile.workload_limit,
            "last_assigned_at": get_last_assigned_at(profile),
        })

    return eligible


def find_best_technician(ticket):
    eligible = get_eligible_technicians(ticket)

    if not eligible:
        return None

    eligible.sort(key=lambda tech: (
        tech["workload_ratio"],
        tech["current_workload"],
        tech["last_assigned_at"],
        tech["profile"].id,
    ))

    return eligible[0]

def assign_ticket_automatically(ticket):
    if ticket.assigned_to:
        return None

    if ticket.status in [
        Ticket.TicketStatus.RESOLVED,
        Ticket.TicketStatus.CLOSED,
        Ticket.TicketStatus.CANCELLED,
        Ticket.TicketStatus.RETURNED,
    ]:
        return None

    best = find_best_technician(ticket)

    if not best:
        return None

    profile = best["profile"]
    old_status = ticket.status

    ticket.assigned_to = profile.user
    ticket.status = Ticket.TicketStatus.IN_PROGRESS
    ticket.save(update_fields=["assigned_to", "status", "updated_at"])

    profile.last_assigned_at = timezone.now()
    profile.save(update_fields=["last_assigned_at"])

    full_name = f"{profile.user.first_name} {profile.user.last_name}".strip() or profile.user.username

    TicketStatusHistory.objects.create(
        ticket=ticket,
        event_type=TicketStatusHistory.EventType.ASSIGNED,
        old_value=None,
        new_value=full_name,
        changed_by=None,
        created_by=None,
    )

    if old_status != ticket.status:
        TicketStatusHistory.objects.create(
            ticket=ticket,
            event_type=TicketStatusHistory.EventType.STATUS_CHANGED,
            old_value=old_status,
            new_value=ticket.status,
            changed_by=None,
            created_by=None,
        )

    return profile
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