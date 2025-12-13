import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";

import OfferCard from "@/components/whats-new/offer-card";
import { AppStyles } from "@/utils/theme";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ActivityIndicator, FAB, Text } from "react-native-paper";

export default function SellerWhatsNewScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [tab, setTab] = useState<"active" | "upcoming" | "expired">("active");

    const [active, setActive] = useState<any[]>([]);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [expired, setExpired] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOffers = useCallback(async () => {
        try {
            const resp = await api.get("/getSellerOffers");

            if (resp.data.success) {
                setActive(resp.data.active || []);
                setUpcoming(resp.data.upcoming || []);
                setExpired(resp.data.expired || []);
            }
        } catch (err) {
            console.error("getSellerOffers error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchOffers();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOffers();
    };

    const inactiveText = theme.colors.onSurface + "99";
    const activeText = theme.colors.onSurface;
    const tabBg = theme.colors.surface + "33";

    const renderData = (items: any[], state: "active" | "upcoming" | "expired") => (
        <ScrollView
            style={styles.scroll}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {items.length === 0 && (
                <View style={styles.empty}>
                    <Text>No {state} offers.</Text>
                </View>
            )}

            {items.map((offerDoc) => (
                <OfferCard
                    key={offerDoc.id}
                    item={offerDoc}
                    state={state}
                    onEdit={() =>
                        router.push({
                            pathname: "/(drawer)/whats-new/offer-edit",
                            params: { date: offerDoc.date },
                        })
                    }
                    onDelete={async () => {
                        try {
                            await api.delete("/deleteSellerOffer", {
                                data: { date: offerDoc.date },
                            });
                            fetchOffers();
                        } catch (err) {
                            console.error("Delete error:", err);
                        }
                    }}
                />
            ))}
        </ScrollView>
    );

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
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader />

            {/* TAB SWITCH */}
            <View style={[styles.tabs, { backgroundColor: tabBg }]}>
                {["active", "upcoming", "expired"].map((key) => (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setTab(key as any)}
                        style={[
                            styles.tab,
                            tab === key && {
                                backgroundColor: theme.colors.surface,
                                elevation: 2,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                { color: inactiveText },
                                tab === key && {
                                    color: activeText,
                                    fontWeight: "700",
                                },
                            ]}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* CONTENT */}
            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 10 }}>Loading offers...</Text>
                </View>
            ) : (
                <>
                    {tab === "active" && renderData(active, "active")}
                    {tab === "upcoming" && renderData(upcoming, "upcoming")}
                    {tab === "expired" && renderData(expired, "expired")}
                </>
            )}

            {/* FAB only for UPCOMING tab */}
            {tab === "upcoming" && (
                <FAB
                    icon="plus"
                    style={[styles.fab, { backgroundColor: theme.colors.primary }]}
                    color="#fff"
                    onPress={() => router.push("/(drawer)/whats-new/offer-add")}
                />
            )}
        </View>
    );
}

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

    tabs: {
        flexDirection: "row",
        padding: 12,
        marginHorizontal: 12,
        marginTop: 12,
        borderRadius: 12,
    },

    tab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: "center",
    },

    tabText: {
        fontSize: 14,
        fontWeight: "500",
    },

    scroll: {
        paddingHorizontal: 16,
        paddingTop: 10,
    },

    empty: {
        marginTop: 50,
        alignItems: "center",
    },

    loader: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    fab: {
        position: "absolute",
        right: 20,
        bottom: 40,
    },
});
