from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent
FILE_PATH = BASE_DIR / "dataset.csv"
OUTPUT_PATH = BASE_DIR / "cleaned_dataset.csv"

# Load original dataset
df = pd.read_csv(FILE_PATH)

print(f"Rows before cleaning: {len(df)}")

# Show number of exact duplicate rows
duplicate_count = df.duplicated().sum()
print(f"Exact duplicates found: {duplicate_count}")

# Remove exact duplicate rows
df_clean = df.drop_duplicates().copy()

print(f"Rows after cleaning: {len(df_clean)}")
print(f"Rows removed: {len(df) - len(df_clean)}")

# Save as a NEW file
df_clean.to_csv(OUTPUT_PATH, index=False)

print(f"\nCleaned dataset saved to:")
print(OUTPUT_PATH)