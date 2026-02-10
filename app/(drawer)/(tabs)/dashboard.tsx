import SellerDashboard from "@/components/dashboard/dashboard";
import DashboardSkeleton from "@/components/skeletons/dashboard";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import { useSellerStats } from "@/hooks/useSellerStats";
import React, { useCallback } from "react";
import { Alert } from "react-native";

const DashboardContainer =
  withSkeletonTransition(DashboardSkeleton)(SellerDashboard);

export default function SellerDashboardContainer() {
  const { stats, loading, refreshing, hasData, refetch } = useSellerStats();

  const handleRefresh = useCallback(async () => {
    try {
      await refetch();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to refresh");
    }
  }, [refetch]);

  return (
    <DashboardContainer
      stats={stats}
      loading={loading}
      refreshing={refreshing}
      hasData={hasData}
      onRefresh={handleRefresh}
    />
  );
}
