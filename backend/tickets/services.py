from datetime import datetime, timezone as dt_timezone
from h11 import Response
from .models import Keyword, SymptomCode, Ticket, ReviewFlags, Category, SLARules, TicketStatusHistory
from users.models import ITSupportProfile
from ai.models import TicketAIAnalysis, TicketAnalysis
from machine_learning.predictor import predict_symptom_code
from django.utils import timezone
import time
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
    matched_keywords = []

    db_keywords = list(
        Keyword.objects.select_related("symptom_code")
    )

    for gemini_kw in keywords:
        gemini_kw = normalize_text(gemini_kw)

        if not gemini_kw:
            continue

        print(f"\nGemini Keyword: {gemini_kw}")

        keyword_found = False

        gemini_tokens = set(gemini_kw.split())

        for match in db_keywords:
            db_kw = normalize_text(match.keyword)

            if not db_kw:
                continue

            db_tokens = set(db_kw.split())

            match_type = None
            match_strength = 0

            # --------------------------------------------------
            # 1. Exact phrase match
            # --------------------------------------------------
            if phrase_matches(db_kw, gemini_kw):
                match_type = "exact_phrase"
                match_strength = 3

            # --------------------------------------------------
            # 2. Database phrase appears inside Gemini keyword
            # --------------------------------------------------
            elif db_kw in gemini_kw:
                match_type = "phrase_inside_gemini"
                match_strength = 2

            # --------------------------------------------------
            # 3. Single-word database keyword
            # --------------------------------------------------
            elif len(db_tokens) == 1 and db_kw in gemini_tokens:
                match_type = "token_match"
                match_strength = 1

            # --------------------------------------------------
            # 4. Multiple-word keyword overlap
            # --------------------------------------------------
            elif len(db_tokens) >= 2:
                overlap = db_tokens.intersection(gemini_tokens)

                if len(overlap) == len(db_tokens):
                    match_type = "token_overlap"
                    match_strength = 2

            # No match
            if not match_type:
                continue

            keyword_found = True

            code = match.symptom_code.code
            base_weight = match.weight or 0

            # Longer database keywords are more specific
            specificity_bonus = len(db_tokens)

            weight = (
                base_weight
                + specificity_bonus
            )

            # --------------------------------------------------
            # Subject match = stronger
            # --------------------------------------------------
            if phrase_matches(db_kw, subject_text):
                weight *= 3

            # --------------------------------------------------
            # Description match
            # --------------------------------------------------
            elif phrase_matches(db_kw, description_text):
                weight *= 1

            # --------------------------------------------------
            # Apply match strength
            # --------------------------------------------------
            weight *= match_strength

            scores[code] = scores.get(code, 0) + weight

            matched_keywords.append({
                "keyword": match.keyword,
                "symptom_code": code,
                "weight": weight,
                "match_type": match_type,
                "gemini_keyword": gemini_kw,
            })

            print(
                f"Matched -> {match.keyword} | "
                f"{code} | "
                f"Weight={weight} | "
                f"Type={match_type}"
            )

        if not keyword_found:
            print("No database keyword match")

    # ----------------------------------------------------------
    # No rule-based matches
    # ----------------------------------------------------------
    if not scores:
        return {
            "symptom_code": None,
            "category": None,
            "scores": {},
            "best_score": 0,
            "matched_keywords": [],
            "status": "No matching keywords found",
        }

    # ----------------------------------------------------------
    # Get highest scoring symptom
    # ----------------------------------------------------------
    best_code = max(scores, key=scores.get)
    best_score = scores[best_code]

    print("\nRule-Based Scores:", scores)
    print("Best Code:", best_code)
    print("Best Score:", best_score)

    # ----------------------------------------------------------
    # Weak rule-based result → ML fallback
    # ----------------------------------------------------------
    if best_score < MIN_RULE_SCORE:
        return {
            "symptom_code": None,
            "category": None,
            "scores": scores,
            "best_score": best_score,
            "matched_keywords": matched_keywords,
            "status": (
                "Rule-based confidence insufficient - "
                "ML fallback required"
            ),
        }

    # ----------------------------------------------------------
    # Get symptom
    # ----------------------------------------------------------
    best_symptom = (
        SymptomCode.objects
        .filter(code=best_code)
        .select_related("category")
        .first()
    )

    if not best_symptom:
        return {
            "symptom_code": None,
            "category": None,
            "scores": scores,
            "best_score": best_score,
            "matched_keywords": matched_keywords,
            "status": "Matched symptom code does not exist",
        }

    category = best_symptom.category

    return {
        "symptom_code": best_code,
        "category": category.name if category else None,
        "scores": scores,
        "best_score": best_score,
        "matched_keywords": matched_keywords,
        "status": "Classification successful",
    }


