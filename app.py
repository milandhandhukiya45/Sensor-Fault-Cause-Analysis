from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib
import os
import tempfile
import json
from datetime import datetime
import logging
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global variables to store the model and scaler
model = None
scaler = None
feature_names = None

class SensorFaultDetector:
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = None
        self.z_score_threshold = 3.0
        
    def detect_anomalies_zscore(self, data):
        """Detect anomalies using Z-Score method"""
        try:
            # Calculate Z-scores for each feature
            z_scores = np.abs((data - data.mean()) / data.std())
            
            # Find anomalies (points with Z-score > threshold)
            anomalies = (z_scores > self.z_score_threshold).any(axis=1)
            
            # Calculate statistics
            total_samples = len(data)
            anomaly_count = anomalies.sum()
            anomaly_rate = (anomaly_count / total_samples) * 100
            
            # Categorize anomalies by severity
            max_z_scores = z_scores.max(axis=1)
            critical_anomalies = (max_z_scores > 5.0).sum()
            major_anomalies = ((max_z_scores > 3.5) & (max_z_scores <= 5.0)).sum()
            minor_anomalies = ((max_z_scores > 3.0) & (max_z_scores <= 3.5)).sum()
            
            return {
                'totalSamples': int(total_samples),
                'anomalies': int(anomaly_count),
                'anomalyRate': round(anomaly_rate, 2),
                'criticalAnomalies': int(critical_anomalies),
                'majorAnomalies': int(major_anomalies),
                'minorAnomalies': int(minor_anomalies),
                'anomalyIndices': anomalies.tolist(),
                'zScores': z_scores.values.tolist()
            }
        except Exception as e:
            logger.error(f"Error in anomaly detection: {str(e)}")
            raise
    
    def train_random_forest(self, X, y):
        """Train Random Forest classifier"""
        try:
            # Split the data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale the features
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            # Train Random Forest
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=-1
            )
            self.model.fit(X_train_scaled, y_train)
            
            # Make predictions
            y_pred = self.model.predict(X_test_scaled)
            
            # Calculate metrics
            accuracy = accuracy_score(y_test, y_pred) * 100
            precision = precision_score(y_test, y_pred, average='weighted') * 100
            recall = recall_score(y_test, y_pred, average='weighted') * 100
            f1 = f1_score(y_test, y_pred, average='weighted') * 100
            
            # Get class distribution
            class_counts = y.value_counts().to_dict()
            
            return {
                'accuracy': round(accuracy, 2),
                'precision': round(precision, 2),
                'recall': round(recall, 2),
                'f1Score': round(f1, 2),
                'classes': {str(k): int(v) for k, v in class_counts.items()},
                'classificationReport': classification_report(y_test, y_pred, output_dict=True)
            }
        except Exception as e:
            logger.error(f"Error in training Random Forest: {str(e)}")
            raise
    
    def get_feature_importance(self):
        """Get feature importance from trained model"""
        try:
            if self.model is None:
                raise ValueError("Model not trained yet")
            
            # Get feature importance
            importance = self.model.feature_importances_
            
            # Create feature importance list
            feature_importance = []
            for i, (name, imp) in enumerate(zip(self.feature_names, importance)):
                feature_importance.append({
                    'name': name,
                    'importance': round(float(imp), 3),
                    'description': self._get_sensor_description(name)
                })
            
            # Sort by importance
            feature_importance.sort(key=lambda x: x['importance'], reverse=True)
            
            return {
                'topSensors': feature_importance[:10],  # Top 10 sensors
                'allSensors': feature_importance
            }
        except Exception as e:
            logger.error(f"Error in getting feature importance: {str(e)}")
            raise
    
    def _get_sensor_description(self, sensor_name):
        """Get description for sensor based on name"""
        descriptions = {
            'aa_000': 'Air Pressure Sensor A',
            'ab_001': 'Air Pressure Sensor B',
            'ac_002': 'Air Compressor Sensor',
            'ad_003': 'Air Tank Sensor',
            'ae_004': 'Air Filter Sensor',
            'af_005': 'Air Valve Sensor',
            'ag_005': 'Air Flow Sensor G',
            'ag_006': 'Air Regulator Sensor',
            'ah_007': 'Air Heater Sensor',
            'ai_008': 'Air Intake Sensor',
            'aj_009': 'Air Junction Sensor',
            'ak_010': 'Air Kit Sensor',
            'al_011': 'Air Line Sensor',
            'am_012': 'Air Manifold Sensor',
            'an_013': 'Air Nozzle Sensor',
            'ao_014': 'Air Outlet Sensor'
        }
        return descriptions.get(sensor_name, f'{sensor_name} Sensor')

