import pandas as pd

FILE_PATH = "machine_learning/datasets/cleaned_dataset.csv"

df = pd.read_csv(FILE_PATH)

print("\n==============================")
print("DATASET BASIC INFORMATION")
print("==============================")

print(f"Total rows: {len(df)}")
print(f"Total columns: {len(df.columns)}")
print(f"Columns: {list(df.columns)}")

print("\n==============================")
print("MISSING VALUES")
print("==============================")

print(df.isnull().sum())

print("\n==============================")
print("EMPTY VALUES")
print("==============================")

for column in ["subject", "description", "symptom_code"]:
    if column in df.columns:
        empty_count = (
            df[column]
            .fillna("")
            .astype(str)
            .str.strip()
            .eq("")
            .sum()
        )

        print(f"{column}: {empty_count}")

print("\n==============================")
print("SYMPTOM CODE DISTRIBUTION")
print("==============================")

counts = (
    df["symptom_code"]
    .value_counts()
    .sort_index()
)

print(counts.to_string())

print("\n==============================")
print("CLASS BALANCE")
print("==============================")

if len(counts) > 0:
    largest_code = counts.idxmax()
    largest_count = counts.max()

    smallest_code = counts.idxmin()
    smallest_count = counts.min()

    imbalance_ratio = (
        largest_count / smallest_count
        if smallest_count > 0
        else 0
    )

    print(
        f"Largest class: {largest_code} "
        f"({largest_count} rows)"
    )

    print(
        f"Smallest class: {smallest_code} "
        f"({smallest_count} rows)"
    )

    print(
        f"Imbalance ratio: "
        f"{imbalance_ratio:.2f}"
    )

print("\n==============================")
print("EXACT DUPLICATE ROWS")
print("==============================")

exact_duplicates = df.duplicated().sum()

print(
    f"Exact duplicate rows: "
    f"{exact_duplicates}"
)

print("\n==============================")
print("DUPLICATE DESCRIPTIONS")
print("==============================")

duplicate_descriptions = df[
    df.duplicated(
        subset=["description"],
        keep=False
    )
].sort_values("description")

print(
    f"Rows with duplicate descriptions: "
    f"{len(duplicate_descriptions)}"
)

if len(duplicate_descriptions) > 0:
    print(
        duplicate_descriptions[
            [
                "subject",
                "description",
                "symptom_code"
            ]
        ].to_string(index=False)
    )

print("\n==============================")
print("DUPLICATE SUBJECTS")
print("==============================")

duplicate_subjects = df[
    df.duplicated(
        subset=["subject"],
        keep=False
    )
]

print(
    f"Rows with duplicate subjects: "
    f"{len(duplicate_subjects)}"
)

print("\n==============================")
print("CONFLICTING LABELS")
print("==============================")

conflicts = (
    df.groupby("description")["symptom_code"]
    .nunique()
)

conflicting_descriptions = conflicts[
    conflicts > 1
]

print(
    f"Descriptions assigned to "
    f"different symptom codes: "
    f"{len(conflicting_descriptions)}"
)

if len(conflicting_descriptions) > 0:

    conflict_rows = df[
        df["description"].isin(
            conflicting_descriptions.index
        )
    ].sort_values("description")

    print(
        conflict_rows[
            [
                "subject",
                "description",
                "symptom_code"
            ]
        ].to_string(index=False)
    )

print("\n==============================")
print("VERY SHORT DESCRIPTIONS")
print("==============================")

df["description_word_count"] = (
    df["description"]
    .fillna("")
    .astype(str)
    .str.split()
    .str.len()
)

short_descriptions = df[
    df["description_word_count"] < 5
]

print(
    f"Descriptions under 5 words: "
    f"{len(short_descriptions)}"
)

if len(short_descriptions) > 0:
    print(
        short_descriptions[
            [
                "subject",
                "description",
                "symptom_code"
            ]
        ].to_string(index=False)
    )

print("\n==============================")
print("UNIQUE SYMPTOM CODES")
print("==============================")

codes = sorted(
    df["symptom_code"]
    .dropna()
    .unique()
)

print(f"Number of classes: {len(codes)}")
print(codes)

print("\n==============================")
print("AUDIT COMPLETE")
print("==============================")