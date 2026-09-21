from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    ConfusionMatrixDisplay,
)

# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

CLEAN_DATASET_PATH = BASE_DIR / "datasets" / "cleaned_dataset.csv"
TRAIN_PATH = BASE_DIR / "datasets" / "training_dataset.csv"
FIXED_TEST_PATH = BASE_DIR / "datasets" / "fixed_test_dataset.csv"
UNSEEN_PATH = BASE_DIR / "datasets" / "unseen_tickets.csv"

MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "symptom_classifier.pkl"
VECTORIZER_PATH = MODEL_DIR / "tfidf_vectorizer.pkl"
CONFUSION_MATRIX_PATH = MODEL_DIR / "confusion_matrix.png"


# =========================================================
# CREATE FIXED TRAIN / TEST FILES ONCE
# =========================================================

# =========================================================
# CREATE FIXED TRAIN / TEST FILES ONCE
# =========================================================

needs_split = (
    not TRAIN_PATH.exists()
    or not FIXED_TEST_PATH.exists()
    or TRAIN_PATH.stat().st_size == 0
    or FIXED_TEST_PATH.stat().st_size == 0
)

if needs_split:
    print("\nCreating fixed train/test datasets...")

    df = pd.read_csv(CLEAN_DATASET_PATH)

    train_df, test_df = train_test_split(
        df,
        test_size=0.20,
        random_state=42,
        stratify=df["symptom_code"]
    )

    train_df.to_csv(TRAIN_PATH, index=False)
    test_df.to_csv(FIXED_TEST_PATH, index=False)

    print("Training dataset created:", len(train_df))
    print("Fixed test dataset created:", len(test_df))

else:
    print("\nUsing existing fixed train/test datasets.")


# =========================================================
# LOAD TRAINING AND FIXED TEST DATA
# =========================================================

train_df = pd.read_csv(TRAIN_PATH)
test_df = pd.read_csv(FIXED_TEST_PATH)

print("\nTraining dataset shape:", train_df.shape)
print("Fixed test dataset shape:", test_df.shape)

print("\nTraining class distribution:")
print(train_df["symptom_code"].value_counts().sort_index())


# =========================================================
# PREPARE TEXT
# =========================================================

train_df["text"] = (
    train_df["subject"].fillna("").astype(str).str.strip()
    + " "
    + train_df["description"].fillna("").astype(str).str.strip()
)

test_df["text"] = (
    test_df["subject"].fillna("").astype(str).str.strip()
    + " "
    + test_df["description"].fillna("").astype(str).str.strip()
)

X_train = train_df["text"]
y_train = train_df["symptom_code"]

X_test = test_df["text"]
y_test = test_df["symptom_code"]

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))


# =========================================================
# TF-IDF
# =========================================================

vectorizer = TfidfVectorizer(
    lowercase=True,
    ngram_range=(1, 2),
    min_df=2,
    sublinear_tf=True,
)

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)


# =========================================================
# TRAIN MODEL
# =========================================================

model = LogisticRegression(
    C=10.0,
    max_iter=2000,
    random_state=42
)

model.fit(X_train_vec, y_train)


# =========================================================
# MODEL EVALUATION
# =========================================================

predictions = model.predict(X_test_vec)
probabilities = model.predict_proba(X_test_vec)

accuracy = accuracy_score(y_test, predictions)
macro_f1 = f1_score(y_test, predictions, average="macro")
weighted_f1 = f1_score(y_test, predictions, average="weighted")

print("\n==============================")
print("MODEL PERFORMANCE")
print("==============================")
print(f"Accuracy: {accuracy:.4f}")
print(f"Macro F1: {macro_f1:.4f}")
print(f"Weighted F1: {weighted_f1:.4f}")

print("\n==============================")
print("CLASSIFICATION REPORT")
print("==============================")
print(classification_report(y_test, predictions, digits=4))


# MISCLASSIFIED TEST TICKETS

errors = pd.DataFrame({
    "text": list(X_test),
    "actual": list(y_test),
    "predicted": list(predictions)
})

errors = errors[errors["actual"] != errors["predicted"]]

