import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { SUBSCRIPTION_PLANS } from "@/utils/constant";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { Card, Chip, Surface, Text } from "react-native-paper";
import { StatCard } from "../shared/stats-card";

// ------------------------------
// TYPES
// ------------------------------


interface ActionCardProps {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
    iconColor: string;
    bgColor: string;
}

// ------------------------------
// STAT CARD
// ------------------------------



// ------------------------------
// ACTION CARD
// ------------------------------

const ActionCard = ({
    icon,
    title,
    subtitle,
    bgColor,
    onPress,
    iconColor,
}: ActionCardProps) => (
    <Card onPress={onPress} style={[styles.actionCard, { backgroundColor: bgColor }]} elevation={1}>
        <Card.Content style={styles.actionCardContent}>
            <Surface style={[styles.actionIcon, { backgroundColor: `${iconColor}20` }]}>
                <MaterialCommunityIcons name={icon as any} size={28} color={iconColor} />
            </Surface>

            <View style={styles.actionTextContainer}>
                <Text variant="titleMedium" style={styles.actionTitle}>
                    {title}
                </Text>
                <Text variant="bodySmall" style={styles.actionSubtitle}>
                    {subtitle}
                </Text>
            </View>

            <MaterialCommunityIcons name="chevron-right" size={24} color="#9CA3AF" />
        </Card.Content>
    </Card>
);

// ------------------------------
// MAIN DASHBOARD
// ------------------------------
interface SellerDashboardProps {
    // Data
    stats: any;

    // Loading states
    loading?: boolean;
    hasData?: boolean;
    refreshing?: boolean;

    // Actions
    onRefresh?: () => void;
}
export default function SellerDashboard({
    //stats = {},
    loading = false,
    hasData = false,
    refreshing = false,
    onRefresh
}: SellerDashboardProps) {
    const { user } = useAuthStore();
    const theme = useTheme();
    const router = useRouter();

    const sellerProfile = user?.user.seller_profile;

    const backgroundColor = theme.colors.background;


    return (
        <View style={[styles.container, { backgroundColor }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >

                {/* ------------------------------
            HERO BANNER
        ------------------------------ */}
                <View style={styles.heroContainer}>
                    <Image
                        source={sellerProfile?.media.banner_url ? { uri: sellerProfile?.media.banner_url } : require("@/assets/images/hero_banner.png")}
                        style={styles.heroImage}
                    />

                    <View style={styles.heroOverlay} />

                    <View style={styles.heroContent}>
                        <Text variant="headlineSmall" style={styles.heroShopName}>
                            Hello, {sellerProfile?.business?.shop_name}
                        </Text>

                        <Chip
                            mode="flat"
                            icon="star"
                            style={styles.heroChip}
                            textStyle={styles.heroChipText}
                        >
                            {SUBSCRIPTION_PLANS[sellerProfile?.subscription?.tier ?? "free"].name}
                        </Chip>

                        <Text variant="bodySmall" style={styles.heroSubLabel}>
                            Manage your loyalty rewards and grow your customers
                        </Text>

                        {sellerProfile?.subscription?.tier === "free" && (
                            <Button
                                variant="contained"
                                onPress={() => router.push("/(drawer)/subscription")}
                            >
                                Upgrade Plan
                            </Button>
                        )}
                    </View>
                </View>

                {/* ------------------------------
            STAT CARDS
        ------------------------------ */}
                <View style={styles.statsSection}>
                    <TouchableOpacity style={styles.refreshWrapper} onPress={onRefresh}>

                        <Text>REFRESH</Text>
                        <MaterialCommunityIcons
                            name="refresh"
                            size={20}
                            color={theme.colors.onBackground}
                        />
                    </TouchableOpacity>
                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="account-group"
                            value={sellerProfile?.stats?.active_customers || 0}
                            label="Total Users"
                            backgroundColor={theme.colors.surface}
                        />
                        <StatCard
                            icon="star-circle"
                            value={sellerProfile?.stats?.total_points_distributed || 0}
                            label="Points Issued"
                            backgroundColor={theme.colors.surface}
                        />
                    </View>

                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="gift"
                            value={sellerProfile?.stats?.total_redemptions || 0}
                            label="Redemptions"
                            backgroundColor={theme.colors.surface}
                        />
                        <StatCard
                            icon="qrcode"
                            value={sellerProfile?.stats?.total_scans || 0}
                            label="Total Scans"
                            backgroundColor={theme.colors.surface}
                        />
                    </View>
                </View>

                {/* ------------------------------
            QUICK ACTIONS
        ------------------------------ */}
                <View style={styles.section}>
                    <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                        Quick Actions
                    </Text>

                    <ActionCard
                        title="Scan Customer QR"
                        subtitle="Award reward points"
                        icon="qrcode-scan"
                        bgColor={theme.colors.surface}
                        iconColor={theme.colors.primary}
                        onPress={() => router.push("/(drawer)/(tabs)/scan-customer")}
                    />

                    <ActionCard
                        title="Redeem Points"
                        subtitle="Scan redemption QR"
                        bgColor={theme.colors.surface}
                        icon="star-four-points-outline"
                        iconColor={theme.colors.secondary}
                        onPress={() => router.push("/(drawer)/(tabs)/redeem-qr")}
                    />

                    <ActionCard
                        title="What's New"
                        subtitle="Manage daily offers"
                        bgColor={theme.colors.surface}
                        icon="gift-outline"
                        iconColor={theme.colors.error}
                        onPress={() => router.push("/(drawer)/whats-new/whats-new-home")}
                    />
                </View>

                <View style={styles.bottomSpacer} />
            </ScrollView>

        </View>
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
    heroChip: { backgroundColor: "rgba(255,255,255,0.8)", marginBottom: 8 },
    heroChipText: { fontWeight: "600" },
    heroSubLabel: { color: "#FFF", fontSize: 14, textAlign: "center", fontWeight: "500", marginBottom: 16 },

    statsSection: { marginBottom: 24 },
    refreshWrapper: {
        alignContent: 'flex-end',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 5,
        marginBottom: 10,
        flexDirection: 'row'
    },
    statsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },

    section: { marginBottom: 24 },
    sectionTitle: { fontWeight: "600", marginBottom: 12 },

    bottomSpacer: { height: 100 },

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
