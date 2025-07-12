import React from 'react';
import { TrendingUp, AlertCircle } from 'lucide-react';

interface FeatureImportanceProps {
  results: any;
}

const FeatureImportance: React.FC<FeatureImportanceProps> = ({ results }) => {
  const defaultFeatures = [
    { name: 'aa_000', importance: 0.156, description: 'Air Pressure Sensor A' },
    { name: 'ag_005', importance: 0.134, description: 'Air Flow Sensor G' },
    { name: 'ab_001', importance: 0.128, description: 'Air Pressure Sensor B' },
    { name: 'ac_002', importance: 0.115, description: 'Air Compressor Sensor' },
    { name: 'ad_003', importance: 0.098, description: 'Air Tank Sensor' },
    { name: 'ae_004', importance: 0.089, description: 'Air Filter Sensor' },
    { name: 'af_005', importance: 0.076, description: 'Air Valve Sensor' },
    { name: 'ag_006', importance: 0.065, description: 'Air Regulator Sensor' },
    { name: 'ah_007', importance: 0.054, description: 'Air Moisture Sensor' },
    { name: 'ai_008', importance: 0.043, description: 'Air Temperature Sensor' },
    { name: 'aj_009', importance: 0.032, description: 'Air Quality Sensor' },
    { name: 'ak_010', importance: 0.028, description: 'Air Vibration Sensor' },
  ];

  const features = results?.type === 'rootcause' ? results.data.topSensors : defaultFeatures;

  const getImportanceColor = (importance: number) => {
    if (importance > 0.12) return 'bg-red-500';
    if (importance > 0.08) return 'bg-orange-500';
    if (importance > 0.05) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getImportanceLabel = (importance: number) => {
    if (importance > 0.12) return 'Critical';
    if (importance > 0.08) return 'High';
    if (importance > 0.05) return 'Medium';
    return 'Low';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-2 mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Feature Importance (Root Cause Sensors)</h3>
      </div>

      {results?.type === 'rootcause' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-blue-800">
              Analysis completed. Top sensors ranked by fault prediction importance.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={feature.name} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-blue-600">#{index + 1}</span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getImportanceColor(feature.importance)}`}>
                    {getImportanceLabel(feature.importance)}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {(feature.importance * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getImportanceColor(feature.importance)}`}
                  style={{ width: `${feature.importance * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-medium text-yellow-800 mb-2">Interpretation Guide</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            <span className="text-yellow-700">Critical (&gt;12%): Immediate attention required</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
            <span className="text-yellow-700">High (8-12%): Monitor closely</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            <span className="text-yellow-700">Medium (5-8%): Regular maintenance</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            <span className="text-yellow-700">Low (&lt;5%): Normal operation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureImportance;