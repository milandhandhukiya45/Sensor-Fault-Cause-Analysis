import React, { useState, useRef } from 'react';
import { Upload, Activity, AlertTriangle, Search, CheckCircle, XCircle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import ActionButtons from './components/ActionButtons';
import StatusMessage from './components/StatusMessage';
import VisualizationPanel from './components/VisualizationPanel';
import FeatureImportance from './components/FeatureImportance';
import ResultsPanel from './components/ResultsPanel';

function App() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'warning' | 'error', message: string } | null>(null);
  const [results, setResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'charts' | 'importance' | 'results'>('charts');

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setStatus({ type: 'success', message: `File "${file.name}" uploaded successfully` });
    setResults(null);
  };

  const handleDetectAnomalies = async () => {
    if (!uploadedFile) {
      setStatus({ type: 'error', message: 'Please upload a CSV file first' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Detecting anomalies using Z-Score analysis...' });

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:5000/api/detect-anomalies', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to detect anomalies');
      }

      const result = await response.json();
      setResults(result);
      setStatus({ type: 'success', message: 'Anomaly detection completed successfully' });
      setActiveTab('results');
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      setStatus({ type: 'error', message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClassifyFaults = async () => {
    if (!uploadedFile) {
      setStatus({ type: 'error', message: 'Please upload a CSV file first' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Classifying faults using Random Forest...' });

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:5000/api/classify-faults', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to classify faults');
      }

      const result = await response.json();
      setResults(result);
      setStatus({ type: 'success', message: 'Fault classification completed successfully' });
      setActiveTab('results');
    } catch (error) {
      console.error('Error classifying faults:', error);
      setStatus({ type: 'error', message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIdentifyRootCause = async () => {
    if (!uploadedFile) {
      setStatus({ type: 'error', message: 'Please upload a CSV file first' });
      return;
    }

    setIsProcessing(true);
    setStatus({ type: 'info', message: 'Identifying root cause sensors using feature importance...' });

    try {
      // First, we need to train the model by running classification
      const formData = new FormData();
      formData.append('file', uploadedFile);

      // Run classification first to train the model
      const classifyResponse = await fetch('http://localhost:5000/api/classify-faults', {
        method: 'POST',
        body: formData,
      });

      if (!classifyResponse.ok) {
        const errorData = await classifyResponse.json();
        throw new Error(errorData.error || 'Failed to train model for root cause analysis');
      }

      // Now get root cause analysis
      const rootCauseResponse = await fetch('http://localhost:5000/api/root-cause', {
        method: 'POST',
      });

      if (!rootCauseResponse.ok) {
        const errorData = await rootCauseResponse.json();
        throw new Error(errorData.error || 'Failed to identify root cause');
      }

      const result = await rootCauseResponse.json();
      setResults(result);
      setStatus({ type: 'success', message: 'Root cause analysis completed successfully' });
      setActiveTab('importance');
    } catch (error) {
      console.error('Error identifying root cause:', error);
      setStatus({ type: 'error', message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins',sans-serif]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scania Truck Fault Detection System</h1>
              <p className="text-sm text-gray-600">Air Pressure System Anomaly Detection & Classification</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Message */}
        {status && (
          <StatusMessage 
            type={status.type} 
            message={status.message} 
            onClose={() => setStatus(null)}
          />
        )}

        {/* File Upload */}
        <div className="mb-8">
          <FileUpload onFileUpload={handleFileUpload} />
        </div>

        {/* Action Buttons */}
        <ActionButtons
          onDetectAnomalies={handleDetectAnomalies}
          onClassifyFaults={handleClassifyFaults}
          onIdentifyRootCause={handleIdentifyRootCause}
          isProcessing={isProcessing}
          hasFile={!!uploadedFile}
        />

        {/* Tabs */}
        <div className="mt-8 mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('charts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'charts'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Data Visualizations
              </button>
              <button
                onClick={() => setActiveTab('importance')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'importance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Feature Importance
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analysis Results
              </button>
            </nav>
          </div>
        </div>

        {/* Content Panels */}
        {activeTab === 'charts' && <VisualizationPanel />}
        {activeTab === 'importance' && <FeatureImportance results={results} />}
        {activeTab === 'results' && <ResultsPanel results={results} />}
      </div>
    </div>
  );
}

export default App;