def calculate_priority(
    based_priority,
    affected_scope,
    business_critical,
    time_critical,
):
    PRIORITY_ORDER = {
        "P5": 5,
        "P4": 4,
        "P3": 3,
        "P2": 2,
        "P1": 1,
    }

    PRIORITY_LABELS = {
        5: "P5",
        4: "P4",
        3: "P3",
        2: "P2",
        1: "P1",
    }

    priority_number = PRIORITY_ORDER.get(based_priority)

    if priority_number is None:
        return "P5"

    # Determine impact from affected scope
    if affected_scope == Ticket.AffectedScope.INDIVIDUAL:
        impact = "LOW"

    elif affected_scope == Ticket.AffectedScope.GROUP:
        impact = "MEDIUM"

    elif affected_scope == Ticket.AffectedScope.DEPARTMENT:
        impact = "HIGH"

    elif affected_scope == Ticket.AffectedScope.ORGANIZATION_WIDE:
        impact = "CRITICAL"

    else:
        raise ValueError(
            f"Invalid affected_scope: {affected_scope}"
        )

    # Determine urgency from business and time criticality
    if business_critical and time_critical:
        urgency = "HIGH"

    elif business_critical or time_critical:
        urgency = "MEDIUM"

    else:
        urgency = "LOW"

    # Contextual priority matrix
    PRIORITY_MATRIX = {
        "CRITICAL": {
            "LOW": 2,
            "MEDIUM": 2,
            "HIGH": 1,
        },
        "HIGH": {
            "LOW": 3,
            "MEDIUM": 2,
            "HIGH": 1,
        },
        "MEDIUM": {
            "LOW": 4,
            "MEDIUM": 3,
            "HIGH": 2,
        },
        "LOW": {
            "LOW": 5,
            "MEDIUM": 4,
            "HIGH": 3,
        },
    }

    contextual_priority = PRIORITY_MATRIX[impact][urgency]

    priority_number = min(
        priority_number,
        contextual_priority,
    )

    return PRIORITY_LABELS[priority_number]

def calculate_priority_details(
    based_priority,
    affected_scope,
    business_critical,
    time_critical,
):
    PRIORITY_ORDER = {
        "P5": 5,
        "P4": 4,
        "P3": 3,
        "P2": 2,
        "P1": 1,
    }

    PRIORITY_LABELS = {
        5: "P5",
        4: "P4",
        3: "P3",
        2: "P2",
        1: "P1",
    }

    priority_number = PRIORITY_ORDER.get(based_priority)

    if priority_number is None:
        based_priority = "P5"
        priority_number = 5

    # Determine impact from affected scope
    if affected_scope == Ticket.AffectedScope.INDIVIDUAL:
        impact = "LOW"

    elif affected_scope == Ticket.AffectedScope.GROUP:
        impact = "MEDIUM"

    elif affected_scope == Ticket.AffectedScope.DEPARTMENT:
        impact = "HIGH"

    elif affected_scope == Ticket.AffectedScope.ORGANIZATION_WIDE:
        impact = "CRITICAL"

    else:
        raise ValueError(
            f"Invalid affected_scope: {affected_scope}"
        )

    # Determine urgency from business and time criticality
    if business_critical and time_critical:
        urgency = "HIGH"

    elif business_critical or time_critical:
        urgency = "MEDIUM"

    else:
        urgency = "LOW"

    # Contextual priority matrix
    PRIORITY_MATRIX = {
        "CRITICAL": {
            "LOW": 2,
            "MEDIUM": 2,
            "HIGH": 1,
        },
        "HIGH": {
            "LOW": 3,
            "MEDIUM": 2,
            "HIGH": 1,
        },
        "MEDIUM": {
            "LOW": 4,
            "MEDIUM": 3,
            "HIGH": 2,
        },
        "LOW": {
            "LOW": 5,
            "MEDIUM": 4,
            "HIGH": 3,
        },
    }

    contextual_priority_number = PRIORITY_MATRIX[impact][urgency]

    # The final priority can only become more severe,
    # never less severe than the original/base priority.
    final_priority_number = min(
        priority_number,
        contextual_priority_number,
    )

    return {
        "base_priority": based_priority,
        "affected_scope": affected_scope,
        "impact": impact,
        "business_critical": bool(business_critical),
        "time_critical": bool(time_critical),
        "urgency": urgency,
        "contextual_priority": PRIORITY_LABELS[
            contextual_priority_number
        ],
        "final_priority": PRIORITY_LABELS[
            final_priority_number
        ],
    }


