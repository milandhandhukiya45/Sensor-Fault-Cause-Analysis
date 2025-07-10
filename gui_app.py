import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import zscore
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report, confusion_matrix,
    precision_score, recall_score, f1_score, roc_auc_score
)
import tkinter as tk
from tkinter import filedialog, messagebox

def run_prediction(file_path):
    df = pd.read_csv(file_path, na_values='na')
    df['class'] = df['class'].map({'neg': 0, 'pos': 1})
    missing_ratio = df.isnull().mean()
    df.drop(columns=missing_ratio[missing_ratio > 0.5].index, inplace=True)

    for col in df.columns:
        if df[col].dtype == 'O':
            df[col] = df[col].astype(float)

    imputer = SimpleImputer(strategy='median')
    df[df.columns] = imputer.fit_transform(df)

    top_corr = df.corr()['class'].abs().sort_values(ascending=False)[1:10]
    top_features = top_corr.index

    # Show Class Distribution Plot
    sns.countplot(x='class', data=df)
    plt.title("Class Distribution")
    plt.show()

    # Show Correlation Heatmap
    sns.heatmap(df[top_features].corr(), annot=True, cmap="coolwarm")
    plt.title("Top Feature Correlations")
    plt.show()

    # Z-score anomaly detection
    z_scores = zscore(df[top_features[:5]])
    df['is_anomaly'] = (abs(z_scores) > 3).any(axis=1).astype(int)

    X = df.drop(columns=['class', 'is_anomaly'])
    y = df['class']
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, stratify=y, random_state=42
    )

    model = RandomForestClassifier(n_estimators=100, class_weight='balanced', random_state=42)
    model.fit(X_train, y_train)

    y_probs = model.predict_proba(X_test)[:, 1]
    y_pred = (y_probs >= 0.5).astype(int)

    cm = confusion_matrix(y_test, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                xticklabels=['Negative', 'Positive'],
                yticklabels=['Negative', 'Positive'])
    plt.xlabel("Predicted")
    plt.ylabel("Actual")
    plt.title("Confusion Matrix")
    plt.show()

    X_test_df = pd.DataFrame(X_test, columns=X.columns)
    X_test_df["Actual"] = y_test.values
    X_test_df["Predicted"] = y_pred

    anomalies = X_test_df[X_test_df["Predicted"] == 1]
    true_pos = anomalies[anomalies["Actual"] == 1]
    false_pos = anomalies[anomalies["Actual"] == 0]

    importances = pd.Series(model.feature_importances_, index=X.columns)
    important_features = importances.sort_values(ascending=False)[:5]

    for feature in important_features.index:
        plt.figure(figsize=(6, 4))
        sns.kdeplot(df[df['class'] == 0][feature], label='Normal', fill=True)
        sns.kdeplot(df[df['class'] == 1][feature], label='Faulty', fill=True)
        plt.title(f"Sensor Distribution: {feature}")
        plt.xlabel(feature)
        plt.ylabel("Density")
        plt.legend()
        plt.tight_layout()
        plt.show()

    msg = f"""Total Rows: {len(df)}
Total Anomalies (Z-Score): {df['is_anomaly'].sum()}
Predicted Faults: {len(anomalies)}
✔️ True Positives: {len(true_pos)}
❌ False Positives: {len(false_pos)}

Top Root Cause Sensors:\n{important_features.to_string()}
"""
    messagebox.showinfo("Prediction Result", msg)

def select_file():
    file_path = filedialog.askopenfilename(filetypes=[("CSV files", "*.csv")])
    if file_path:
        run_prediction(file_path)

# GUI Setup
root = tk.Tk()
root.title("Sensor Fault Prediction System")

label = tk.Label(root, text="Upload your Sensor Data CSV", font=("Arial", 14))
label.pack(pady=10)

btn = tk.Button(root, text="Select CSV and Predict", command=select_file, bg="green", fg="white", font=("Arial", 12))
btn.pack(pady=10)

footer = tk.Label(root, text="Model: Random Forest | APS Failure Dataset", font=("Arial", 10))
footer.pack(pady=20)

root.mainloop()