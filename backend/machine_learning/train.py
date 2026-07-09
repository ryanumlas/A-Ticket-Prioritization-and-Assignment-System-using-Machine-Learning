import pandas as pd
from sklearn.model_selection import train_test_split

df = pd.read_csv('backend/machine_learning/dataset.csv')

# print(df.head())
# print(df.info())
# print(df.shape)

X = df['cleaned_text']
y = df['symptom_code']

X_train, X_test, y_train, y_test = train_test_split(
    X, 
    y, 
    test_size=0.2, 
    random_state=42
)

print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))