def calculate_priority(
    based_priority,
    affected_scope,
    business_critical,
    time_critical,
):
    details = calculate_priority_details(
        based_priority=based_priority,
        affected_scope=affected_scope,
        business_critical=business_critical,
        time_critical=time_critical,
    )

    return details["final_priority"]

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


def update_sla(ticket, response_start=None, recalculate_deadlines=False):
    if not ticket.priority:
        return

    now = timezone.now()

    if not response_start:
        response_start = ticket.created_at

    if not ticket.response_deadline or recalculate_deadlines:
        ticket.response_deadline = (
            response_start + ticket.priority.response_time
        )

    if not ticket.resolution_deadline or recalculate_deadlines:
        ticket.resolution_deadline = (
            ticket.created_at + ticket.priority.resolution_time
        )

    # Response SLA
    if ticket.status in [
        Ticket.TicketStatus.IN_PROGRESS,
        Ticket.TicketStatus.RESOLVED,
        Ticket.TicketStatus.CLOSED,
    ]:
        if not ticket.response_at:
            ticket.response_at = now

        ticket.response_sla_status = (
            Ticket.SLAStatus.MET
            if ticket.response_at <= ticket.response_deadline
            else Ticket.SLAStatus.BREACHED
        )

    else:
        response_remaining = (
            ticket.response_deadline - now
        )

        ticket.response_sla_status = calculate_status(
            response_remaining,
            ticket.priority.response_time,
        )

    # Resolution SLA
    if ticket.status in [
        Ticket.TicketStatus.RESOLVED,
        Ticket.TicketStatus.CLOSED,
    ]:
        if ticket.resolved_at:
            ticket.resolution_sla_status = (
                Ticket.SLAStatus.MET
                if ticket.resolved_at <= ticket.resolution_deadline
                else Ticket.SLAStatus.BREACHED
            )

    else:
        resolution_remaining = (
            ticket.resolution_deadline - now
        )

        ticket.resolution_sla_status = calculate_status(
            resolution_remaining,
            ticket.priority.resolution_time,
        )

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

