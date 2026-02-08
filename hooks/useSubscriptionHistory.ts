/**
 * useSubscriptionHistory Hook
 * Manages subscription history data
 * Used by: subscription-history.tsx
 */

import { subscriptionApi } from "@/services";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export interface SubscriptionHistory {
    id: string;
    internal_order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    plan_id: string;
    amount: number;
    original_amount: number;
    coupon: {
        discount_amount: number;
    };
    status: string;
    paid_at: any;
    expires_at: any;
    environment: string;
    coupon_used?: string;
    created_at?: any;
}

interface UseSubscriptionHistoryReturn {
    history: SubscriptionHistory[];
    loading: boolean;
    refreshing: boolean;
    fetchHistory: (userId: string) => Promise<void>;
    onRefresh: (userId: string) => Promise<void>;
}

export function useSubscriptionHistory(): UseSubscriptionHistoryReturn {
    const [history, setHistory] = useState<SubscriptionHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = useCallback(async (userId: string) => {
        if (!userId) return;

        try {
            setLoading(true);
            const response = await subscriptionApi.getSubscriptionHistory(userId);

            if (response?.success) {
                setHistory(response.history || response.data || []);
            } else {
                Alert.alert("Error", "Failed to fetch subscription history");
            }
        } catch (error: any) {
            console.error("Subscription history error:", error);
            Alert.alert("Error", "Failed to load subscription history");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(
        async (userId: string) => {
            setRefreshing(true);
            await fetchHistory(userId);
        },
        [fetchHistory]
    );

    return {
        history,
        loading,
        refreshing,
        fetchHistory,
        onRefresh,
    };
}
