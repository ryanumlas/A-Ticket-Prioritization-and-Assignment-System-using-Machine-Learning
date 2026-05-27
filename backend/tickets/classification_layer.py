from .models import Keyword, SymptomCode
from .nlp_layer import tokenize_and_clean


def classify_ticket(ticket) -> dict:
    """
    Score-based ticket classification using keyword matching.
    
    Algorithm:
    1. Extract clean tokens from ticket
    2. For each token, find matching keywords in DB
    3. Accumulate weights per SymptomCode
    4. Return highest-scoring SymptomCode
    5. Mark ambiguous cases for review
    
    Args:
        ticket: Ticket model instance
    
    Returns:
        {
            "status": "classified" | "ambiguous" | "no_match",
            "symptom_code": "NW-001",
            "category": "Network",
            "department": "IT Support",
            "confidence": 5,  # Diff between top 2 scores
            "scores": {"NW-001": 5, "HW-002": 2},
            "needs_review": False
        }
    """
    
    # Step 1: Get clean tokens
    full_text = f"{ticket.subject} {ticket.description}"
    tokens = tokenize_and_clean(full_text)
    
    if not tokens:
        return {
            "status": "no_match",
            "symptom_code": None,
            "category": None,
            "department": None,
            "confidence": 0,
            "scores": {},
            "needs_review": True
        }
    
    # Step 2: Score each SymptomCode
    scores = {}
    
    for token in tokens:
        # Find keywords matching this token (case-insensitive)
        keywords = Keyword.objects.filter(
            keyword__iexact=token,
            active=True
        ).select_related('symptom_code')
        
        for kw in keywords:
            code = kw.symptom_code.code
            weight = kw.weight if kw.weight else 1
            scores[code] = scores.get(code, 0) + weight
    
    # Step 3: No matches found
    if not scores:
        return {
            "status": "no_match",
            "symptom_code": None,
            "category": None,
            "department": None,
            "confidence": 0,
            "scores": scores,
            "needs_review": True
        }
    
    # Step 4: Get winner and runner-up
    sorted_scores = sorted(scores.items(), key=lambda x: x[1], reverse=True)
    best_code, best_score = sorted_scores[0]
    second_score = sorted_scores[1][1] if len(sorted_scores) > 1 else 0
    confidence_diff = best_score - second_score
    
    # Step 5: Check if ambiguous (threshold: 3 points)
    CONFIDENCE_THRESHOLD = 3
    needs_review = confidence_diff < CONFIDENCE_THRESHOLD
    
    # Step 6: Get full details from SymptomCode
    try:
        symptom = SymptomCode.objects.get(code=best_code)
        category = symptom.category
        department = category.department if category else None
        
        return {
            "status": "ambiguous" if needs_review else "classified",
            "symptom_code": best_code,
            "category": category.name if category else None,
            "department": department.name if department else None,
            "confidence": confidence_diff,
            "scores": scores,
            "needs_review": needs_review
        }
    
    except SymptomCode.DoesNotExist:
        return {
            "status": "no_match",
            "symptom_code": None,
            "category": None,
            "department": None,
            "confidence": 0,
            "scores": scores,
            "needs_review": True
        }
