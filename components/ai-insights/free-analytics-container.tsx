import FreeAnalyticsSkeleton from "@/components/skeletons/free-analytics";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import { useSellerStats } from "@/hooks/useSellerStats";
import React, { useCallback } from "react";
import SellerFreeAIInsights from "./free-analytics";

const SellerFreeAIInsightsWithSkeleton =
    withSkeletonTransition(FreeAnalyticsSkeleton)(SellerFreeAIInsights);

export default function SellerFreeAIInsightsContainer() {
    const { stats, loading, refreshing, error, hasData, refetch } =
        useSellerStats();

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

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
