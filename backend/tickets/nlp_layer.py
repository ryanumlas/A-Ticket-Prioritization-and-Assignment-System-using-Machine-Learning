import spacy

try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    import subprocess
    import sys
    subprocess.check_call([sys.executable, "-m", "spacy", "download", "en_core_web_sm"])
    nlp = spacy.load("en_core_web_sm")


def tokenize_and_clean(text: str) -> list:
    """
    Convert ticket text to clean tokens for classification.
    
    Args:
        text: Combined subject + description
    
    Returns:
        List of lemmatized, deduplicated tokens (1-2+ chars, non-stopwords)
    
    Example:
        "My PC is not responding. Very slow today." 
        → ["pc", "respond", "slow"]
    """
    doc = nlp(text)
    
    tokens = []
    for token in doc:
        # Keep: non-punctuation, non-stopword, length > 2
        if (not token.is_punct 
            and not token.is_stop 
            and len(token.text) > 2):
            tokens.append(token.lemma_.lower())
    
    # Remove duplicates while preserving order
    return list(dict.fromkeys(tokens))
