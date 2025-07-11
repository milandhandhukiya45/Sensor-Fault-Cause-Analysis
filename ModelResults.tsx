import React, { useState } from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Brain, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { AnalysisData } from '../types/analysis';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ModelResultsProps {
  data: AnalysisData | null;
  onModelComplete: () => void;
}

const ModelResults: React.FC<ModelResultsProps> = ({ data, onModelComplete }) => {
  const [currentView, setCurrentView] = useState<'metrics' | 'predictions' | 'confusion'>('metrics');
  
  if (!data) return null;

  const confusionMatrixData = {
    labels: ['Predicted Normal', 'Predicted Faulty'],
    datasets: [
      {
        label: 'Actual Normal',
        data: [data.confusionMatrix[0][0], data.confusionMatrix[0][1]],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Actual Faulty',
        data: [data.confusionMatrix[1][0], data.confusionMatrix[1][1]],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Confusion Matrix',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const MetricCard = ({ title, value, subtitle, icon: Icon, color }: any) => (
    <div className={`bg-gradient-to-r ${color} rounded-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-xs opacity-80 mt-1">{subtitle}</p>}
        </div>
        <Icon className="h-8 w-8 opacity-80" />
      </div>
    </div>
  );

  const ViewContent = () => {
    switch (currentView) {
      case 'metrics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Model Accuracy"
                value={`${(data.modelMetrics.accuracy * 100).toFixed(1)}%`}
                subtitle="Overall correctness"
                icon={Target}
                color="from-blue-500 to-blue-600"
              />
              <MetricCard
                title="Precision"
                value={`${(data.modelMetrics.precision * 100).toFixed(1)}%`}
                subtitle="Fault detection accuracy"
                icon={CheckCircle}
                color="from-green-500 to-green-600"
              />
              <MetricCard
                title="Recall"
                value={`${(data.modelMetrics.recall * 100).toFixed(1)}%`}
                subtitle="Fault detection rate"
                icon={AlertTriangle}
                color="from-yellow-500 to-yellow-600"
              />
              <MetricCard
                title="F1 Score"
                value={`${(data.modelMetrics.f1Score * 100).toFixed(1)}%`}
                subtitle="Balanced performance"
                icon={TrendingUp}
                color="from-purple-500 to-purple-600"
              />
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-blue-900">ROC AUC Score</p>
                    <p className="text-sm text-blue-700">Area Under ROC Curve</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {(data.modelMetrics.rocAuc * 100).toFixed(1)}%
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">True Positives</h4>
                    <p className="text-2xl font-bold text-green-600">{data.confusionMatrix[1][1]}</p>
                    <p className="text-sm text-gray-600">Correctly identified faults</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">False Positives</h4>
                    <p className="text-2xl font-bold text-red-600">{data.confusionMatrix[0][1]}</p>
                    <p className="text-sm text-gray-600">Incorrectly flagged as faults</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'predictions':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Predictions</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Record ID</th>
                      <th className="text-left py-2">Actual</th>
                      <th className="text-left py-2">Predicted</th>
                      <th className="text-left py-2">Probability</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.predictions.actual.slice(0, 10).map((actual, index) => {
                      const predicted = data.predictions.predicted[index];
                      const probability = data.predictions.probabilities[index];
                      const isCorrect = actual === predicted;
                      
                      return (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 font-mono">{index + 1}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              actual === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {actual === 1 ? 'Faulty' : 'Normal'}
                            </span>
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              predicted === 1 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {predicted === 1 ? 'Faulty' : 'Normal'}
                            </span>
                          </td>
                          <td className="py-2 font-mono">{(probability * 100).toFixed(1)}%</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      
      case 'confusion':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Bar data={confusionMatrixData} options={chartOptions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confusion Matrix Values</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-green-800">True Negatives (TN)</span>
                    <span className="text-lg font-bold text-green-600">{data.confusionMatrix[0][0]}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-red-800">False Positives (FP)</span>
                    <span className="text-lg font-bold text-red-600">{data.confusionMatrix[0][1]}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-yellow-800">False Negatives (FN)</span>
                    <span className="text-lg font-bold text-yellow-600">{data.confusionMatrix[1][0]}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-800">True Positives (TP)</span>
                    <span className="text-lg font-bold text-blue-600">{data.confusionMatrix[1][1]}</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Interpretation</h3>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Precision Focus</p>
                    <p className="text-gray-600">Model minimizes false alarms while maintaining good fault detection</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Recall Balance</p>
                    <p className="text-gray-600">Catches most actual faults with acceptable miss rate</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">Production Ready</p>
                    <p className="text-gray-600">Model performance meets industrial standards for fault detection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Model Performance Results</h2>
          <p className="text-lg text-gray-600">
            Random Forest classifier performance on sensor fault prediction
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'metrics', label: 'Performance Metrics', icon: TrendingUp },
            { id: 'predictions', label: 'Predictions', icon: Target },
            { id: 'confusion', label: 'Confusion Matrix', icon: BarChart3 },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all
                ${currentView === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <ViewContent />

        {/* Continue Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={onModelComplete}
            className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <span>Continue to Root Cause Analysis</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelResults;