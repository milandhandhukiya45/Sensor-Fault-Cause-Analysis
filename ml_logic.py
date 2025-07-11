import pandas as pd
from scipy.stats import zscore
from sklearn.impute import SimpleImputer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier


def analyze_sensor_data(file_path):
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

    z_scores = zscore(df[top_features[:5]])
    df = df.copy()
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

    X_test_df = pd.DataFrame(X_test, columns=X.columns)
    X_test_df["Actual"] = y_test.values
    X_test_df["Predicted"] = y_pred

    anomalies = X_test_df[X_test_df["Predicted"] == 1]
    true_pos = anomalies[anomalies["Actual"] == 1]
    false_pos = anomalies[anomalies["Actual"] == 0]

    importances = pd.Series(model.feature_importances_, index=X.columns)
    important_features = importances.sort_values(ascending=False)[:5]

    result = {
        "total_rows": int(len(df)),
        "total_anomalies": int(df['is_anomaly'].sum()),
        "predicted_faults": int(len(anomalies)),
        "true_positives": int(len(true_pos)),
        "false_positives": int(len(false_pos)),
        "top_root_cause_sensors": important_features.to_dict()
    }
    return result