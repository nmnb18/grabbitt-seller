/**
 * useProAnalytics Hook
 * Manages pro/premium tier analytics data with computed values
 */

import { useMemo } from 'react';

export type DayBucket = {
    date: string;
    scans: number;
    unique_users: number;
    points: number;
    redemptions: number;
};

export type PeakHour = { hour: number; scans: number };
export type PeakDay = { weekday: number; scans: number };

export type TopCustomer = {
    user_id: string;
    customer_name: string;
    total_scans: number;
    total_points: number;
    last_scan?: string | Date | null;
};

export type RewardFunnel = {
    earned_customers: number;
    redeemed_customers: number;
    total_redemptions: number;
};

export type Segments = {
    new: number;
    regular: number;
    loyal: number;
    dormant: number;
    redeemer: number;
};

export type AdvancedAnalytics = {
    seller_id: string;
    seller_name: string | null;
    subscription_tier: 'free' | 'pro' | 'premium';
    trends_7d: DayBucket[];
    trends_30d: DayBucket[];
    new_vs_returning_30d: {
        new: number;
        returning: number;
    };
    peak_hours: PeakHour[];
    peak_days: PeakDay[];
    qr_type_breakdown: Record<string, number>;
    qr_type_points: Record<string, number>;
    top_customers: TopCustomer[];
    reward_funnel: RewardFunnel;
    segments: Segments;
    export_available: boolean;
};

export interface UseProAnalyticsReturn {
    maxScans7: number;
    topHours: PeakHour[];
    topDays: PeakDay[];
    totalQrScans: number;
}

export function useProAnalytics(data: AdvancedAnalytics | null): UseProAnalyticsReturn {
    // Compute max for 7d mini-chart
    const maxScans7 = useMemo(
        () =>
            data?.trends_7d?.length
                ? Math.max(...data.trends_7d.map((d) => d.scans)) || 1
                : 1,
        [data?.trends_7d]
    );

    // Top hours & days sorted by scans
    const topHours = useMemo(() => {
        if (!data?.peak_hours?.length) return [];
        return [...data.peak_hours].sort((a, b) => b.scans - a.scans).slice(0, 3);
    }, [data?.peak_hours]);

    const topDays = useMemo(() => {
        if (!data?.peak_days?.length) return [];
        return [...data.peak_days].sort((a, b) => b.scans - a.scans).slice(0, 3);
    }, [data?.peak_days]);

    // Total QR scans
    const totalQrScans = useMemo(() => {
        if (!data?.qr_type_breakdown) return 0;
        return Object.values(data.qr_type_breakdown).reduce(
            (sum, v) => sum + v,
            0
        );
    }, [data?.qr_type_breakdown]);

    return {
        maxScans7,
        topHours,
        topDays,
        totalQrScans,
    };
}
