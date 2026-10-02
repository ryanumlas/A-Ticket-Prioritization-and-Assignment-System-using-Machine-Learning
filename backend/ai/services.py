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

    Determine whether the employee has communicated an understandable IT problem,
    not whether they have provided enough information to diagnose or resolve it.

    Set "is_unclear" to true ONLY when the reported issue cannot reasonably
    be identified from the information provided.

    A ticket is CLEAR when it communicates at least one understandable IT problem,
    failure, symptom, or unexpected behavior involving a device, application,
    account, network, or IT service.

    The description may be short, informal, grammatically incorrect, or missing
    technical details. These are NOT reasons to mark it as unclear.

    Mark the ticket as unclear only when:
    - The employee says something is wrong but does not identify what is wrong.
    - The employee mentions a device or application without describing any
    problem, symptom, failure, or unexpected behavior.
    - The description is so ambiguous that the actual IT issue cannot reasonably
    be identified.
    - The description does not communicate an identifiable IT support issue.

    CLEAR EXAMPLES:

    - "Printer not working."
    - "Cannot print."
    - "My laptop won't turn on."
    - "Internet is down."
    - "Outlook keeps crashing."
    - "Can't log in."
    - "My mouse stopped working."
    - "The computer is very slow."
    - "Teams has no sound."
    - "The system gives me an access denied error."
    - "My printer is not working. I tried printing, but nothing comes out."
    - "My PC is slow and applications take a long time to open."

    All the examples above must have "is_unclear": false because the reported
    problem or observable symptom can be understood.

    UNCLEAR EXAMPLES:

    - "Something is wrong."
    - "Please help me."
    - "I have a problem."
    - "It's not working." (when the affected device, application, service,
    or other relevant context cannot be identified)
    - "My computer." (no problem or symptom is described)
    - "Please check this." (no identifiable issue is provided)

    IMPORTANT DECISION RULES:

    1. Do NOT require the employee to explain the root cause, error code,
    troubleshooting steps, business impact, or exact technical details.

    2. Do NOT mark a ticket as unclear solely because the description is short.

    3. Do NOT mark a ticket as unclear solely because the business impact is
    brief or missing, if the actual IT problem is understandable.

    4. Do NOT require the employee to explain why the issue occurred.

    5. A device or application name alone is not sufficient. The description
    must communicate a problem or unexpected behavior.

    6. When a recognizable symptom is reported, prefer "is_unclear": false
    unless the available information genuinely prevents identification
    of the reported issue.

    7. Evaluate the subject, issue description, and relevant business impact
    together. Use the subject and context to understand what the employee
    is reporting, but do not invent missing symptoms.

    8. A clear ticket can still lack information needed for troubleshooting.
    Missing troubleshooting details do NOT automatically make the ticket
    unclear. Additional details may be collected during IT investigation.

    9. Do not confuse description clarity with classification confidence.
    A ticket may be clear even when the classification model is uncertain
    about its category or symptom code.

    IF IS_UNCLEAR IS TRUE:

    - Return an empty keywords array.
    - Do not guess or invent technical symptoms.
    - Generate a short summary explaining that the actual problem needs
    clarification.

    IF IS_UNCLEAR IS FALSE:

    - Extract keywords only from the reported issue and its explicit context.
    - Do not invent symptoms or technical causes.

    Return the "is_unclear" field as a JSON boolean: true or false.

   TIME CRITICALITY DETECTION

    Analyze BOTH the Issue Description and Business Impact.

    Set "is_time_critical" to true when the ticket explicitly describes either:

    1. A near-term deadline, scheduled event, cutoff, or time-sensitive activity
    where delaying resolution would cause a meaningful consequence,

    OR

    2. An ongoing operational disruption where the affected activity cannot
    continue and continued downtime would reasonably cause a significant
    operational, financial, customer, production, or service consequence.

    Examples that MAY justify is_time_critical = true:

    - A client meeting or presentation is starting soon and cannot proceed.
    - A payroll, financial, deployment, or transaction cutoff is approaching.
    - A contractual or business deadline is imminent.
    - A scheduled production activity cannot proceed unless the issue is resolved.
    - Production operations are currently stopped because of the issue.
    - A critical business service is unavailable and employees cannot continue
    the affected operation.
    - A customer-facing service is currently unavailable.
    - Continued downtime is causing an ongoing significant business disruption.
    - Delaying resolution would cause significant operational, financial,
    customer, contractual, or compliance consequences.

    Do NOT require the employee to explicitly state a specific deadline when
    the ticket clearly describes an ongoing critical operation that cannot
    continue because of the issue.

    However, do NOT infer time criticality merely from:

    - "urgent"
    - "ASAP"
    - "important"
    - "please fix immediately"
    - general inconvenience
    - reduced productivity
    - a single user's inability to perform a routine task
    - a problem where normal work can continue through a reasonable workaround

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

