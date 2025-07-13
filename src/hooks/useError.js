import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

export const useError = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  const handleError = useCallback((error, customMessage) => {
    console.error('Error:', error);
    
    let errorMessage = customMessage;
    
    if (!errorMessage) {
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'An unexpected error occurred';
      }
    }

    setError(errorMessage);
    showError(errorMessage);
  }, [showError]);

  const handleSuccess = useCallback((message = 'Operation completed successfully') => {
    showSuccess(message);
    setError(null);
  }, [showSuccess]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(async (asyncFn, successMessage, errorMessage) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await asyncFn();
      
      if (successMessage) {
        handleSuccess(successMessage);
      }
      
      return result;
    } catch (error) {
      handleError(error, errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleSuccess]);

  return {
    error,
    isLoading,
    handleError,
    handleSuccess,
    clearError,
    withErrorHandling,
  };
};

export default useError;
