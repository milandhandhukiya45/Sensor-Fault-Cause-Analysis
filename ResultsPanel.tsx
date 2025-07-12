import React from 'react';
import { Activity, AlertTriangle, CheckCircle, TrendingUp, BarChart3 } from 'lucide-react';

interface ResultsPanelProps {
  results: any;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ results }) => {
  if (!results) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Results</h3>
        <p className="text-gray-600">
          Run an analysis to see results here. Upload a CSV file and click one of the analysis buttons.
        </p>
      </div>
    );
  }

  if (results.type === 'anomalies') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Anomaly Detection Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Total Samples</p>
                  <p className="text-2xl font-bold text-blue-900">{results.data.totalSamples.toLocaleString()}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600">Anomalies Found</p>
                  <p className="text-2xl font-bold text-red-900">{results.data.anomalies.toLocaleString()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Anomaly Rate</p>
                  <p className="text-2xl font-bold text-orange-900">{results.data.anomalyRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600">Critical Anomalies</p>
                  <p className="text-2xl font-bold text-yellow-900">{results.data.criticalAnomalies.toLocaleString()}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Anomaly Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-red-600">Critical Anomalies:</span>
                <span className="font-medium">{results.data.criticalAnomalies.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-600">Major Anomalies:</span>
                <span className="font-medium">{results.data.majorAnomalies.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-yellow-600">Minor Anomalies:</span>
                <span className="font-medium">{results.data.minorAnomalies.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.type === 'classification') {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Fault Classification Results</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Accuracy</p>
                  <p className="text-2xl font-bold text-green-900">{results.data.accuracy}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Precision</p>
                  <p className="text-2xl font-bold text-blue-900">{results.data.precision}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Recall</p>
                  <p className="text-2xl font-bold text-purple-900">{results.data.recall}%</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600">F1-Score</p>
                  <p className="text-2xl font-bold text-indigo-900">{results.data.f1Score}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Classification Distribution</h4>
            <div className="space-y-2">
              {Object.entries(results.data.classes).map(([className, count]) => (
                <div key={className} className="flex justify-between">
                  <span className={`${className === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                    {className}:
                  </span>
                  <span className="font-medium">{(count as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Complete</h3>
      <p className="text-gray-600">
        Root cause analysis has been completed. Check the Feature Importance tab to see the results.
      </p>
    </div>
  );
};

export default ResultsPanel;