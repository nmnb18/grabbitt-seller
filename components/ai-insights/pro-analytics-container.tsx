
import ProAnalyticsSkeleton from "@/components/skeletons/pro-analytics";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import SellerProAnalyticsInsights from "./pro-analytics";


const SellerProAnalyticsWithSkeleton =
    withSkeletonTransition(ProAnalyticsSkeleton)(SellerProAnalyticsInsights);

// ------------------------------
// CONTAINER
// ------------------------------
export default function SellerProAnalyticsInsightsContainer() {
    const { user } = useAuthStore();
    const tier =
        user?.user?.seller_profile?.subscription?.tier || "free";

    const [data, setData] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [hasData, setHasData] = useState(false);

    // ------------------------------
    // LOAD ADVANCED ANALYTICS
    // ------------------------------
    const loadData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.get("/sellerAdvancedAnalytics");
            const { data } = response;

            if (!data?.success) {
                setError(data?.error || "Failed to load advanced analytics");
                return;
            }

            setData(data.data);
        } catch (error: any) {
            console.error(error);
            setError(
                error?.response?.data?.error ||
                "Could not load advanced analytics"
            );
        } finally {
            setRefreshing(false);
            setHasData(true);
            setLoading(false);
        }
    }, []);

    // ------------------------------
    // AUTO LOAD ON FOCUS
    // ------------------------------
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    // ------------------------------
    // PULL TO REFRESH
    // ------------------------------
    const handleRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    return (
        <SellerProAnalyticsWithSkeleton
            data={data}
            refreshing={refreshing}
            error={error}
            loading={loading}
            hasData={hasData}
            tier={tier}
            onRefresh={handleRefresh}
        />
    );
}