def finalize_ticket_classification(ticket, symptom_code, response_start=None):
    ticket.symptom_code = symptom_code
    ticket.category = symptom_code.category
    ticket.it_department = symptom_code.category.it_department if symptom_code.category else None

    priority_level = calculate_priority(
        based_priority=symptom_code.based_priority,
        affected_scope=ticket.affected_scope,
        business_critical=ticket.ai_analysis.business_critical,
        time_critical=ticket.ai_analysis.is_time_critical
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
            "it_department",
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

def get_team_workload(user):

    support_profile = getattr(
        user,
        "it_support_profile",
        None,
    )

    supervisor_profile = getattr(
        user,
        "it_supervisor_profile",
        None,
    )

    # ---------------------------------------------------------
    # IT SUPPORT
    # ---------------------------------------------------------

    if support_profile:
        department = support_profile.it_department

        if not department:
            return {
                "scope": "department",
                "department": None,
                "departments": [],
            }

        profiles = (
            ITSupportProfile.objects
            .filter(
                it_department=department,
            )
            .select_related(
                "user",
                "it_department",
            )
            .prefetch_related(
                "specializations__specialization",
            )
        )

        technicians = []

        for profile in profiles:
            workload = get_current_workload(profile)

            workload_limit = profile.workload_limit or 0

            if workload_limit > 0:
                workload_ratio = (
                    workload / workload_limit
                )
            else:
                workload_ratio = 0

            tickets = (
                Ticket.objects
                .filter(
                    assigned_to=profile.user,
                    status__in=WORKLOAD_STATUSES,
                )
                .order_by("created_at")
                .values(
                    "ticket_code",
                    "status",
                )
            )

            full_name = (
                f"{profile.user.first_name} "
                f"{profile.user.last_name}"
            ).strip() or profile.user.username

            technicians.append({
                "profile_id": profile.id,
                "user_id": profile.user.id,
                "name": full_name,
                "username": profile.user.username,
                "availability_status": (
                    profile.availability_status
                ),
                "workload": workload,
                "workload_limit": workload_limit,
                "workload_ratio": workload_ratio,
                "tickets": list(tickets),
            })

        return {
            "scope": "department",
            "department": {
                "id": department.id,
                "name": department.name,
            },
            "departments": [
                {
                    "id": department.id,
                    "name": department.name,
                    "technicians": technicians,
                }
            ],
        }

    # ---------------------------------------------------------
    # IT SUPERVISOR
    # ---------------------------------------------------------

    if supervisor_profile:
        departments = (
            ITDepartment.objects
            .all()
            .order_by("name")
        )

        department_results = []

        for department in departments:

            profiles = (
                ITSupportProfile.objects
                .filter(
                    it_department=department,
                )
                .select_related(
                    "user",
                    "it_department",
                )
                .prefetch_related(
                    "specializations__specialization",
                )
            )

            technicians = []

            for profile in profiles:
                workload = get_current_workload(profile)

                workload_limit = profile.workload_limit or 0

                if workload_limit > 0:
                    workload_ratio = (
                        workload / workload_limit
                    )
                else:
                    workload_ratio = 0

                tickets = (
                    Ticket.objects
                    .filter(
                        assigned_to=profile.user,
                        status__in=WORKLOAD_STATUSES,
                    )
                    .order_by("created_at")
                    .values(
                        "ticket_code",
                        "status",
                    )
                )

                full_name = (
                    f"{profile.user.first_name} "
                    f"{profile.user.last_name}"
                ).strip() or profile.user.username

                technicians.append({
                    "profile_id": profile.id,
                    "user_id": profile.user.id,
                    "name": full_name,
                    "username": profile.user.username,
                    "availability_status": (
                        profile.availability_status
                    ),
                    "workload": workload,
                    "workload_limit": workload_limit,
                    "workload_ratio": workload_ratio,
                    "tickets": list(tickets),
                })

            department_results.append({
                "id": department.id,
                "name": department.name,
                "technicians": technicians,
            })

        return {
            "scope": "all_departments",
            "department": None,
            "departments": department_results,
        }

    # ---------------------------------------------------------
    # USER HAS NO IT SUPPORT / IT SUPERVISOR PROFILE
    # ---------------------------------------------------------

    return {
        "scope": None,
        "department": None,
        "departments": [],
    }


def get_last_assigned_at(profile):
    return (
        profile.last_assigned_at
        or datetime.min.replace(tzinfo=dt_timezone.utc)
    )


def get_eligible_technicians(ticket):
    required_specialization = (
        ticket.symptom_code.required_specialization
        if ticket.symptom_code
        else None
    )

    if not ticket.it_department:
        return []

    if not ticket.symptom_code:
        return []

    profiles = (
        ITSupportProfile.objects
        .filter(
            it_department=ticket.it_department,
            availability_status=(
                ITSupportProfile.AvailabilityStatus.available
            ),
            specializations__specialization=(
                required_specialization
            ),
        )
        .distinct()
        .select_related("user", "it_department")
    )

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
            "workload_ratio": (
                workload / profile.workload_limit
            ),
            "last_assigned_at": get_last_assigned_at(profile),
        })

    return eligible


def _get_technician_specializations(profile):
    specializations = []

    try:
        for item in profile.specializations.all():
            specialization = getattr(item, "specialization", None)

            if specialization:
                specializations.append(str(specialization))
    except Exception:
        pass

    return specializations


