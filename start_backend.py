#!/usr/bin/env python3
"""
Startup script for the Sensor Fault Detection Backend
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"✅ Python version: {sys.version.split()[0]}")

def install_requirements():
    """Install required packages"""
    backend_dir = Path("backend")
    requirements_file = backend_dir / "requirements.txt"
    
    if not requirements_file.exists():
        print("❌ Error: requirements.txt not found in backend directory")
        sys.exit(1)
    
    print("📦 Installing Python dependencies...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ], check=True)
        print("✅ Dependencies installed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        sys.exit(1)

def generate_sample_data():
    """Generate sample data if it doesn't exist"""
    sample_file = Path("backend/sample_sensor_data.csv")
    
    if not sample_file.exists():
        print("📊 Generating sample sensor data...")
        try:
            subprocess.run([
                sys.executable, "backend/generate_sample_data.py"
            ], check=True)
            print("✅ Sample data generated successfully")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error generating sample data: {e}")
            sys.exit(1)
    else:
        print("✅ Sample data already exists")

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting Flask backend server...")
    print("📍 Backend will be available at: http://localhost:5000")
    print("📋 API Documentation:")
    print("   - Health check: GET /api/health")
    print("   - Upload file: POST /api/upload")
    print("   - Detect anomalies: POST /api/detect-anomalies")
    print("   - Classify faults: POST /api/classify-faults")
    print("   - Root cause analysis: POST /api/root-cause")
    print("\n🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    try:
        # Change to backend directory and start Flask app
        os.chdir("backend")
        subprocess.run([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

def main():
    """Main function"""
    print("🔧 Sensor Fault Detection Backend Setup")
    print("=" * 50)
    
    # Check Python version
    check_python_version()
    
    # Install requirements
    install_requirements()
    
    # Generate sample data
    generate_sample_data()
    
    # Start backend
    start_backend()

if __name__ == "__main__":
    main() 