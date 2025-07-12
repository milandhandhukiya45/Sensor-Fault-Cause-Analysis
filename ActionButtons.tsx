import React from 'react';
import { Activity, AlertTriangle, Search, Loader2 } from 'lucide-react';

interface ActionButtonsProps {
  onDetectAnomalies: () => void;
  onClassifyFaults: () => void;
  onIdentifyRootCause: () => void;
  isProcessing: boolean;
  hasFile: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onDetectAnomalies,
  onClassifyFaults,
  onIdentifyRootCause,
  isProcessing,
  hasFile
}) => {
  const buttonClass = `
    flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
    ${hasFile && !isProcessing
      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }
  `;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Analysis Actions</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={onDetectAnomalies}
          disabled={!hasFile || isProcessing}
          className={buttonClass}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Activity className="h-5 w-5" />
          )}
          <span>Detect Anomalies</span>
        </button>

        <button
          onClick={onClassifyFaults}
          disabled={!hasFile || isProcessing}
          className={buttonClass}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span>Classify Faults</span>
        </button>

        <button
          onClick={onIdentifyRootCause}
          disabled={!hasFile || isProcessing}
          className={buttonClass}
        >
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Search className="h-5 w-5" />
          )}
          <span>Identify Root Cause</span>
        </button>
      </div>
      
      {!hasFile && (
        <p className="text-sm text-gray-500 mt-3">
          Please upload a CSV file to enable analysis actions
        </p>
      )}
    </div>
  );
};

export default ActionButtons;