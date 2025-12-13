import { AppHeader } from "@/components/shared/app-header";
import { StatCard } from "@/components/shared/stats-card";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { AppStyles } from "@/utils/theme";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Card, Chip, Text } from "react-native-paper";

type Redemption = {
    redemption_id: string;
    offer_name?: string;
    points: string;
    status: "pending" | "approved" | "cancelled" | string;
    user_name: string;
    user_email: string;
    seller_shop_name: string;
    created_at: any;
};

export default function SellerRedemptionsScreen() {
    const theme = useTheme();

    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<any>(null);

    const fetchRedemptions = useCallback(async () => {
        try {
            const resp = await api.get("/getSellerRedemptions");

            if (resp.data?.success) {
                setRedemptions(resp.data.redemptions || []);
                setStats(resp.data.stats || []);
            }
        } catch (error) {
            console.log("Redemption fetch error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchRedemptions();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchRedemptions();
    };

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

    if (loading) {
        return (
            <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
                <AppHeader />
                <View style={[styles.loaderContainer, { gap: AppStyles.spacing.md }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loaderText, { color: theme.colors.onBackground }]}>Loading subscription history...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <AppHeader />
            <ScrollView
                style={[styles.container, { backgroundColor: theme.colors.background }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {!redemptions.length && !loading && (
                    <View style={styles.loader}>
                        <Text>No redemptions yet.</Text>
                    </View>
                )}

                <View style={{ margin: 16 }}>
                    {stats && (
                        <View style={styles.statsSection}>
                            <View style={styles.statsGrid}>
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
                        <Text style={styles.label}>Redemptions</Text>
                    )}
                    {redemptions.length > 0 &&
                        redemptions.map((item) => (
                            <Card
                                key={item.redemption_id}
                                style={[styles.card, { backgroundColor: theme.colors.surface }]}
                            >
                                <Card.Content>
                                    {/* HEADER */}
                                    <View style={styles.headerRow}>
                                        <Text style={styles.shopName}>👤 {item.user_name}</Text>

                                        <Chip
                                            style={{
                                                backgroundColor: getStatusColor(item.status) + "20",
                                            }}
                                            textStyle={{ color: getStatusColor(item.status) }}
                                        >
                                            {item.status.toUpperCase()}
                                        </Chip>
                                    </View>

                                    {/* USER */}
                                    <View style={styles.row}>
                                        <Text style={styles.userEmail}>{item.user_email}</Text>
                                    </View>

                                    {/* OFFER */}
                                    <View style={styles.row}>
                                        {item.offer_name && (
                                            <Text style={styles.offerText}>
                                                🎁 Offer: {item.offer_name}
                                            </Text>
                                        )}

                                        {/* POINTS */}
                                        <Text style={styles.pointsText}>Points: {item.points}</Text>
                                    </View>

                                    {/* DATE */}
                                    <Text style={styles.dateText}>
                                        {new Date(
                                            item.created_at?._seconds
                                                ? item.created_at._seconds * 1000
                                                : item.created_at
                                        ).toLocaleString()}
                                    </Text>

                                    {/* ID */}
                                    <Text style={styles.idText}>
                                        ID: {item.redemption_id.slice(0, 12)}...
                                    </Text>
                                </Card.Content>
                            </Card>
                        ))}
                </View>
            </ScrollView>
        </View>

    );
}

// ✅ CLEAN STYLES
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    screen: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: AppStyles.spacing.md,
    },
    loaderText: {
        fontSize: 16,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        marginTop: 8,
    },

    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    label: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: "center",
        fontWeight: 500,
    },

    statsSection: {},
    statsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },

    card: {
        borderRadius: 16,
        marginBottom: 14,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },

    shopName: {
        fontSize: 16,
        fontWeight: "700",
    },

    userName: {
        fontSize: 14,
        fontWeight: "600",
    },

    userEmail: {
        fontSize: 12,
        opacity: 0.7,
    },

    offerText: {
        fontSize: 14,
        fontWeight: "500",
    },

    pointsText: {
        fontSize: 14,
        fontWeight: "500",
    },

    dateText: {
        fontSize: 12,
        opacity: 0.6,
        marginTop: 6,
    },

    idText: {
        fontSize: 11,
        opacity: 0.5,
        marginTop: 4,
    },
});
