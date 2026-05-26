from .models import Keyword, SymptomCode, Ticket
from ai.models import TicketAIAnalysis


def classify_ticket(ticket):
    analysis = TicketAIAnalysis.objects.get(ticket=ticket)
    keywords = analysis.keywords
    scores = {}

    for kw in keywords:
        matches = Keyword.objects.filter(keyword__iexact=kw)
        for match in matches:
            code = match.symptom_code.code

            if code not in scores:
                scores[code] = 0
            scores[code] += match.weight

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
        "category": category,
        "scores": scores,
        "status": "Classification successful"
    }

