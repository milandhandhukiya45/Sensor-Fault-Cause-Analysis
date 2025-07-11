from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from ml_logic import analyze_sensor_data

app = Flask(__name__)
CORS(app)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({'message': 'Hello from Flask!'})

@app.route('/api/root_cause', methods=['POST'])
def root_cause():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    file = request.files['file']
    file_path = 'temp_upload.csv'
    file.save(file_path)
    result = analyze_sensor_data(file_path)
    os.remove(file_path)
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
