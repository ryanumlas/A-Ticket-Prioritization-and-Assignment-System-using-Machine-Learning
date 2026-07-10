import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
from sklearn.metrics import ConfusionMatrixDisplay

df = pd.read_csv('backend/machine_learning/datasets/dataset.csv')

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

# print("Training samples:", len(X_train))
# print("Testing samples:", len(X_test))

vectorizer = TfidfVectorizer()

X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = LogisticRegression() 

model.fit(X_train_vec, y_train)

joblib.dump(model, "backend/machine_learning/models/symptom_classifier.pkl")
joblib.dump(vectorizer, "backend/machine_learning/models/tfidf_vectorizer.pkl")

print("Model saved successfully!")

prediction = model.predict(X_test_vec)

accuracy = accuracy_score(y_test, prediction)

# print(prediction)
# print(y_test.values)

# for actual, predicted in zip(y_test, prediction):
#     print(f"Actual: {actual} | Predicted: {predicted}")

print("Accuracy:", accuracy)

test_df = pd.read_csv('backend/machine_learning/datasets/unseen_tickets.csv')

X_new = vectorizer.transform(test_df["cleaned_text"])

predictions = model.predict(X_new)

for actual, pred in zip(test_df["expected"], predictions):
    print(f"Expected: {actual} | Predicted: {pred}")

# print(classification_report(y_test, prediction))