/**
 * useFetchData Hook
 * Generic data fetching hook with loading and refresh states
 * Used by: Profile screens, Dashboard, Profile setup
 */

import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

interface UseFetchDataOptions {
    onError?: (error: any) => void;
    showErrorAlert?: boolean;
    immediate?: boolean;
}

interface UseFetchDataReturn<T> {
    data: T | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    fetch: () => Promise<void>;
    refresh: () => Promise<void>;
    setData: (data: T | null) => void;
    reset: () => void;
}

export function useFetchData<T>(
    fetchFn: () => Promise<T>,
    options?: UseFetchDataOptions
): UseFetchDataReturn<T> {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { onError, showErrorAlert = true, immediate = true } = options || {};

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFn();
            setData(result);
        } catch (e: any) {
            const message = e instanceof Error ? e.message : "An error occurred";
            setError(message);

            if (showErrorAlert) {
                Alert.alert("Error", message);
            }

            onError?.(e);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, onError, showErrorAlert]);

    const refresh = useCallback(async () => {
        try {
            setRefreshing(true);
            setError(null);
            const result = await fetchFn();
            setData(result);
        } catch (e: any) {
            const message = e instanceof Error ? e.message : "An error occurred";
            setError(message);

            if (showErrorAlert) {
                Alert.alert("Error", message);
            }

            onError?.(e);
        } finally {
            setRefreshing(false);
        }
    }, [fetchFn, onError, showErrorAlert]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setRefreshing(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (immediate) {
            fetch();
        }
    }, [fetch, immediate]);

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
