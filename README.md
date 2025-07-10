# Root Cause Analysis for Multivariate Sensor Faults in Heavy Vehicles

This project detects sensor faults and anomalies in Scania trucks' Air Pressure System using Z-Score and Random Forest. It also identifies the root cause sensors using feature importance and includes a GUI for user interaction.

Features
- Anomaly detection using Z-Score
- Classification using Random Forest
- Root cause sensor identification
- GUI for file upload and analysis
- Visualizations for class distribution, correlation, and sensor behavior

Technologies
- Python, scikit-learn, pandas, seaborn, matplotlib, tkinter

Folder Structure
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

```

How to Run the GUI App 

1. Clone this repository
```bash
git clone https://github.com/milandhandhukiya45/Sensor-Fault-Cause-Analysis.git
cd Sensor-Fault-Cause-Analysis
```

2. Install dependencies
```bash
pip install -r requirements.txt
(if needed then manually install packages : pip install pandas scikit-learn matplotlib seaborn )
```

3. Run the GUI app
```bash
python src/gui_app.py
```

4. Use the App
The GUI window will open.
Click on “Select CSV and Predict”
Upload a .csv file with sensor data.
Make sure the file contains a class column labeled with 'pos' and 'neg' values.


Sample Output
- Total Anomalies Detected
- Classification Metrics
- Top Root Cause Sensors
- Sensor Distribution Graphs

Dataset
[APS Failure at Scania Trucks - Kaggle](https://www.kaggle.com/datasets/paresh2047/aps-failure-at-scania-trucks-data-set)

---

© 2025 Milan Dhandhukiya. Summer Internship Project – Computer Engineering, 7th Semester