print("\n==============================================")
print("MISCLASSIFIED TEST TICKETS")
print("==============================================")
print(f"Total errors: {len(errors)}\n")

for _, row in errors.iterrows():
    print(f"Actual: {row['actual']} | Predicted: {row['predicted']}")
    print(f"Text: {row['text']}")
    print("-" * 80)


# ERROR PAIR SUMMARY

print("\n==============================================")
print("MISCLASSIFICATION SUMMARY")
print("==============================================")

if len(errors) > 0:
    print(
        errors.groupby(["actual", "predicted"])
        .size()
        .sort_values(ascending=False)
    )
else:
    print("No misclassified tickets.")


# CONFIDENCE THRESHOLD TEST

confidences = probabilities.max(axis=1)
thresholds = [0.40, 0.50, 0.60, 0.65, 0.70, 0.75, 0.80, 0.85, 0.90]
y_test_array = y_test.to_numpy()

print("\n==============================================")
print("CONFIDENCE THRESHOLD EVALUATION")
print("==============================================")

for threshold in thresholds:
    accepted = confidences >= threshold
    accepted_count = accepted.sum()

    if accepted_count == 0:
        continue

    actual = y_test_array[accepted]
    predicted = predictions[accepted]

    coverage = accepted_count / len(y_test_array)
    review_rate = 1 - coverage
    auto_accuracy = (actual == predicted).mean()
    wrong_auto = (actual != predicted).sum()

    print(
        f"Threshold={threshold:.0%} | "
        f"Auto={coverage:.2%} | "
        f"Review={review_rate:.2%} | "
        f"Auto Accuracy={auto_accuracy:.2%} | "
        f"Wrong Auto={wrong_auto}"
    )


# =========================================================
# CONFUSION MATRIX
# =========================================================

fig, ax = plt.subplots(figsize=(14, 14))

ConfusionMatrixDisplay.from_predictions(
    y_test,
    predictions,
    xticks_rotation=90,
    ax=ax,
    cmap="Blues"
)

plt.title("Symptom Code Classification Confusion Matrix")
plt.tight_layout()
plt.savefig(CONFUSION_MATRIX_PATH, dpi=300, bbox_inches="tight")
plt.close()


# =========================================================
# SAVE MODEL
# =========================================================

joblib.dump(model, MODEL_PATH)
joblib.dump(vectorizer, VECTORIZER_PATH)

print("\nModel saved successfully!")
print("Model:", MODEL_PATH)
print("Vectorizer:", VECTORIZER_PATH)


# =========================================================
# UNSEEN TICKET TEST
# =========================================================

if UNSEEN_PATH.exists():
    unseen_df = pd.read_csv(UNSEEN_PATH)

    unseen_df["text"] = (
        unseen_df["subject"].fillna("").astype(str).str.strip()
        + " "
        + unseen_df["description"].fillna("").astype(str).str.strip()
    )

    X_new = vectorizer.transform(unseen_df["text"])

    unseen_predictions = model.predict(X_new)
    unseen_probabilities = model.predict_proba(X_new)

    print("\n==============================")
    print("UNSEEN TICKET TEST")
    print("==============================")

    for i, actual in enumerate(unseen_df["expected"]):
        class_probs = unseen_probabilities[i]
        top_indices = class_probs.argsort()[-2:][::-1]

        top_1_idx = top_indices[0]
        top_2_idx = top_indices[1]

        top_1_class = model.classes_[top_1_idx]
        top_2_class = model.classes_[top_2_idx]

        top_1_conf = class_probs[top_1_idx]
        top_2_conf = class_probs[top_2_idx]
        margin = top_1_conf - top_2_conf

        result = "CORRECT" if actual == top_1_class else "WRONG"

        print(
            f"Expected: {actual} | "
            f"Predicted: {top_1_class} ({top_1_conf:.2%}) | "
            f"Second: {top_2_class} ({top_2_conf:.2%}) | "
            f"Margin: {margin:.2%} | "
            f"{result}"
        )
else:
    print("\nNo unseen_tickets.csv found.")