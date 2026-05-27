import spacy
import re
from dotenv import load_dotenv
from .models import TicketAIAnalysis

load_dotenv()

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")


def clean_text(text):
    doc = nlp(text.lower())

    non_technical = {
        'day','morning','afternoon','evening','night','time','today',
        'tomorrow','yesterday','week','month','year','hour','minute',
        'people','person','stuff','way','issue','problem','case','point',
        'thing','really','very','quite','just','actually','usually','always','sometimes'
    }

    tokens = []

    for token in doc:
        word = token.lemma_.lower()

        if (
            not token.is_punct
            and not token.is_stop
            and word not in non_technical
            and len(word) > 2
        ):
            tokens.append(word)

    return " ".join(tokens).strip()

def extract_keywords(text):
    doc = nlp(text.lower())

    IT_TERMS = {
        'error','crash','freeze','lag','slow','fail',
        'login','password','access','security',
        'network','internet','wifi','vpn','server',
        'cpu','memory','disk','storage','ram',
        'application','software','hardware',
        'install','update','boot','startup',
        'respond','response','pc','computer','file','system'
    }

    keywords = []

    for token in doc:
        word = token.lemma_.lower()

        if word in IT_TERMS:
            keywords.append(word)

    return list(dict.fromkeys(keywords))[:10]

def analyze_ticket(ticket):
    """Analyze ticket using spaCy for text structuring and keyword extraction."""
    try:
        full_text = f"{ticket.subject} {ticket.description}"
        
        cleaned_text = clean_text(full_text)
        keywords = extract_keywords(full_text)
        
        data = {
            "cleaned_text": cleaned_text,
            "keywords": keywords
        }
        
        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": cleaned_text,
                "keywords": keywords,
                "model_version": "spacy-en_core_web_sm"
            }
        )
        
        print("spaCy analysis successful:")
        print(f"  Cleaned text: {cleaned_text[:100]}...")
        print(f"  Keywords: {keywords}")
        
        return data

    except Exception as e:
        print("spaCy analysis error:", str(e))
        
        fallback = {
            "cleaned_text": "",
            "keywords": []
        }

        TicketAIAnalysis.objects.update_or_create(
            ticket=ticket,
            defaults={
                "cleaned_text": "",
                "keywords": [],
                "model_version": "spacy-en_core_web_sm"
            }
        )

        return fallback

def combined_text(ticket, summary, cleaned_text):
    return f"Subject: {ticket.subject} Description: {ticket.description} Cleaned Text: {cleaned_text} Summary: {summary}"

