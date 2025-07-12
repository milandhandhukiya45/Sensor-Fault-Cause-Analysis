#!/usr/bin/env python3
"""
Test script for the backend API
"""
import requests
import json
import time
from generate_sample_data import save_sample_data
import os

def test_backend():
    """Test the backend API endpoints"""
    base_url = "http://localhost:5000"
    
    print("🚀 Testing Scania Truck Fault Detection Backend")
    print("=" * 50)
    
    # Test 1: Health check
    print("\n1. Testing health check...")
    try:
        response = requests.get(f"{base_url}/api/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # Test 2: Generate sample data
    print("\n2. Generating sample data...")
    try:
        df = save_sample_data('test_data.csv', num_samples=1000)
        print(f"✅ Generated {len(df)} samples")
    except Exception as e:
        print(f"❌ Data generation error: {e}")
        return False
    
    # Test 3: Upload file
    print("\n3. Testing file upload...")
    try:
        with open('test_data.csv', 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{base_url}/api/upload", files=files)
        
        if response.status_code == 200:
            print("✅ File upload successful")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ File upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ File upload error: {e}")
        return False
    
    # Test 4: Get visualization data
    print("\n4. Testing visualization data...")
    try:
        response = requests.get(f"{base_url}/api/visualization-data")
        if response.status_code == 200:
            data = response.json()
            print("✅ Visualization data retrieved")
            print(f"   Total samples: {data.get('totalSamples', 'N/A')}")
            print(f"   Total features: {data.get('totalFeatures', 'N/A')}")
            print(f"   Classes: {list(data.get('classDistribution', {}).keys())}")
        else:
            print(f"❌ Visualization data failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Visualization data error: {e}")
        return False
    
    # Test 5: Anomaly detection
    print("\n5. Testing anomaly detection...")
    try:
        response = requests.post(f"{base_url}/api/detect-anomalies")
        if response.status_code == 200:
            data = response.json()
            print("✅ Anomaly detection successful")
            print(f"   Total samples: {data['data']['totalSamples']}")
            print(f"   Anomalies found: {data['data']['anomalies']}")
            print(f"   Anomaly rate: {data['data']['anomalyRate']}%")
        else:
            print(f"❌ Anomaly detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Anomaly detection error: {e}")
        return False
    
    # Test 6: Fault classification
    print("\n6. Testing fault classification...")
    try:
        response = requests.post(f"{base_url}/api/classify-faults")
        if response.status_code == 200:
            data = response.json()
            print("✅ Fault classification successful")
            print(f"   Accuracy: {data['data']['accuracy']}%")
            print(f"   Precision: {data['data']['precision']}%")
            print(f"   Recall: {data['data']['recall']}%")
            print(f"   F1-Score: {data['data']['f1Score']}%")
        else:
            print(f"❌ Fault classification failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Fault classification error: {e}")
        return False
    
    # Test 7: Root cause analysis
    print("\n7. Testing root cause analysis...")
    try:
        response = requests.post(f"{base_url}/api/root-cause")
        if response.status_code == 200:
            data = response.json()
            print("✅ Root cause analysis successful")
            print(f"   Top sensors: {len(data['data']['topSensors'])}")
            if data['data']['topSensors']:
                top_sensor = data['data']['topSensors'][0]
                print(f"   Most important: {top_sensor['name']} ({top_sensor['importance']:.3f})")
        else:
            print(f"❌ Root cause analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Root cause analysis error: {e}")
        return False
    
    # Cleanup
    print("\n8. Cleaning up...")
    try:
        if os.path.exists('test_data.csv'):
            os.remove('test_data.csv')
            print("✅ Test file cleaned up")
    except Exception as e:
        print(f"⚠️  Cleanup warning: {e}")
    
    print("\n🎉 All tests passed! Backend is working correctly.")
    return True

if __name__ == "__main__":
    success = test_backend()
    if not success:
        print("\n❌ Some tests failed. Please check the backend server.")
        exit(1) 