# Initialize the detector
detector = SensorFaultDetector()

def preprocess_data(df):
    """Preprocess the data to handle missing values and non-numeric data"""
    try:
        # Create a copy to avoid modifying original data
        df_clean = df.copy()
        
        # Check if dataframe is empty
        if df_clean.empty:
            raise ValueError("DataFrame is empty")
        
        # Replace 'na', 'NA', 'NaN', 'nan' with numpy NaN
        df_clean = df_clean.replace(['na', 'NA', 'NaN', 'nan', ''], np.nan)
        
        # Convert numeric columns to float, handling errors
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in df_clean.columns:
            if col not in numeric_cols and col != 'class':
                try:
                    df_clean[col] = pd.to_numeric(df_clean[col], errors='coerce')
                except:
                    # If conversion fails, drop the column
                    df_clean = df_clean.drop(col, axis=1)
                    logger.warning(f"Dropped non-numeric column: {col}")
        
        # Handle missing values in numeric columns
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if col != 'class':
                # Fill missing values with median
                median_val = df_clean[col].median()
                if pd.isna(median_val):
                    median_val = 0.0
                df_clean[col] = df_clean[col].fillna(median_val)
        
        # Remove rows with missing target values
        if 'class' in df_clean.columns:
            df_clean = df_clean.dropna(subset=['class'])
        
        # Ensure all numeric columns are float
        for col in df_clean.columns:
            if col != 'class':
                df_clean[col] = df_clean[col].astype(float)
        
        # Final validation
        if df_clean.empty:
            raise ValueError("No valid data remaining after preprocessing")
        
        if len(df_clean.columns) < 2:
            raise ValueError("Insufficient features after preprocessing")
        
        logger.info(f"Data preprocessing completed. Shape: {df_clean.shape}")
        return df_clean
        
    except Exception as e:
        logger.error(f"Error in data preprocessing: {str(e)}")
        raise

