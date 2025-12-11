import { useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';

/**
 * Custom hook for handling API errors
 */
export const useApiError = () => {
  const { logout } = useAuthStore();

  const handleError = useCallback((error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      logout();
      return 'Session expired. Please login again.';
    }

    if (error.response?.status === 403) {
      return 'You do not have permission to perform this action.';
    }

    if (error.response?.status === 404) {
      return 'The requested resource was not found.';
    }

    if (error.response?.status === 422) {
      return error.response.data?.message || 'Invalid input. Please check your data.';
    }

    if (error.response?.status >= 500) {
      return 'Server error. Please try again later.';
    }

    return error.message || 'An unexpected error occurred.';
  }, [logout]);

  return { handleError };
};

/**
 * Custom hook for async operations with loading state
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [state, setState] = React.useState({
    status: 'idle',
    data: null,
    error: null,
  });

  const execute = React.useCallback(async () => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFunction();
      setState({ status: 'success', data: response, error: null });
      return response;
    } catch (error) {
      setState({ status: 'error', data: null, error });
      throw error;
    }
  }, [asyncFunction]);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, ...state };
};

import React from 'react';
