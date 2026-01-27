import SellerDashboard from "@/components/dashboard/dashboard";
import DashboardSkeleton from "@/components/skeletons/dashboard";
import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet } from "react-native";

const DashboardContainer = withSkeletonTransition(DashboardSkeleton)(SellerDashboard);

// ------------------------------
// MAIN DASHBOARD
// ------------------------------

export default function SellerDashboardContainer() {
  const theme = useTheme();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasData, setHasData] = useState(false);

  // ------------------------------
  // LOAD DASHBOARD DATA
  // ------------------------------
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get(`/sellerStats`);
      const { data } = response;
      if (!data?.success) {
        Alert.alert("Error", data?.error || "Failed to load dashboard stats");
        return;
      }

      const s = data.data;

      setStats({
        total_users: s.total_users,
        total_qrs: s.total_qrs,
        total_scanned: s.total_scanned,
        total_points_issued: s.total_points_issued,
        total_redemptions: s.total_redemptions,
        seller_name: s.seller_name,
      });

      setHasData(true);
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Error",
        error?.response?.data?.error || "Could not load dashboard"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <DashboardContainer
      stats={stats}
      loading={loading}
      hasData={hasData}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}


// ------------------------------
// STYLES
// ------------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  heroContainer: {
    position: "relative",
    height: 200,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 24,
  },
  heroImage: { width: "100%", height: "100%", resizeMode: "cover" },
  heroOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  heroContent: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  heroShopName: { color: "#FFF", fontWeight: "700", fontSize: 22, marginBottom: 12 },
  heroChip: { backgroundColor: "rgba(255,255,255,0.4)", marginBottom: 8 },
  heroChipText: { fontWeight: "600" },
  heroSubLabel: { color: "#FFF", fontSize: 14, textAlign: "center", marginBottom: 16 },

  statsSection: { marginBottom: 24 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },

  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  statContent: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  statValue: { fontSize: 24, fontWeight: "700", marginTop: 6 },
  statLabel: { fontSize: 16, opacity: 0.9, marginTop: 4, textAlign: "center" },

  section: { marginBottom: 24 },

  expiredCard: { padding: 20, borderRadius: 16 },
  expiredText: { textAlign: "center", fontSize: 16, marginBottom: 12 },

  bottomSpacer: { height: 24 },

  actionCard: { marginBottom: 12, borderRadius: 16 },
  actionCardContent: { flexDirection: "row", alignItems: "center", paddingVertical: 16 },
  actionIcon: {
    width: 56, height: 56, borderRadius: 28,
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  actionTextContainer: { flex: 1 },
  actionTitle: { fontWeight: "600", marginBottom: 4 },
  actionSubtitle: { opacity: 0.8 },
});
