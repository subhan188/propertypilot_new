/**
 * Custom hook for making API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import { apiClient } from '@/services/apiClient';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  request: <R = T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    body?: any,
    options?: Record<string, any>
  ) => Promise<R | null>;
  get: <R = T>(endpoint: string, options?: Record<string, any>) => Promise<R | null>;
  post: <R = T>(endpoint: string, body?: any, options?: Record<string, any>) => Promise<R | null>;
  put: <R = T>(endpoint: string, body?: any, options?: Record<string, any>) => Promise<R | null>;
  delete: <R = T>(endpoint: string, options?: Record<string, any>) => Promise<R | null>;
  patch: <R = T>(endpoint: string, body?: any, options?: Record<string, any>) => Promise<R | null>;
  clear: () => void;
}

export function useApi<T = any>(initialData: T | null = null): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const request = useCallback(
    async <R = T>(
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
      endpoint: string,
      body?: any,
      options?: Record<string, any>
    ): Promise<R | null> => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        let result;

        switch (method) {
          case 'GET':
            result = await apiClient.get<R>(endpoint, options);
            break;
          case 'POST':
            result = await apiClient.post<R>(endpoint, body, options);
            break;
          case 'PUT':
            result = await apiClient.put<R>(endpoint, body, options);
            break;
          case 'DELETE':
            result = await apiClient.delete<R>(endpoint, options);
            break;
          case 'PATCH':
            result = await apiClient.patch<R>(endpoint, body, options);
            break;
          default:
            throw new Error(`Unsupported HTTP method: ${method}`);
        }

        if (result.error) {
          setState(prev => ({ ...prev, loading: false, error: result.error || 'Unknown error' }));
          return null;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          data: result.data as unknown as T,
        }));

        return result.data || null;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'An error occurred';
        setState(prev => ({ ...prev, loading: false, error }));
        return null;
      }
    },
    []
  );

  const get = useCallback(
    (endpoint: string, options?: Record<string, any>) =>
      request<T>('GET', endpoint, undefined, options),
    [request]
  );

  const post = useCallback(
    (endpoint: string, body?: any, options?: Record<string, any>) =>
      request<T>('POST', endpoint, body, options),
    [request]
  );

  const put = useCallback(
    (endpoint: string, body?: any, options?: Record<string, any>) =>
      request<T>('PUT', endpoint, body, options),
    [request]
  );

  const del = useCallback(
    (endpoint: string, options?: Record<string, any>) =>
      request<T>('DELETE', endpoint, undefined, options),
    [request]
  );

  const patch = useCallback(
    (endpoint: string, body?: any, options?: Record<string, any>) =>
      request<T>('PATCH', endpoint, body, options),
    [request]
  );

  const clear = useCallback(() => {
    setState({ data: initialData, loading: false, error: null });
  }, [initialData]);

  return {
    ...state,
    request,
    get,
    post,
    put,
    delete: del,
    patch,
    clear,
  };
}

export default useApi;
