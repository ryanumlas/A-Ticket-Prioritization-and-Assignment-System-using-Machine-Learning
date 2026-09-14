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
        "business_critical": false,
        "is_time_critical": false
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
      2. Error message, if any
      3. Device, application, or service involved
      4. Connectivity issue, if applicable
      5. Performance issue, if applicable
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

    BUSINESS IMPACT DETECTION

    Analyze BOTH the Issue Description and Business Impact.

    Set "business_critical" to true ONLY when the ticket explicitly describes a serious impact to an essential business operation.

    Examples that MAY justify business_critical = true:

    - An essential business process cannot continue.
    - Production or a critical business service is unavailable.
    - Customer or client operations are unable to continue.
    - Financial processing, payroll, transaction processing, or another essential operation is blocked.
    - A department or organization cannot perform an essential business function.
    - A critical security, compliance, or operational function is unavailable.
    - There is no reasonable workaround and the business operation is seriously disrupted.

    Set "business_critical" to false when:

    - The issue only causes inconvenience.
    - Work is slower but can still continue.
    - Productivity is reduced but operations are still functioning.
    - One or more users are interrupted but essential business operations are not blocked.
    - A routine task cannot be completed but no serious business consequence is described.
    - The user only says "urgent", "ASAP", "important", or similar language.
    - Serious business impact must be inferred rather than explicitly stated.

    Do NOT use the number of affected users alone to determine business criticality.

    Affected scope is evaluated separately.

    Do NOT infer business criticality.

    TIME CRITICALITY DETECTION

    Analyze BOTH the Issue Description and Business Impact.

    Set "is_time_critical" to true ONLY when the ticket explicitly describes a near-term deadline, scheduled event, cutoff, or other time-sensitive activity where delaying resolution would cause a meaningful consequence.

    Examples that MAY justify is_time_critical = true:

    - A client meeting or presentation is starting soon and cannot proceed because of the issue.
    - A payroll, financial, deployment, or transaction cutoff is approaching and the task cannot be completed.
    - A contractual or business deadline is imminent and the issue prevents completion.
    - A scheduled production activity cannot proceed unless the issue is resolved soon.
    - A time-sensitive customer commitment will be missed.
    - Delaying resolution for even a short period would cause a significant operational, financial, customer, contractual, or compliance consequence.

    Set "is_time_critical" to false when:

    - The user only says "urgent", "ASAP", "immediately", or similar emotional language.
    - The user wants faster service but provides no actual deadline or time-sensitive consequence.
    - The user has a routine personal deadline with no significant business consequence.
    - Work is slower but can still continue.
    - The issue is inconvenient but no imminent consequence is described.
    - The deadline or urgency must be inferred or assumed.

    Do NOT set "is_time_critical" to true only because "business_critical" is true.

    Do NOT set "business_critical" to true only because "is_time_critical" is true.

    Evaluate them independently.

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
    - Infer time criticality.
    - Include unrelated keywords.

    If multiple unrelated issues exist, extract information only for the primary issue.

    Output valid JSON only.
    """

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.1,
            max_output_tokens=2000,
        ),
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

        data["cleaned_text"] = str(data.get("cleaned_text", "")).strip()
        data["summary"] = str(data.get("summary", "")).strip()

        keywords = data.get("keywords", [])
        if not isinstance(keywords, list):
            keywords = []

        data["keywords"] = [
            str(keyword).strip()
            for keyword in keywords
            if str(keyword).strip()
        ]

        data["is_unclear"] = bool(data.get("is_unclear", False))
        data["business_critical"] = bool(data.get("business_critical", False))
        data["is_time_critical"] = bool(data.get("is_time_critical", False))

        if data["is_unclear"]:
            data["keywords"] = []

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": data["cleaned_text"],
                "summary": data["summary"],
                "keywords": data["keywords"],
                "model_version": "gemini-2.5-flash",
                "business_critical": data["business_critical"],
                "is_time_critical": data["is_time_critical"],
                "is_unclear": data["is_unclear"],
            },
        )

        return data

    except Exception as e:
        fallback = {
            "cleaned_text": "",
            "summary": "AI parsing failed",
            "keywords": [],
            "business_critical": False,
            "is_time_critical": False,
            "is_unclear": True,
        }

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": fallback["cleaned_text"],
                "summary": fallback["summary"],
                "keywords": fallback["keywords"],
                "model_version": "gemini-2.5-flash",
                "business_critical": fallback["business_critical"],
                "is_time_critical": fallback["is_time_critical"],
                "is_unclear": fallback["is_unclear"],
            },
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

