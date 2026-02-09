/**
 * useAnalytics Hook
 * Manages free tier analytics data fetching and state
 */

import { useCallback, useState } from 'react';

export type TodayStats = {
    scans: number;
    points_issued: number;
    redemptions: number;
    points_redeemed: number;
};

export type LastScan = {
    id: string;
    user_id?: string;
    seller_name?: string;
    points?: number;
    qr_type?: string;
    timestamp?: any;
    description?: string;
};

export type SellerStats = {
    total_users: number;
    total_qrs: number;
    total_scanned: number;
    total_points_issued: number;
    total_redemptions: number;
    seller_id: string;
    seller_name?: string;
    today?: TodayStats;
    last_five_scans?: LastScan[];
    subscription_tier?: 'free' | 'pro' | 'premium';
    locked_features?: boolean;
};

export interface UseAnalyticsReturn {
    stats: SellerStats | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    fetchStats: () => Promise<void>;
    onRefresh: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
    const [stats, setStats] = useState<SellerStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            // TODO: Replace with actual API call
            // const response = await analyticsApi.getSellerStats();
            // setStats(response);
        } catch (err: any) {
            setError(err?.message || 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            await fetchStats();
        } finally {
            setRefreshing(false);
        }
    }, [fetchStats]);

    return {
        stats,
        loading,
        refreshing,
        error,
        fetchStats,
        onRefresh,
    };
}
