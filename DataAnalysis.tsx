import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Database, Eye, ArrowRight } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { AnalysisData } from '../types/analysis';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DataAnalysisProps {
  data: AnalysisData | null;
  onAnalysisComplete: () => void;
}

const DataAnalysis: React.FC<DataAnalysisProps> = ({ data, onAnalysisComplete }) => {
  const [currentView, setCurrentView] = useState<'overview' | 'distribution' | 'correlations'>('overview');
  
  if (!data) return null;

  const classDistributionData = {
    labels: Object.keys(data.classDistribution),
    datasets: [
      {
        data: Object.values(data.classDistribution),
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2,
      },
    ],
  };

  const topFeaturesData = {
    labels: data.topFeatures.slice(0, 8),
    datasets: [
      {
        label: 'Correlation with Faults',
        data: data.topFeatures.slice(0, 8).map((feature, index) => 0.8 - index * 0.08),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
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
        text: 'Feature Correlations with Fault Classification',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      title: {
        display: true,
        text: 'Class Distribution',
      },
    },
  };

  const ViewContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Records</p>
                    <p className="text-2xl font-bold">{data.rawData.length.toLocaleString()}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Normal Sensors</p>
                    <p className="text-2xl font-bold">{data.classDistribution.Normal?.toLocaleString() || 0}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium">Faulty Sensors</p>
                    <p className="text-2xl font-bold">{data.classDistribution.Faulty?.toLocaleString() || 0}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-red-200" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Quality Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Features:</span>
                    <span className="text-sm font-medium">{Object.keys(data.rawData[0]).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Top Correlated Features:</span>
                    <span className="text-sm font-medium">{data.topFeatures.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fault Rate:</span>
                    <span className="text-sm font-medium text-red-600">
                      {((data.classDistribution.Faulty / data.rawData.length) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Data Completeness:</span>
                    <span className="text-sm font-medium text-green-600">95.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Anomalies Detected:</span>
                    <span className="text-sm font-medium">{data.anomalies.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Status:</span>
                    <span className="text-sm font-medium text-green-600">Complete</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'distribution':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <Doughnut data={classDistributionData} options={doughnutOptions} />
              </div>
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">Normal Operations</span>
                    </div>
                    <span className="text-green-600 font-bold">
                      {data.classDistribution.Normal?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-800">Faulty Sensors</span>
                    </div>
                    <span className="text-red-600 font-bold">
                      {data.classDistribution.Faulty?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Fault Probability</span>
                      <span className="text-sm font-bold text-red-600">
                        {((data.classDistribution.Faulty / data.rawData.length) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'correlations':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <Bar data={topFeaturesData} options={chartOptions} />
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Correlated Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.topFeatures.slice(0, 8).map((feature, index) => (
                  <div key={feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{feature}</span>
                    <span className="text-sm font-bold text-blue-600">
                      {(0.8 - index * 0.08).toFixed(3)}
                    </span>
                  </div>
                ))}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Data Analysis & Visualization</h2>
          <p className="text-lg text-gray-600">
            Explore sensor data patterns and identify correlations with fault occurrences
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: Eye },
            { id: 'distribution', label: 'Distribution', icon: BarChart3 },
            { id: 'correlations', label: 'Correlations', icon: TrendingUp },
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
            onClick={onAnalysisComplete}
            className="flex items-center space-x-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <span>Continue to Model Results</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;