import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Allow fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = () => {
    const baseStyles = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 max-w-sm";
    
    if (!isVisible) {
      return `${baseStyles} opacity-0 translate-x-full`;
    }

    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-l-4 border-green-400 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-l-4 border-red-400 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-50 border-l-4 border-blue-400 text-blue-800`;
    }
  };

  const getIcon = () => {
    const iconClass = "h-5 w-5 mr-3 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon className={`${iconClass} text-green-400`} />;
      case 'error':
        return <XCircleIcon className={`${iconClass} text-red-400`} />;
      case 'warning':
        return <ExclamationTriangleIcon className={`${iconClass} text-yellow-400`} />;
      default:
        return <InformationCircleIcon className={`${iconClass} text-blue-400`} />;
    }
  };

  return (
    <div className={getToastStyles()}>
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
