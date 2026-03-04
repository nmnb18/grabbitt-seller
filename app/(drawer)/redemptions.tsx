import { LoadingOverlay } from "@/components/common";
import { GradientHeader } from "@/components/shared/app-header";
import { StatCard } from "@/components/shared/stats-card";
import { useSellerRedemptions } from "@/hooks";
import { useTheme } from "@/hooks/use-theme-color";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, View } from "react-native";
import { Card, Chip, Text } from "react-native-paper";

export default function SellerRedemptionsScreen() {
  const theme = useTheme();

  const { redemptions, stats, loading, refreshing, fetchRedemptions, onRefresh } = useSellerRedemptions();

  useFocusEffect(
    useCallback(() => {
      fetchRedemptions();
    }, [fetchRedemptions])
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "redeemed":
        return theme.colors.success;
      case "cancelled":
        return theme.colors.error;
      default:
        return theme.colors.warning;
    }
  };

  const formatDateTime = (timestamp: any) => {
    const date = timestamp?._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    return date.toLocaleString();
  };

  const formattedRedemptions = useMemo(
    () =>
      redemptions.map((item) => ({
        ...item,
        createdAtText: formatDateTime(item.created_at),
      })),
    [redemptions]
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <GradientHeader title="Redemptions" />
        <LoadingOverlay
          visible={loading}
          message="Loading redemption history..."
        />
      </View>
    );
  }

  const renderHeader = () => (
    <View>
      {stats && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <StatCard
              icon="star-circle"
              value={stats?.total || 0}
              label="Total"
              backgroundColor={theme.colors.surface}
            />
            <StatCard
              icon="star"
              value={stats?.pending || 0}
              label="Pending"
              backgroundColor={theme.colors.surface}
            />
          </View>
        </View>
      )}
      {redemptions.length > 0 && (
        <Text style={{ fontSize: 16, marginBottom: 8, textAlign: "center", fontWeight: "500" }}>Redemptions</Text>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
      <Text>No redemptions yet.</Text>
    </View>
  );

  const renderItem = ({ item }: { item: any }) => (
    <Card
      style={[{ borderRadius: 16, marginBottom: 14, backgroundColor: theme.colors.surface }]}
    >
      <Card.Content>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>👤 {item.user_name}</Text>
          <Chip
            style={{
              backgroundColor: getStatusColor(item.status) + "20",
            }}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 8 }}>
          <Text style={{ fontSize: 12, opacity: 0.7 }}>{item.user_email}</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8, marginTop: 8 }}>
          {item.offer_name && (
            <Text style={{ fontSize: 14, fontWeight: "500" }}>
              🎁 Offer: {item.offer_name}
            </Text>
          )}
          <Text style={{ fontSize: 14, fontWeight: "500" }}>Points: {item.points}</Text>
        </View>

        <Text style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
          {item.createdAtText}
        </Text>

        <Text style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>
          ID: {item.redemption_id.slice(0, 12)}...
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <GradientHeader title="Redemptions" />
      <FlatList
        data={formattedRedemptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.redemption_id}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
