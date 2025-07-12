import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface StatusMessageProps {
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  onClose: () => void;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 mb-6 ${getStyles()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="text-current hover:opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default StatusMessage;