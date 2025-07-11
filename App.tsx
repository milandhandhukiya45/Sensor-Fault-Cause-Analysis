import React, { useState, useRef } from 'react';
import { Upload, BarChart3, TrendingUp, AlertTriangle, CheckCircle, FileText, Brain, Target } from 'lucide-react';
import DataUpload from './components/DataUpload';
import DataAnalysis from './components/DataAnalysis';
import ModelResults from './components/ModelResults';
import RootCauseAnalysis from './components/RootCauseAnalysis';
import { AnalysisData } from './types/analysis';

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const steps = [
    { id: 0, title: 'Data Upload', icon: Upload, description: 'Upload sensor data CSV file' },
    { id: 1, title: 'Data Analysis', icon: BarChart3, description: 'Explore and visualize data' },
    { id: 2, title: 'Model Results', icon: Target, description: 'Fault prediction results' },
    { id: 3, title: 'Root Cause Analysis', icon: Brain, description: 'Identify fault causes' }
  ];

  const handleDataProcessed = (data: AnalysisData) => {
    setAnalysisData(data);
    setCurrentStep(1);
  };

  const handleAnalysisComplete = () => {
    setCurrentStep(2);
  };

  const handleModelComplete = () => {
    setCurrentStep(3);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <DataUpload 
            onDataProcessed={handleDataProcessed}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        );
      case 1:
        return (
          <DataAnalysis 
            data={analysisData}
            onAnalysisComplete={handleAnalysisComplete}
          />
        );
      case 2:
        return (
          <ModelResults 
            data={analysisData}
            onModelComplete={handleModelComplete}
          />
        );
      case 3:
        return (
          <RootCauseAnalysis 
            data={analysisData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Air Pressure System</h1>
                <p className="text-sm text-gray-600">Sensor Fault Prediction in Scania Trucks</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4 inline mr-1" />
                Production Ready
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200
                      ${isActive ? 'bg-blue-600 border-blue-600 text-white' : 
                        isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                        'bg-gray-100 border-gray-300 text-gray-400'}
                    `}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-2 text-center">
                      <p className={`text-sm font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      h-px w-32 mx-4 transition-all duration-200
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm">
          {renderCurrentStep()}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Air Pressure System Analysis. Advanced fault prediction and root cause analysis for Scania trucks.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;