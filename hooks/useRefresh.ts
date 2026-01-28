/**
 * useRefresh Hook
 * Common refresh/loading state management
 */

import { useState, useCallback } from "react";
import { showErrorAlert } from "@/utils/errorHandler";

interface UseRefreshOptions {
  onError?: (error: unknown) => void;
  showErrorOnFail?: boolean;
}

interface UseRefreshReturn<T> {
  data: T | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  refresh: () => Promise<void>;
  setData: (data: T | null) => void;
  reset: () => void;
}

export function useRefresh<T>(
  fetchFn: () => Promise<T>,
  options?: UseRefreshOptions
): UseRefreshReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { onError, showErrorOnFail = true } = options || {};

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "An error occurred";
      setError(message);
      
      if (showErrorOnFail) {
        showErrorAlert(e);
      }
      
      onError?.(e);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, onError, showErrorOnFail]);

  const refresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (e) {
      const message = e instanceof Error ? e.message : "An error occurred";
      setError(message);
      onError?.(e);
    } finally {
      setRefreshing(false);
    }
  }, [fetchFn, onError]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setRefreshing(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    refreshing,
    error,
    fetch,
    refresh,
    setData,
    reset,
  };
}
