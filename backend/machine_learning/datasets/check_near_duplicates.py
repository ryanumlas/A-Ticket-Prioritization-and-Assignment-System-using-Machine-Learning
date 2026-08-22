from pathlib import Path
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


BASE_DIR = Path(__file__).resolve().parent
FILE_PATH = BASE_DIR / "cleaned_dataset.csv"

df = pd.read_csv(FILE_PATH)

# Combine subject + description because both will eventually
# provide useful information to the classifier.
df["text"] = (
    df["subject"].fillna("").astype(str)
    + " "
    + df["description"].fillna("").astype(str)
)

# Convert text into TF-IDF features.
vectorizer = TfidfVectorizer(
    lowercase=True,
    ngram_range=(1, 2),
    stop_words="english"
)

X = vectorizer.fit_transform(df["text"])

# Calculate similarity between tickets.
similarity_matrix = cosine_similarity(X)

# Start fairly high.
# 0.90 means tickets must be very similar to be reported.
THRESHOLD = 0.90

near_duplicates = []

for i in range(len(df)):
    for j in range(i + 1, len(df)):

        similarity = similarity_matrix[i, j]

        if similarity >= THRESHOLD:
            near_duplicates.append({
                "row_1": i,
                "row_2": j,
                "similarity": round(float(similarity), 3),

                "code_1": df.iloc[i]["symptom_code"],
                "code_2": df.iloc[j]["symptom_code"],

                "subject_1": df.iloc[i]["subject"],
                "subject_2": df.iloc[j]["subject"],

                "description_1": df.iloc[i]["description"],
                "description_2": df.iloc[j]["description"],
            })


results = pd.DataFrame(near_duplicates)

print("\n==============================")
print("NEAR-DUPLICATE CHECK")
print("==============================")

print(f"Total dataset rows: {len(df)}")
print(f"Similarity threshold: {THRESHOLD}")
print(f"Near-duplicate pairs found: {len(results)}")

if len(results) > 0:

    same_label = results[
        results["code_1"] == results["code_2"]
    ]

    different_label = results[
        results["code_1"] != results["code_2"]
    ]

    print(
        f"Same-label similar pairs: "
        f"{len(same_label)}"
    )

    print(
        f"Different-label similar pairs: "
        f"{len(different_label)}"
    )

    OUTPUT_PATH = BASE_DIR / "near_duplicates.csv"

    results.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print(
        f"\nResults saved to:\n"
        f"{OUTPUT_PATH}"
    )

else:
    print("No near-duplicate pairs found.")