def _build_technician_evaluation(
    ticket,
    profiles,
    required_specialization,
    eligible_profiles,
):
    eligible_profile_ids = {
        item["profile"].id
        for item in eligible_profiles
    }

    required_specialization_id = (
        getattr(required_specialization, "id", None)
        if required_specialization
        else None
    )

    technicians = []

    available_count = 0
    exact_specialization_count = 0

    for profile in profiles:
        is_available = (
            profile.availability_status
            == ITSupportProfile.AvailabilityStatus.available
        )

        if is_available:
            available_count += 1

        specialization_match = False

        try:
            for item in profile.specializations.all():
                specialization = getattr(
                    item,
                    "specialization",
                    None,
                )

                if not specialization:
                    continue

                if required_specialization_id is not None:
                    if getattr(
                        specialization,
                        "id",
                        None,
                    ) == required_specialization_id:
                        specialization_match = True
                        break
                elif required_specialization is not None:
                    if specialization == required_specialization:
                        specialization_match = True
                        break
        except Exception:
            specialization_match = False

        if specialization_match:
            exact_specialization_count += 1

        current_workload = get_current_workload(profile)

        workload_limit = profile.workload_limit or 0

        workload_ratio = (
            current_workload / workload_limit
            if workload_limit > 0
            else None
        )

        workload_available = (
            workload_limit > 0
            and current_workload < workload_limit
        )

        is_eligible = profile.id in eligible_profile_ids

        if is_eligible:
            eligibility_reason = "Eligible"
        elif not is_available:
            eligibility_reason = "Unavailable"
        elif not specialization_match:
            eligibility_reason = (
                "Required specialization does not match"
            )
        elif not workload_available:
            eligibility_reason = "Workload limit reached"
        elif workload_limit <= 0:
            eligibility_reason = "No workload capacity configured"
        else:
            eligibility_reason = "Not eligible"

        full_name = (
            f"{profile.user.first_name} "
            f"{profile.user.last_name}"
        ).strip() or profile.user.username

        technicians.append({
            "id": profile.id,
            "user_id": profile.user.id,
            "name": full_name,
            "availability": (
                "Available"
                if is_available
                else str(profile.availability_status)
            ),
            "specializations": _get_technician_specializations(
                profile
            ),
            "specialization_match": specialization_match,
            "current_workload": current_workload,
            "workload_limit": workload_limit,
            "workload_ratio": workload_ratio,
            "workload_available": workload_available,
            "eligible": is_eligible,
            "eligibility_reason": eligibility_reason,
        })

    return {
        "department_candidates": len(profiles),
        "available_candidates": available_count,
        "exact_specialization_matches": (
            exact_specialization_count
        ),
        "technicians_considered": technicians,
    }


def find_best_technician(ticket):
    eligible = get_eligible_technicians(ticket)

    if not eligible:
        return None

    eligible.sort(
        key=lambda tech: (
            tech["workload_ratio"],
            tech["current_workload"],
            tech["last_assigned_at"],
            tech["profile"].id,
        )
    )

    return eligible[0]


