
import FreeAnalyticsSkeleton from "@/components/skeletons/free-analytics";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import api from "@/services/axiosInstance";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import SellerFreeAIInsights from "./free-analytics";

const SellerFreeAIInsightsWithSkeleton =
    withSkeletonTransition(FreeAnalyticsSkeleton)(SellerFreeAIInsights);

// ------------------------------
// CONTAINER
// ------------------------------
export default function SellerFreeAIInsightsContainer() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [hasData, setHasData] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ------------------------------
    // LOAD ANALYTICS
    // ------------------------------
    const loadData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            const response = await api.get("/sellerStats");
            const { data } = response;

            if (!data?.success) {
                setError(data?.error || "Failed to load analytics");
                return;
            }

            setStats(data.data);

        } catch (error: any) {
            console.error(error);
            setError(
                error?.response?.data?.error ||
                "Could not load analytics"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
            setHasData(true);
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
        <SellerFreeAIInsightsWithSkeleton
            stats={stats}
            loading={loading}
            refreshing={refreshing}
            error={error}
            hasData={hasData}
            onRefresh={handleRefresh}
        />
    );
}
