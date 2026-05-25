import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def analyze_ticket(ticket):
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    You are an IT support ticket analyzer.
    Extract key information and return ONLY valid JSON.

    Ticket Title: {ticket.title}
    Ticket Description: {ticket.description}

    Return ONLY this JSON:
    {{"keywords": ["word1", "word2"], "summarized_issue": "brief summary"}}

    Rules:
    - keywords must be single words
    - no markdown
    - no backticks
    - no extra text
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            max_output_tokens=700
        )
    )

    raw_text = response.text.strip()

    if raw_text.startswith("```"):
        raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        gemini_result = json.loads(raw_text)
    except json.JSONDecodeError:
        ticket_data = {
            "keywords": [],
            "summarized_issue": "Failed to parse AI response",
            "category": "Other",
            "error": raw_text
        }

    combined = combined_text(
        ticket,
        gemini_result['keywords'],
        gemini_result['summarized_issue']
    )

    return {
        "gemini_result": gemini_result,
        "combined_text": combined
    }


def combined_text(ticket, keywords, summarized_issue):
    return f"""
    Ticket Title: {ticket.title}
    Ticket Description: {ticket.description}
    Extracted Keywords: {', '.join(keywords)}
    Summarized Issue: {summarized_issue}
    """