def assign_ticket_automatically(ticket):
    started_at = time.perf_counter()

    automation = {
        "status": "completed",
        "method": "rule_based",
        "symptom_code": (
            ticket.symptom_code.code
            if ticket.symptom_code
            else None
        ),
        "required_specialization": None,
        "required_specialization_id": None,
        "department": (
            ticket.it_department.name
            if ticket.it_department
            else None
        ),
        "priority": (
            ticket.priority.priority_level
            if ticket.priority
            else None
        ),
        "processing_time": 0,
        "assignment": {
            "status": "unassigned",
            "technician": None,
            "reason": None,
        },
        "department_candidates": 0,
        "available_candidates": 0,
        "exact_specialization_matches": 0,
        "technicians_considered": [],
    }

    required_specialization = (
        ticket.symptom_code.required_specialization
        if ticket.symptom_code
        else None
    )

    if required_specialization:
        automation["required_specialization"] = str(
            required_specialization
        )

        automation["required_specialization_id"] = getattr(
            required_specialization,
            "id",
            None,
        )

    ticket._automation_result = automation

    if ticket.is_under_review:
        automation["assignment"]["reason"] = (
            "Ticket requires Service Desk review."
        )
        automation["processing_time"] = round(
            time.perf_counter() - started_at,
            3,
        )
        return None

    if ticket.status == Ticket.TicketStatus.UNDER_REVIEW:
        automation["assignment"]["reason"] = (
            "Ticket is currently under Service Desk review."
        )
        automation["processing_time"] = round(
            time.perf_counter() - started_at,
            3,
        )
        return None

    if ticket.assigned_to:
        automation["assignment"]["status"] = "already_assigned"
        automation["assignment"]["reason"] = (
            "Ticket is already assigned."
        )
        automation["processing_time"] = round(
            time.perf_counter() - started_at,
            3,
        )
        return None

    if ticket.status in [
        Ticket.TicketStatus.RESOLVED,
        Ticket.TicketStatus.CLOSED,
        Ticket.TicketStatus.CANCELLED,
        Ticket.TicketStatus.RETURNED,
    ]:
        automation["assignment"]["reason"] = (
            "Ticket status does not allow automatic assignment."
        )
        automation["processing_time"] = round(
            time.perf_counter() - started_at,
            3,
        )
        return None

    if not ticket.it_department:
        automation["assignment"]["reason"] = (
            "No IT department was identified for this ticket."
        )
        automation["processing_time"] = round(
            time.perf_counter() - started_at,
            3,
        )
        return None

    if not ticket.symptom_code:
        automation["assignment"]["reason"] = (
            "No symptom code was identified for this ticket."
        )
        automation["processing_time"] = round(
            time.perf_counter() - started_at,
            3,
        )
        return None

    all_profiles = (
        ITSupportProfile.objects
        .filter(
            it_department=ticket.it_department,
        )
        .select_related(
            "user",
            "it_department",
        )
        .prefetch_related(
            "specializations__specialization",
        )
    )

    all_profiles = list(all_profiles)

    eligible = get_eligible_technicians(ticket)

    eligible_profile_ids = {
        item["profile"].id
        for item in eligible
    }

    evaluation = _build_technician_evaluation(
        ticket=ticket,
        profiles=all_profiles,
        required_specialization=required_specialization,
        eligible_profiles=eligible,
    )

    automation.update({
        "department_candidates": evaluation[
            "department_candidates"
        ],
        "available_candidates": evaluation[
            "available_candidates"
        ],
        "exact_specialization_matches": evaluation[
            "exact_specialization_matches"
        ],
        "technicians_considered": evaluation[
            "technicians_considered"
        ],
    })

    if not eligible:
        if evaluation["department_candidates"] == 0:
            reason = (
                "No technicians are available in the "
                "assigned IT department."
            )
        elif evaluation["available_candidates"] == 0:
            reason = (
                "No available technician was found "
                "in the assigned IT department."
            )
        elif evaluation["exact_specialization_matches"] == 0:
            reason = (
                "No eligible technician matched the "
                "required specialization."
            )
        else:
            reason = (
                "No technician met all automatic "
                "assignment requirements."
            )

        automation["assignment"]["reason"] = reason

        automation["processing_time"] = round(
            time.perf_counter() - started_at,
            3,
        )

        ticket._automation_result = automation

        return None

    eligible.sort(
        key=lambda tech: (
            tech["workload_ratio"],
            tech["current_workload"],
            tech["last_assigned_at"],
            tech["profile"].id,
        )
    )

    best = eligible[0]

    profile = best["profile"]

    old_status = ticket.status

    ticket.assigned_to = profile.user
    ticket.status = Ticket.TicketStatus.IN_PROGRESS

    ticket.save(
        update_fields=[
            "assigned_to",
            "status",
            "updated_at",
        ]
    )

    profile.last_assigned_at = timezone.now()

    profile.save(
        update_fields=[
            "last_assigned_at"
        ]
    )

    full_name = (
        f"{profile.user.first_name} "
        f"{profile.user.last_name}"
    ).strip() or profile.user.username

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

    for technician in automation["technicians_considered"]:
        if technician["id"] == profile.id:
            technician["selected"] = True
        else:
            technician["selected"] = False

    automation["assignment"] = {
        "status": "assigned",
        "technician": {
            "id": profile.id,
            "user_id": profile.user.id,
            "name": full_name,
            "current_workload": best["current_workload"],
            "workload_limit": profile.workload_limit,
            "workload_ratio": best["workload_ratio"],
        },
        "reason": (
            "Technician matched the assignment requirements "
            "and was selected using the existing workload "
            "and last-assigned sorting rules."
        ),
    }

    automation["processing_time"] = round(
        time.perf_counter() - started_at,
        3,
    )

    ticket._automation_result = automation

    return profile
