# Root Cause Analysis in Multivariate Sensor Faults in Heavy Vehicles.
   

A comprehensive web application for detecting and analyzing faults in Scania truck air pressure systems using machine learning and real-time data visualization.

## Features

- **Real-time Data Visualization**: Dynamic charts showing class distribution, feature correlations, and sensor behavior over time
- **Anomaly Detection**: Z-Score based anomaly detection to identify unusual sensor readings
- **Fault Classification**: Random Forest classifier to categorize different types of faults
- **Root Cause Analysis**: Feature importance analysis to identify critical sensors
- **Data Preprocessing**: Automatic handling of missing values and data cleaning
- **Modern UI**: Responsive design with intuitive user interface

## System Architecture

### Backend (Python Flask)
- **Data Processing**: Handles CSV file uploads with automatic preprocessing
- **Machine Learning**: Implements anomaly detection and fault classification algorithms
- **API Endpoints**: RESTful API for frontend communication
- **Data Validation**: Robust error handling and data validation

### Frontend (Vanilla JavaScript)
- **Real-time Charts**: Chart.js integration for dynamic visualizations
- **File Upload**: Drag-and-drop CSV file upload with validation
- **Responsive Design**: Modern UI with Tailwind CSS styling
- **Real Data Integration**: Fetches and displays actual data from backend APIs

## Quick Start

### 1. Start the Backend Server

```bash
cd Sensor-Fault-Cause-Analysis-main
python -m pip install -r requirements.txt
python -m pip install pandas
python -m pip install pandas flask flask-cors scikit-learn matplotlib seaborn
python app.py
```

The backend will start on `http://localhost:5000`

### 2. Open the Frontend

Simply open `index.html` in your web browser, or serve it using a local server:

```bash
# Using Python
python -m http.server 8000

```

=> Then visit `http://localhost:8000`

### 3. Test the System

1. **Upload Data**: Drag and drop a CSV file or click browse to select one
2. **View Visualizations**: The charts will automatically update with real data
3. **Run Analysis**: Click the analysis buttons to perform anomaly detection, classification, or root cause analysis
4. **View Results**: Check the results tab for detailed analysis outcomes

## Data Format

The system expects CSV files with the following format:

```csv
aa_000,ab_001,ac_002,...,class
2.1,2.3,1.9,...,Normal
2.5,2.7,2.1,...,Fault Class 1
...
```

- **Sensor Columns**: Numeric sensor readings (e.g., aa_000, ab_001, etc.)
- **Class Column**: Target variable indicating fault status (Normal, Fault Class 1, etc.)

## API Endpoints

### Core Endpoints
- `GET /api/health` - Health check
- `POST /api/upload` - Upload CSV file
- `POST /api/detect-anomalies` - Run anomaly detection
- `POST /api/classify-faults` - Run fault classification
- `POST /api/root-cause` - Run root cause analysis

### Visualization Endpoints
- `GET /api/visualization-data` - Get data for charts
- `GET /api/sensor-time-series` - Get time series data
- `GET /api/data-stats` - Get dataset statistics

## Data Preprocessing

The system automatically handles:
- Missing values (replaced with median)
- Non-numeric data (converted or dropped)
- Data type validation
- Outlier detection

## Machine Learning Models

### Anomaly Detection
- **Method**: Z-Score based detection
- **Threshold**: 3.0 standard deviations
- **Output**: Anomaly rate, critical/major/minor anomalies

### Fault Classification
- **Model**: Random Forest Classifier
- **Features**: All sensor readings
- **Target**: Fault class labels
- **Metrics**: Accuracy, Precision, Recall, F1-Score

### Root Cause Analysis
- **Method**: Feature importance from Random Forest
- **Output**: Ranked list of critical sensors
- **Interpretation**: Percentage importance for each sensor


## Sample Data Generation

Generate sample data for testing:

```bash
cd backend
python generate_sample_data.py
```

This creates a CSV file with realistic sensor data and fault patterns.

## Troubleshooting

### Common Issues

1. **"could not convert string to float: 'na'"**
   - The system now handles missing values automatically
   - Check your CSV file for proper formatting

2. **Backend connection errors**
   - Ensure the Flask server is running on port 5000
   - Check for CORS issues in browser console

3. **Chart not updating**
   - Refresh the page after uploading new data
   - Check browser console for JavaScript errors

### Data Requirements

- CSV format required
- Numeric sensor columns
- Class column for supervised learning
- Minimum 100 samples recommended

## Performance

- **Backend**: Handles datasets up to 100,000+ samples
- **Frontend**: Real-time chart updates
- **Memory**: Efficient data processing with pandas
- **Speed**: Fast ML inference with scikit-learn

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with sample data
4. Open an issue on GitHub 
