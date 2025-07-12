import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { Loader2, AlertCircle } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface VisualizationData {
  classDistribution: Record<string, number>;
  correlations: Record<string, number>;
  timeSeriesData: Record<string, number[]>;
  sensorStats: Record<string, any>;
  totalSamples: number;
  totalFeatures: number;
}

const VisualizationPanel: React.FC = () => {
  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVisualizationData();
  }, []);

  const fetchVisualizationData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/visualization-data');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch visualization data');
      }
      
      const visualizationData = await response.json();
      setData(visualizationData);
    } catch (err) {
      console.error('Error fetching visualization data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load visualization data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading visualization data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchVisualizationData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No data available. Please upload a CSV file first.</p>
        </div>
      </div>
    );
  }

  // Prepare class distribution data
  const classDistributionData = {
    labels: Object.keys(data.classDistribution),
    datasets: [
      {
        label: 'Number of Samples',
        data: Object.values(data.classDistribution),
        backgroundColor: [
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
        ],
        borderColor: [
          '#059669',
          '#D97706',
          '#DC2626',
          '#7C3AED',
          '#0891B2',
          '#65A30D',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare correlation data
  const correlationEntries = Object.entries(data.correlations)
    .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 10); // Top 10 correlations

  const correlationData = {
    labels: correlationEntries.map(([sensor]) => sensor),
    datasets: [
      {
        label: 'Correlation with Target',
        data: correlationEntries.map(([, corr]) => Math.abs(corr)),
        backgroundColor: '#8B5CF6',
        borderColor: '#7C3AED',
        borderWidth: 1,
      },
    ],
  };

  // Prepare time series data
  const timeSeriesEntries = Object.entries(data.timeSeriesData).slice(0, 5); // Top 5 sensors
  const timeLabels = Array.from({ length: Math.max(...timeSeriesEntries.map(([, values]) => values.length)) }, (_, i) => `Sample ${i + 1}`);
  
  const timeSeriesData = {
    labels: timeLabels,
    datasets: timeSeriesEntries.map(([sensor, values], index) => {
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
      return {
        label: `${sensor} (${data.sensorStats[sensor]?.mean || 0})`,
        data: values,
        borderColor: colors[index % colors.length],
        backgroundColor: `${colors[index % colors.length]}20`,
        tension: 0.4,
      };
    }),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-500">Total Samples</h4>
          <p className="text-2xl font-bold text-gray-900">{data.totalSamples.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-500">Total Features</h4>
          <p className="text-2xl font-bold text-gray-900">{data.totalFeatures}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h4 className="text-sm font-medium text-gray-500">Classes</h4>
          <p className="text-2xl font-bold text-gray-900">{Object.keys(data.classDistribution).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Distribution</h3>
          <div className="h-64">
            <Bar data={classDistributionData} options={chartOptions} />
          </div>
        </div>

        {/* Feature Correlation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Feature Correlations</h3>
          <div className="h-64">
            <Bar data={correlationData} options={chartOptions} />
          </div>
        </div>

        {/* Sensor Behavior */}
        <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Behavior Over Time</h3>
          <div className="h-64">
            <Line data={timeSeriesData} options={lineChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizationPanel;