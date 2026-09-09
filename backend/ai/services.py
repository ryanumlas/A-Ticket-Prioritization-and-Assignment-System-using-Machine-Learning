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

    Analyze the following IT support ticket and extract structured information for an IT Service Management (ITSM) ticket classification system.

    Ticket Title:
    {ticket.subject}

    Issue Description:
    {ticket.description}

    Business Impact:
    {ticket.business_impact}

    Return ONLY valid JSON in this exact format:

    {{
        "cleaned_text": "short cleaned version of the issue",
        "summary": "brief one sentence summary",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "is_unclear": false,
        "business_critical": false
    }}

    IMPORTANT

    - Return ONLY valid JSON.
    - Do NOT include markdown.
    - Do NOT include explanations.
    - Do NOT include code blocks.

    CLEANED TEXT
    - Maximum 30 words.
    - Remove unnecessary words.
    - Keep only important technical details.

    SUMMARY
    - One concise sentence.
    - Clearly summarize the reported issue.
    - If the ticket is unclear, explain that insufficient information was provided.

    KEYWORDS

    - Return 3 to 8 keywords or short phrases.
    - Keywords must be based ONLY on symptoms explicitly mentioned in the ticket.
    - Do NOT infer, generalize, summarize, or invent new technical terms.
    - Preserve the wording as closely as possible to what the employee described.
    - Each keyword should contain 1 to 4 words.
    - Prefer simple IT helpdesk language rather than formal technical terminology.
    - Prioritize:
    1. Main failure symptom
    2. Error message (if any)
    3. Device, application, or service involved
    4. Connectivity issue (if applicable)
    5. Performance issue (if applicable)
    - Return an empty array ([]) if no clear technical symptom exists.

    Good examples:

    Ticket:
    "My internet is not working and I cannot access Microsoft Teams."

    Keywords:
    ["no internet", "cannot access teams", "internet not working"]

    ---

    Ticket:
    "My Outlook emails are stuck in the Outbox."

    Keywords:
    ["cannot send email", "outbox", "outlook"]

    ---

    Ticket:
    "My desktop is very slow when opening applications."

    Keywords:
    ["computer slow", "slow applications", "desktop slow"]

    ---

    Ticket:
    "I keep getting incorrect username or password."

    Keywords:
    ["incorrect password", "login failed", "username"]

    Bad examples:

    ["workstation connectivity"]

    ["application slowness"]

    ["email delivery failure"]

    ["internal web application access"]

    ["problem"]

    ["issue"]

    ["help"]

    IS_UNCLEAR

    Set "is_unclear" to true ONLY if:
    - The issue lacks sufficient technical details.
    - No identifiable technical symptom is described.
    - The ticket cannot be reasonably classified.
    - The issue is not IT-related.

    If true:
    - Return [] for keywords.
    - Do NOT guess technical symptoms.
    - Still generate a short summary explaining that more information is needed.

    Otherwise:
    "is_unclear": false

    IMPACT DETECTION

    Analyze BOTH the Issue Description and Business Impact.

    Set "business_critical" to true ONLY if the user explicitly describes a serious or time-sensitive business impact, such as:

    - A business-critical deadline that cannot be met.
    - Multiple users, a department, or the organization being unable to work.
    - Business operations being significantly interrupted.
    - Production systems or critical business services being unavailable.
    - Customer or client operations being affected.
    - Payroll, deployment, meeting, presentation, transaction processing, or another time-sensitive business activity that cannot proceed.
    - A single user being blocked ONLY when their work is explicitly time-critical or essential to an ongoing business operation.

    Set "business_critical" to false if:

    - Only one user is unable to work and no critical deadline, customer impact, production impact, or major business interruption is described.
    - The user only says "urgent", "ASAP", "immediately", or similar emotional language.
    - The user requests faster service without describing a concrete business impact.
    - The issue causes inconvenience, reduced productivity, or routine work interruption without serious business consequences.
    - Business criticality must be inferred or assumed.

    Do NOT infer business criticality.

    Only set "business_critical" to true when the business impact is explicitly serious, time-sensitive, or operationally critical.

    DO NOT

    Do NOT generate:
    - Symptom Codes
    - Categories
    - Priority Levels
    - Assignment Groups
    - Departments
    - Root Causes
    - Explanations

    Do NOT:
    - Guess missing information.
    - Infer technical symptoms.
    - Infer business criticality.
    - Include unrelated keywords.

    If multiple unrelated issues exist, extract information only for the primary issue.

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
                "model_version": "gemini-2.5-flash",
                "business_critical": data.get("business_critical", False),
                "is_unclear": data.get("is_unclear", False)
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

