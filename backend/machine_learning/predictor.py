from pathlib import Path
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "symptom_classifier.pkl"
VECTORIZER_PATH = BASE_DIR / "models" / "tfidf_vectorizer.pkl"

CONFIDENCE_THRESHOLD = 0.60

model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)

def predict_symptom_code(subject, description): 

    combined_text = f"{subject} {description}"

    print(combined_text)

    text_vector = vectorizer.transform([combined_text])

    probabilities = model.predict_proba(text_vector)[0]

    # confidence = max(probabilities)

    # top_index = np.argmax(probabilities)
    sorted_indices = np.argsort(probabilities)[::-1]

    top_index = sorted_indices[0]
    second_top_index = sorted_indices[1]

    confidence = probabilities[top_index]
    second_confidence = probabilities[second_top_index]

    predicted_code = model.classes_[top_index]
    second_predicted_code = model.classes_[second_top_index]

    margin = confidence - second_confidence

    requires_review = False

    if confidence < CONFIDENCE_THRESHOLD:
        requires_review = True
    else:
        requires_review = False

    print(predicted_code)
    print(second_predicted_code)
    print(confidence)
    print(second_confidence)
    print(margin)
    print(requires_review)

    return {
        "predicted_code": predicted_code,
        "second_predicted_code": second_predicted_code,
        "confidence": float(confidence),
        "second_confidence": float(second_confidence),
        "margin": float(margin),
        "requires_review": requires_review,
    }

predict_symptom_code("cant get into payroll",
"payroll opens fine but when i click the employee records it says im not allowed to view them. other parts are working tho")