def safe_jsonify(data):
    """Recursively replace NaN and inf with None for JSON serialization"""
    if isinstance(data, dict):
        return {k: safe_jsonify(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [safe_jsonify(v) for v in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return data
    else:
        return data

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'message': 'Sensor Fault Detection API is running'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and data preprocessing"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'Only CSV files are supported'}), 400
        
        # Read the CSV file
        df = pd.read_csv(file)
        
        # Basic data validation
        if df.empty:
            return jsonify({'error': 'File is empty'}), 400
        
        # Store the data temporarily (in production, you'd use a database)
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv')
        df.to_csv(temp_file.name, index=False)
        
        # Extract feature names (assuming last column is target)
        feature_cols = [col for col in df.columns if col != 'class']
        detector.feature_names = feature_cols
        
        # Get basic statistics
        stats = {
            'rows': len(df),
            'columns': len(df.columns),
            'features': len(feature_cols),
            'filename': file.filename,
            'upload_time': datetime.now().isoformat()
        }
        
        return jsonify({
            'message': 'File uploaded successfully',
            'data': stats
        })
        
    except Exception as e:
        logger.error(f"Error in file upload: {str(e)}")
        return jsonify({'error': f'Error processing file: {str(e)}'}), 500

@app.route('/api/detect-anomalies', methods=['POST'])
def detect_anomalies():
    """Detect anomalies using Z-Score method"""
    try:
        # Get the uploaded file path (in production, get from database)
        temp_files = [f for f in os.listdir(tempfile.gettempdir()) if f.endswith('.csv')]
        if not temp_files:
            return jsonify({'error': 'No data file found. Please upload a file first.'}), 400
        
        # Read the most recent CSV file
        latest_file = max(temp_files, key=lambda x: os.path.getctime(os.path.join(tempfile.gettempdir(), x)))
        file_path = os.path.join(tempfile.gettempdir(), latest_file)
        
        df = pd.read_csv(file_path)
        
        # Preprocess data
        df_preprocessed = preprocess_data(df)
        
        # Remove target column if present
        if 'class' in df_preprocessed.columns:
            df_features = df_preprocessed.drop('class', axis=1)
        else:
            df_features = df_preprocessed
        
        # Detect anomalies
        results = detector.detect_anomalies_zscore(df_features)
        
        return jsonify(safe_jsonify({
            'type': 'anomalies',
            'data': results,
            'timestamp': datetime.now().isoformat()
        }))
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}")
        return jsonify({'error': f'Error in anomaly detection: {str(e)}'}), 500

@app.route('/api/classify-faults', methods=['POST'])
def classify_faults():
    """Classify faults using Random Forest"""
    try:
        # Get the uploaded file path
        temp_files = [f for f in os.listdir(tempfile.gettempdir()) if f.endswith('.csv')]
        if not temp_files:
            return jsonify({'error': 'No data file found. Please upload a file first.'}), 400
        
        latest_file = max(temp_files, key=lambda x: os.path.getctime(os.path.join(tempfile.gettempdir(), x)))
        file_path = os.path.join(tempfile.gettempdir(), latest_file)
        
        df = pd.read_csv(file_path)
        
        # Check if target column exists
        if 'class' not in df.columns:
            return jsonify({'error': 'Target column "class" not found in dataset'}), 400
        
        # Preprocess data
        df_preprocessed = preprocess_data(df)
        
        # Prepare features and target
        X = df_preprocessed.drop('class', axis=1)
        y = df_preprocessed['class']
        
        # Train model and get results
        results = detector.train_random_forest(X, y)
        
        return jsonify(safe_jsonify({
            'type': 'classification',
            'data': results,
            'timestamp': datetime.now().isoformat()
        }))
        
    except Exception as e:
        logger.error(f"Error in fault classification: {str(e)}")
        return jsonify({'error': f'Error in fault classification: {str(e)}'}), 500

@app.route('/api/root-cause', methods=['POST'])
def identify_root_cause():
    """Identify root cause sensors using feature importance"""
    try:
        # Check if model is trained
        if detector.model is None:
            return jsonify({'error': 'Model not trained. Please run classification first.'}), 400
        
        # Get feature importance
        results = detector.get_feature_importance()
        
        return jsonify({
            'type': 'rootcause',
            'data': results,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in root cause analysis: {str(e)}")
        return jsonify({'error': f'Error in root cause analysis: {str(e)}'}), 500

@app.route('/api/data-stats', methods=['GET'])
def get_data_statistics():
    """Get basic statistics about the uploaded data"""
    try:
        temp_files = [f for f in os.listdir(tempfile.gettempdir()) if f.endswith('.csv')]
        if not temp_files:
            return jsonify({'error': 'No data file found'}), 404
        
        latest_file = max(temp_files, key=lambda x: os.path.getctime(os.path.join(tempfile.gettempdir(), x)))
        file_path = os.path.join(tempfile.gettempdir(), latest_file)
        
        df = pd.read_csv(file_path)
        
        stats = {
            'rows': len(df),
            'columns': len(df.columns),
            'memory_usage': df.memory_usage(deep=True).sum(),
            'missing_values': df.isnull().sum().sum(),
            'numeric_columns': len(df.select_dtypes(include=[np.number]).columns),
            'categorical_columns': len(df.select_dtypes(include=['object']).columns),
            'column_names': df.columns.tolist()
        }
        
        return jsonify(stats)
        
    except Exception as e:
        logger.error(f"Error getting data statistics: {str(e)}")
        return jsonify({'error': f'Error getting data statistics: {str(e)}'}), 500

@app.route('/api/visualization-data', methods=['GET'])
def get_visualization_data():
    """Get data for visualizations including time series, correlations, and class distribution"""
    try:
        temp_files = [f for f in os.listdir(tempfile.gettempdir()) if f.endswith('.csv')]
        if not temp_files:
            return jsonify({'error': 'No data file found'}), 404
        
        latest_file = max(temp_files, key=lambda x: os.path.getctime(os.path.join(tempfile.gettempdir(), x)))
        file_path = os.path.join(tempfile.gettempdir(), latest_file)
        
        df = pd.read_csv(file_path)
        
        # Preprocess data for visualizations
        df_preprocessed = preprocess_data(df)
        
        # Class distribution
        class_distribution = {}
        if 'class' in df_preprocessed.columns:
            class_counts = df_preprocessed['class'].value_counts()
            class_distribution = {str(k): int(v) for k, v in class_counts.items()}
        else:
            # If no class column, create a dummy distribution
            class_distribution = {'Normal': len(df_preprocessed)}
        
        # Feature correlation with target (if class exists)
        correlations = {}
        if 'class' in df_preprocessed.columns:
            numeric_cols = df_preprocessed.select_dtypes(include=[np.number]).columns
            feature_cols = [col for col in numeric_cols if col != 'class']
            
            for col in feature_cols:
                try:
                    corr = df_preprocessed[col].corr(df_preprocessed['class'])
                    if not pd.isna(corr):
                        correlations[col] = round(corr, 3)
                except:
                    correlations[col] = 0.0
        
        # Time series data (simulate time series from sensor data)
        time_series_data = {}
        numeric_cols = df_preprocessed.select_dtypes(include=[np.number]).columns
        feature_cols = [col for col in numeric_cols if col != 'class']
        
        # Take first 24 samples for time series visualization
        sample_size = min(24, len(df_preprocessed))
        for col in feature_cols[:8]:  # Limit to first 8 sensors
            try:
                values = df_preprocessed[col].head(sample_size).tolist()
                time_series_data[col] = values
            except:
                time_series_data[col] = []
        
        # Sensor statistics
        sensor_stats = {}
        for col in feature_cols:
            try:
                sensor_stats[col] = {
                    'mean': round(float(df_preprocessed[col].mean()), 3),
                    'std': round(float(df_preprocessed[col].std()), 3),
                    'min': round(float(df_preprocessed[col].min()), 3),
                    'max': round(float(df_preprocessed[col].max()), 3)
                }
            except:
                sensor_stats[col] = {'mean': 0, 'std': 0, 'min': 0, 'max': 0}
        
        return jsonify(safe_jsonify({
            'classDistribution': class_distribution,
            'correlations': correlations,
            'timeSeriesData': time_series_data,
            'sensorStats': sensor_stats,
            'totalSamples': len(df_preprocessed),
            'totalFeatures': len(feature_cols)
        }))
        
    except Exception as e:
        logger.error(f"Error getting visualization data: {str(e)}")
        return jsonify({'error': f'Error getting visualization data: {str(e)}'}), 500

@app.route('/api/sensor-time-series', methods=['GET'])
def get_sensor_time_series():
    """Get time series data for specific sensors"""
    try:
        temp_files = [f for f in os.listdir(tempfile.gettempdir()) if f.endswith('.csv')]
        if not temp_files:
            return jsonify({'error': 'No data file found'}), 404
        
        latest_file = max(temp_files, key=lambda x: os.path.getctime(os.path.join(tempfile.gettempdir(), x)))
        file_path = os.path.join(tempfile.gettempdir(), latest_file)
        
        df = pd.read_csv(file_path)
        
        # Preprocess data
        df_preprocessed = preprocess_data(df)
        
        # Get numeric columns (sensors)
        numeric_cols = df_preprocessed.select_dtypes(include=[np.number]).columns
        feature_cols = [col for col in numeric_cols if col != 'class']
        
        # Limit to first 50 samples for better visualization
        sample_size = min(50, len(df_preprocessed))
        df_sample = df_preprocessed.head(sample_size)
        
        time_series = {}
        for col in feature_cols[:10]:  # Limit to first 10 sensors
            try:
                values = df_sample[col].tolist()
                time_series[col] = {
                    'values': values,
                    'mean': round(float(df_sample[col].mean()), 3),
                    'std': round(float(df_sample[col].std()), 3)
                }
            except:
                time_series[col] = {'values': [], 'mean': 0, 'std': 0}
        
        return jsonify(safe_jsonify({
            'timeSeries': time_series,
            'sampleSize': sample_size,
            'sensors': list(time_series.keys())
        }))
        
    except Exception as e:
        logger.error(f"Error getting sensor time series: {str(e)}")
        return jsonify({'error': f'Error getting sensor time series: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 