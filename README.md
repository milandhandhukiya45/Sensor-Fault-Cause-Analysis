# Project : Root Cause Analysis in Multivariate Sensor Faults in Heavy Vehicles.


## Features
- Modern React frontend (Vite, TypeScript, Tailwind CSS)
- Python Flask backend with REST API
- Example endpoint: `/api/hello`

---

Sensor-Fault-Cause-Analysis/
├── .gitignore
├── App.tsx
├── DataAnalysis.tsx
├── DataUpload.tsx
├── ModelResults.tsx
├── RootCauseAnalysis.tsx
├── app.py
├── aps_failure_test_set.csv
├── config.json
├── eslint.config.js
├── index.css
├── index.html
├── main.tsx
├── ml_logic.py
├── package-lock.json
├── package.json
├── postcss.config.js
├── requirements.txt
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
└── README.md

---
## Machine Learning Model
This project implements a hybrid pipeline combining **classification** and **statistical anomaly detection** for analyzing multivariate sensor data from heavy vehicles. The system predicts sensor faults and supports root cause identification using a trained machine learning model.

### Objectives
- Classify whether a fault occurred (`class = pos`) or not (`class = neg`)
- Analyze which sensor features are most likely contributing to these faults
- Visualize sensor behavior and anomalies using statistical methods

### Techniques Used

#### 1. Random Forest Classifier
- A powerful ensemble-based algorithm suitable for noisy, high-dimensional data
- Handles missing values and feature interactions well
- Provides **feature importance scores** used for identifying root cause sensors

#### 2. Z-Score Anomaly Detection
- Applied on selected top features
- Detects extreme sensor values (outliers) that might indicate anomalies
- Anomalous rows are flagged with an `is_anomaly` column

### Pipeline Steps

1. **Data Loading & Cleaning**
   - CSV loaded via GUI (`tkinter.filedialog`)
   - Missing values imputed using **median strategy**
   - Columns with >50% missing values dropped
   - Object-type columns converted to float

2. **Label Transformation**
   - Categorical labels mapped: `'neg' → 0`, `'pos' → 1`

3. **Feature Selection**
   - Correlation with the `class` label computed
   - Top 9 features selected based on absolute correlation values

4. **Anomaly Detection**
   - Z-score applied to top 5 features
   - Any row with `|z| > 3` is flagged as anomalous

5. **Model Training**
   - `RandomForestClassifier` with 100 trees and `class_weight="balanced"`
   - Trained on 70% of data, tested on 30% using stratified sampling
   - Predictions converted to class labels using threshold of 0.5

6. **Evaluation & Explanation**
   - Confusion matrix and performance report displayed
   - Feature importances extracted to find **most influential sensors**
   - KDE plots generated to visualize feature distribution for faulty vs. normal

### Output Visualizations
- **Class Distribution Plot**
- **Correlation Heatmap of Top Features**
- **Confusion Matrix Heatmap**
- **KDE Sensor Distributions** (Faulty vs Normal)
- **Root Cause Sensors** list with importance ranking

### Libraries Used

- **Data Processing**: `pandas`, `numpy`, `scipy`
- **Modeling**: `scikit-learn`
- **Visualization**: `matplotlib`, `seaborn`
- **UI**: `tkinter` (GUI), `messagebox` (result popups)

### Root Cause Analysis Logic

After model prediction, the top contributing sensors are identified using the `feature_importances_` attribute of the trained Random Forest model. These features are visualized
using KDE plots to understand how they behave under faulty vs. normal conditions. This insight helps engineers trace the likely root causes of the detected sensor faults.


## Getting Started

### 1. Backend (Flask)

#### Setup
```sh
cd backend
python -m pip install -r requirements.txt
```

#### Run the backend
```sh
python app.py
```
- The backend will run at http://127.0.0.1:5000/api/hello
- Test endpoint: http://127.0.0.1:5000/api/hello    OR    http://localhost:5000/api/hello

---

### 2. Frontend (React + Vite)

#### Prerequisite
- **Node.js and npm must be installed.**
- Download from [https://nodejs.org/](https://nodejs.org/)

#### Setup
```sh
cd project
npm install
```

#### Run the frontend
```sh
npm run dev
```
- The frontend will run at `http://localhost:5173`

---

## Troubleshooting
- If `npm` is not recognized, install Node.js and restart your terminal.
- If `pip` is not recognized, ensure Python is installed and added to your PATH.
- If ports 5000 or 5173 are in use, change them in the respective configs.

---

## Deployment
- **Frontend:** Deploy to Vercel, Netlify, or GitHub Pages.
- **Backend:** Deploy to Render, Heroku, or any Python-friendly host.

---

## License
MIT
