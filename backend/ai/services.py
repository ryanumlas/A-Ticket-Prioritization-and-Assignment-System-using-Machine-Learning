import google.generativeai as genai
import os
import json
from dotenv import load_dotenv
from .models import TicketAIAnalysis

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# genai.configure(api_key="AIzaSyCq-S-BGHQPZ9LJGeqe52WrDDwmXTEcrzI")

import json
import re

def analyze_ticket(ticket):
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
    You are an IT support ticket analyzer.

    Your task is to extract structured information for an IT ticket classification system.

    Ticket Title:
    {ticket.subject}

    Ticket Description:
    {ticket.description}

    Return ONLY valid JSON in this format:

    {{
        "cleaned_text": "short cleaned version of the issue",
        "summary": "brief 1 sentence summary",
        "keywords": ["keyword1", "keyword2", "keyword3"]
    }}

    IMPORTANT RULES:
    - keywords MUST be short standardized IT terms only (1-3 words max)
    - keywords must be generic IT categories, NOT full sentences
    - use only common IT terms such as:
    vpn, network, internet, login, password, crash, slow, update, installation, server, access
    - do NOT generate long phrases like "cannot connect to vpn"
    - do NOT include symptom codes or categories
    - keep keywords consistent and reusable for database matching
    - output must be valid JSON only
"""

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            max_output_tokens=700
        )
    )

    raw_text = response.text.strip()

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

