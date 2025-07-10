# Root Cause Analysis for Multivariate Sensor Faults in Heavy Vehicles 🚚🔧

This project detects sensor faults and anomalies in Scania trucks' Air Pressure System using Z-Score and Random Forest. It also identifies the root cause sensors using feature importance and includes a GUI for user interaction.

## 📊 Features
- Anomaly detection using Z-Score
- Classification using Random Forest
- Root cause sensor identification
- GUI for file upload and analysis
- Visualizations for class distribution, correlation, and sensor behavior

## 🧠 Technologies
- Python, scikit-learn, pandas, seaborn, matplotlib, tkinter

## 🗂️ Folder Structure
```
aps-fault-analysis/
├── data/
│   └── aps_failure_test_set.csv
├── src/
│   └── gui_app.py
├── models/
│   └── trained_model.pkl (optional)
├── requirements.txt
├── README.md
└── LICENSE
```

## ▶️ How to Run
1. Clone this repo
```bash
git clone https://github.com/your-username/aps-fault-analysis.git
cd aps-fault-analysis
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Run the GUI app
```bash
python src/gui_app.py
```

## 📁 Sample Output
- Total Anomalies Detected
- Classification Metrics
- Top Root Cause Sensors
- Sensor Distribution Graphs

## 🔗 Dataset
[APS Failure at Scania Trucks - Kaggle](https://www.kaggle.com/datasets/paresh2047/aps-failure-at-scania-trucks-data-set)

---

© 2025 Milan Dhandhukiya. Summer Internship Project – Computer Engineering, 7th Semester
