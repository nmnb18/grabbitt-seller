import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";

import { Button } from "@/components/ui/paper-button";
import OfferCard from "@/components/whats-new/offer-card";
import RedeemModal from "@/components/whats-new/redeem-modal";
import { useAuthStore } from "@/store/authStore";
import { AppStyles } from "@/utils/theme";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { ActivityIndicator, Chip, FAB, Surface, Text } from "react-native-paper";

export default function SellerWhatsNewScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { user } = useAuthStore();

    const [tab, setTab] = useState<"active" | "upcoming" | "expired" | "perks">("active");

    const [active, setActive] = useState<any[]>([]);
    const [upcoming, setUpcoming] = useState<any[]>([]);
    const [expired, setExpired] = useState<any[]>([]);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [redeemedPerks, setRedeemedPerks] = useState([]);

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false);

    const fetchOffers = useCallback(async () => {
        if (user?.user.seller_profile?.subscription.tier === 'free') {
            setShowSubscriptionBanner(true)
            return;
        }
        try {
            setLoading(true);
            const resp = await api.get("/getSellerOffers");

            if (resp.data.success) {
                setActive(resp.data.active || []);
                setUpcoming(resp.data.upcoming || []);
                setExpired(resp.data.expired || []);
            }

            await fetchRedeemedPerks();
        } catch (err) {
            console.error("getSellerOffers error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const fetchRedeemedPerks = async () => {
        const resp = await api.get("/getSellerRedeemedPerks");
        if (resp.data.success) {
            setRedeemedPerks(resp.data.perks);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOffers();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchOffers();
    };

    const deleteOffer = async (date: string) => {
        try {
            Alert.alert(
                "Delete Offer",
                "Are you sure you want to delete this offer?",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            setDeleting(true);
                            await api.delete(`/deleteSellerOffer?date=${date}`);

                            Alert.alert("Deleted", "Offer deleted successfully");
                            fetchOffers(); // Refresh list
                            setDeleting(false);
                        },
                    },
                ]
            );
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.error || "Failed to delete offer.");
        }
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

            {state === 'active' &&
                <View style={{ marginVertical: 16 }}>

                    <Button variant="contained"
                        onPress={() => { setShowRedeemModal(true) }}> REDEEM </Button>
                </View>
            }
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
                    onDelete={() => deleteOffer(offerDoc.date)}
                />
            ))}
            {deleting && (
                <View
                    style={[
                        styles.overlay,
                        {
                            backgroundColor: theme.dark
                                ? "rgba(0,0,0,0.4)"
                                : "rgba(255,255,255,0.7)",
                        },
                    ]}
                >
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 8 }}>Deleting...</Text>
                </View>
            )}
        </ScrollView>
    );

    if (loading) {
        return (
            <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
                <AppHeader />
                <View style={[styles.loaderContainer, { gap: AppStyles.spacing.md }]}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loaderText, { color: theme.colors.onBackground }]}>Loading...</Text>
                </View>
            </View>
        );
    }

    if (showSubscriptionBanner) {
        return (
            <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
                <AppHeader />
                <View style={[styles.loaderContainer, { gap: AppStyles.spacing.md }]}>
                    <Text style={[styles.loaderText, { color: theme.colors.onBackground }]}>Please buy pro/premium plan to continue...</Text>
                    <Button
                        variant="outlined"
                        icon="arrow-right-bold-circle"
                        onPress={() => router.push('/(drawer)/subscription')}
                    >
                        Go to Plans
                    </Button>
                </View>


            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <AppHeader />

            {/* TAB SWITCH */}
            <View style={[styles.tabs, { backgroundColor: tabBg }]}>
                {["active", "upcoming", "expired", "perks"].map((key) => (
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
                    {tab === "perks" && <View style={{ margin: 16 }}>

                        <Text style={{ marginBottom: 12, fontSize: 16, textAlign: 'center' }}>PERKS</Text>
                        {redeemedPerks?.map((item: any) => (
                            <Surface key={item.redeem_code} style={[styles.perkCard, { backgroundColor: theme.colors.background, borderColor: theme.colors.accent }]}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.code}>{item.redeem_code}</Text>
                                    <Chip
                                        mode="outlined"
                                        textStyle={{
                                            color:
                                                item.status === "REDEEMED"
                                                    ? theme.colors.success
                                                    : theme.colors.warning,
                                        }}
                                    >
                                        {item.status}
                                    </Chip>
                                </View>

                                <Text style={styles.customer}>
                                    👤 {item.customer_name} • {item.customer_contact}
                                </Text>

                                <Text style={styles.offerTitle}>{item.offer_title}</Text>

                                <Text style={styles.meta}>
                                    Min Spend: ₹{item.min_spend}
                                </Text>

                                {item.terms && (
                                    <Text style={styles.terms}>{item.terms}</Text>
                                )}
                            </Surface>
                        ))}
                    </View>}
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

            <RedeemModal
                visible={showRedeemModal}
                onClose={() => setShowRedeemModal(false)}
                onSuccess={async () => {
                    await fetchRedeemedPerks(); // refresh after redeem
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    overlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
    },

    perkCard: {
        padding: 16,
        borderRadius: 14,
        marginBottom: 12,
        borderWidth: 1
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    code: {
        fontWeight: "700",
        fontSize: 14,
    },
    customer: {
        marginTop: 6,
        opacity: 0.8,
    },
    offerTitle: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: "600",
    },
    meta: {
        marginTop: 4,
        fontSize: 13,
        opacity: 0.8,
    },
    terms: {
        marginTop: 6,
        fontSize: 12,
        opacity: 0.7,
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
