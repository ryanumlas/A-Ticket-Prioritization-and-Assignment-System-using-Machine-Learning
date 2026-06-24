from h11 import Response

from .models import Keyword, SymptomCode, Ticket
from ai.models import TicketAIAnalysis

def classify_ticket(ticket):
    analysis = TicketAIAnalysis.objects.get(ticket=ticket)

    keywords = analysis.keywords or []
    subject_text = (ticket.subject or "").lower()
    description_text = (ticket.description or "").lower()

    scores = {}

    for kw in keywords:
        kw = kw.lower().strip()

        # better matching (NOT exact anymore)
        matches = Keyword.objects.filter(keyword__icontains=kw)

        print(f"Keyword: {kw}")
        print(f"Matches: {matches.count()}")

        for match in matches:
            code = match.symptom_code.code
            weight = match.weight or 0

            if kw in subject_text:
                weight *= 3

            elif kw in description_text:
                weight *= 1

            scores[code] = scores.get(code, 0) + weight

            print(
                f"Matched -> {match.keyword} | {code} | Weight={weight}"
            )

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

def calculate_priority(based_priority, affected_scope):
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

    if affected_scope == Ticket.AffectedScope.INDIVIDUAL:
        pass
    
    elif affected_scope == Ticket.AffectedScope.GROUP:
        priority_number -= 1
    
    elif affected_scope == Ticket.AffectedScope.DEPARTMENT:
        priority_number -= 2
    
    elif affected_scope == Ticket.AffectedScope.ORGANIZATION_WIDE:
        priority_number = 1
        
    else:
        pass

    priority_number = max(1, priority_number)

    return PRIORITY_LABELS[priority_number]
