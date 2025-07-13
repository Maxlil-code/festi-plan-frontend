import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

// Section 10.9: Error / Retry pattern for AI endpoints
export const useAIErrorHandler = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { showError } = useToast();

  const handleAIError = (error, retryFunction) => {
    console.error('AI Error:', error);
    
    // Check for 500 error or timeout (section 10.9)
    if (error.response?.status === 500 || error.code === 'ECONNABORTED') {
      showError('Service temporarily unavailable – please retry');
      return {
        showRetry: true,
        retry: async () => {
          setIsRetrying(true);
          try {
            await retryFunction();
          } finally {
            setIsRetrying(false);
          }
        }
      };
    }
    
    // Regular error handling
    const message = error.response?.data?.message || error.message || 'An error occurred';
    showError(message);
    
    return {
      showRetry: false,
      retry: null
    };
  };

  return {
    handleAIError,
    isRetrying
  };
};

export default useAIErrorHandler;
