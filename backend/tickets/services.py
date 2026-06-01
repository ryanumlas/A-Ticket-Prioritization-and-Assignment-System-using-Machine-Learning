from .models import Keyword, SymptomCode, Ticket
from ai.models import TicketAIAnalysis


def classify_ticket(ticket):
    analysis = TicketAIAnalysis.objects.get(ticket=ticket)
    keywords = analysis.keywords
    scores = {}

    for kw in keywords:
        matches = Keyword.objects.filter(keyword__iexact=kw)

        print(f"Keyword: {kw}")
        print(f"Matches: {matches.count()}")

        for match in matches:
            print(
                f"Matched -> {match.keyword} | {match.symptom_code.code} | Weight={match.weight}"
            )
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

