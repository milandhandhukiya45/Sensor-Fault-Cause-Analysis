import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sample_sensor_data(num_samples=60000):
    """
    Generate sample sensor data for Scania truck air pressure system
    """
    np.random.seed(42)
    
    # Define sensor names (following the pattern from the frontend)
    sensor_names = [
        'aa_000', 'ab_001', 'ac_002', 'ad_003', 'ae_004', 
        'af_005', 'ag_005', 'ag_006', 'ah_007', 'ai_008',
        'aj_009', 'ak_010', 'al_011', 'am_012', 'an_013', 'ao_014'
    ]
    
    # Generate normal operation data (80% of samples)
    normal_samples = int(num_samples * 0.8)
    
    # Normal operation ranges for each sensor
    normal_ranges = {
        'aa_000': (2.0, 2.5),    # Air Pressure Sensor A (bar)
        'ab_001': (2.1, 2.6),    # Air Pressure Sensor B (bar)
        'ac_002': (1.8, 2.3),    # Air Compressor Sensor (bar)
        'ad_003': (2.2, 2.7),    # Air Tank Sensor (bar)
        'ae_004': (1.9, 2.4),    # Air Filter Sensor (bar)
        'af_005': (2.0, 2.5),    # Air Valve Sensor (bar)
        'ag_005': (15.0, 25.0),  # Air Flow Sensor G (L/min)
        'ag_006': (1.9, 2.4),    # Air Regulator Sensor (bar)
        'ah_007': (20.0, 30.0),  # Air Heater Sensor (°C)
        'ai_008': (18.0, 28.0),  # Air Intake Sensor (°C)
        'aj_009': (2.1, 2.6),    # Air Junction Sensor (bar)
        'ak_010': (1.8, 2.3),    # Air Kit Sensor (bar)
        'al_011': (2.0, 2.5),    # Air Line Sensor (bar)
        'am_012': (2.2, 2.7),    # Air Manifold Sensor (bar)
        'an_013': (1.9, 2.4),    # Air Nozzle Sensor (bar)
        'ao_014': (2.0, 2.5)     # Air Outlet Sensor (bar)
    }
    
    # Generate normal data
    normal_data = {}
    for sensor in sensor_names:
        min_val, max_val = normal_ranges[sensor]
        normal_data[sensor] = np.random.uniform(min_val, max_val, normal_samples)
    
    # Generate fault data (20% of samples)
    fault_samples = num_samples - normal_samples
    
    # Fault patterns
    fault_patterns = {
        'Fault Class 1': {  # High pressure fault
            'aa_000': (3.0, 4.0),
            'ab_001': (3.1, 4.1),
            'ac_002': (2.8, 3.8),
            'ad_003': (3.2, 4.2),
            'ae_004': (2.9, 3.9),
            'af_005': (3.0, 4.0),
            'ag_005': (30.0, 40.0),
            'ag_006': (2.9, 3.9),
            'ah_007': (35.0, 45.0),
            'ai_008': (33.0, 43.0),
            'aj_009': (3.1, 4.1),
            'ak_010': (2.8, 3.8),
            'al_011': (3.0, 4.0),
            'am_012': (3.2, 4.2),
            'an_013': (2.9, 3.9),
            'ao_014': (3.0, 4.0)
        },
        'Fault Class 2': {  # Low pressure fault
            'aa_000': (0.5, 1.5),
            'ab_001': (0.6, 1.6),
            'ac_002': (0.3, 1.3),
            'ad_003': (0.7, 1.7),
            'ae_004': (0.4, 1.4),
            'af_005': (0.5, 1.5),
            'ag_005': (5.0, 15.0),
            'ag_006': (0.4, 1.4),
            'ah_007': (10.0, 20.0),
            'ai_008': (8.0, 18.0),
            'aj_009': (0.6, 1.6),
            'ak_010': (0.3, 1.3),
            'al_011': (0.5, 1.5),
            'am_012': (0.7, 1.7),
            'an_013': (0.4, 1.4),
            'ao_014': (0.5, 1.5)
        },
        'Fault Class 3': {  # Sensor malfunction
            'aa_000': (0.0, 0.1),
            'ab_001': (0.0, 0.1),
            'ac_002': (0.0, 0.1),
            'ad_003': (0.0, 0.1),
            'ae_004': (0.0, 0.1),
            'af_005': (0.0, 0.1),
            'ag_005': (0.0, 1.0),
            'ag_006': (0.0, 0.1),
            'ah_007': (0.0, 5.0),
            'ai_008': (0.0, 5.0),
            'aj_009': (0.0, 0.1),
            'ak_010': (0.0, 0.1),
            'al_011': (0.0, 0.1),
            'am_012': (0.0, 0.1),
            'an_013': (0.0, 0.1),
            'ao_014': (0.0, 0.1)
        }
    }
    
    # Distribute fault samples among fault classes
    fault_class_1_samples = int(fault_samples * 0.4)  # 40% of faults
    fault_class_2_samples = int(fault_samples * 0.35)  # 35% of faults
    fault_class_3_samples = fault_samples - fault_class_1_samples - fault_class_2_samples  # 25% of faults
    
    # Generate fault data
    fault_data = {}
    for sensor in sensor_names:
        fault_data[sensor] = []
        
        # Fault Class 1
        min_val, max_val = fault_patterns['Fault Class 1'][sensor]
        fault_data[sensor].extend(np.random.uniform(min_val, max_val, fault_class_1_samples))
        
        # Fault Class 2
        min_val, max_val = fault_patterns['Fault Class 2'][sensor]
        fault_data[sensor].extend(np.random.uniform(min_val, max_val, fault_class_2_samples))
        
        # Fault Class 3
        min_val, max_val = fault_patterns['Fault Class 3'][sensor]
        fault_data[sensor].extend(np.random.uniform(min_val, max_val, fault_class_3_samples))
    
    # Combine normal and fault data
    all_data = {}
    for sensor in sensor_names:
        all_data[sensor] = np.concatenate([normal_data[sensor], fault_data[sensor]])
    
    # Create class labels
    normal_labels = ['Normal'] * normal_samples
    fault_labels = ['Fault Class 1'] * fault_class_1_samples + \
                   ['Fault Class 2'] * fault_class_2_samples + \
                   ['Fault Class 3'] * fault_class_3_samples
    
    all_labels = normal_labels + fault_labels
    
    # Create DataFrame
    df = pd.DataFrame(all_data)
    df['class'] = all_labels
    
    # Shuffle the data
    df = df.sample(frac=1, random_state=42).reset_index(drop=True)
    
    return df

def save_sample_data(filename='sample_sensor_data.csv', num_samples=60000):
    """Generate and save sample data to CSV file"""
    print(f"Generating {num_samples} samples of sensor data...")
    df = generate_sample_sensor_data(num_samples)
    
    # Save to CSV
    df.to_csv(filename, index=False)
    print(f"Sample data saved to {filename}")
    
    # Print statistics
    print("\nData Statistics:")
    print(f"Total samples: {len(df)}")
    print(f"Features: {len(df.columns) - 1}")
    print("\nClass distribution:")
    print(df['class'].value_counts())
    
    return df

if __name__ == "__main__":
    # Generate sample data
    df = save_sample_data()
    
    # Print some sample rows
    print("\nSample data (first 5 rows):")
    print(df.head())
    
    print("\nSample data (last 5 rows):")
    print(df.tail()) 