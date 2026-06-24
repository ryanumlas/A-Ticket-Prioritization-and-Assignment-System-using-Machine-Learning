import google.generativeai as genai
import os
import json
import re
from dotenv import load_dotenv
from .models import TicketAIAnalysis

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def analyze_ticket(ticket):
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    You are an IT support ticket analyzer.

    Analyze the ticket and extract structured information for an IT Service Management (ITSM) ticket classification system.

    Ticket Title:
    {ticket.subject}

    Ticket Description:
    {ticket.description}

    Return ONLY valid JSON in this exact format:

    {{
        "cleaned_text": "short cleaned version of the issue",
        "summary": "brief one sentence summary",
        "keywords": ["keyword1", "keyword2", "keyword3"]
    }}

    IMPORTANT RULES:

    - Return ONLY valid JSON.
    - Do not include markdown.
    - Do not include explanations.
    - Do not include code blocks.

    CLEANED TEXT:
    - Remove unnecessary words.
    - Keep only important technical details.
    - Maximum 30 words.

    SUMMARY:
    - One concise sentence.
    - Describe the user's issue clearly.

    KEYWORDS:
    - Return 3 to 8 keywords only.
    - Keywords must represent the actual technical symptoms or failure indicators.
    - Keywords should be 1 to 4 words.
    - Use standardized IT support terminology.
    - Prioritize symptoms, failures, connectivity issues, access issues, performance issues, and software problems.
    - Avoid generic words.

    GOOD EXAMPLES:

    ["shutdown", "overheat", "fan noise"]

    ["no internet connection", "wifi", "disconnect"]

    ["application crash", "freeze", "not responding"]

    ["login", "password", "authentication failed"]

    ["installation failed", "update error", "software install"]

    BAD EXAMPLES:

    ["computer"]

    ["problem"]

    ["issue"]

    ["help"]

    ["system"]

    ["user"]

    PRIORITY ORDER FOR KEYWORDS:

    1. Failure symptoms
    2. Error conditions
    3. Access problems
    4. Connectivity problems
    5. Performance problems

    DO NOT:
    - Generate symptom codes.
    - Generate categories.
    - Generate departments.
    - Generate priority levels.
    - Generate explanations.
    - Generate full sentences as keywords.

    Output valid JSON only.
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.1,
            max_output_tokens=2000
        )
    )

    raw_text = response.text.strip()

    print("RAW GEMINI RESPONSE:")
    print(raw_text)

    raw_text = raw_text.replace("```json", "").replace("```", "").strip()

    try:
        match = re.search(r"\{.*\}", raw_text, re.DOTALL)

        if not match:
            raise ValueError("No JSON found in Gemini response")

        data = json.loads(match.group())

        ai_analysis, created = TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": data.get("cleaned_text", ""),
                "summary": data.get("summary", ""),
                "keywords": data.get("keywords", []),
                "model_version": "gemini-2.5-flash"
            }
        )

        return data

    except Exception as e:
        fallback = {
            "cleaned_text": "",
            "summary": "AI parsing failed",
            "keywords": []
        }

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": "",
                "summary": "AI parsing failed",
                "keywords": [],
                "model_version": "gemini-2.5-flash"
            }
        )

        print("Gemini parsing error:", str(e))

        return fallback


def combined_text(ticket, keywords, summarized_issue):
    return f"""
    Ticket Title: {ticket.title}
    Ticket Description: {ticket.description}
    Extracted Keywords: {', '.join(keywords)}
    Summarized Issue: {summarized_issue}
    """

