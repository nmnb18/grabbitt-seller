import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { Card, Portal, Surface, Text } from "react-native-paper";
import { StatCard } from "../shared/stats-card";
import RedeemModal from "../whats-new/redeem-modal";

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
    stats = {},
    loading = false,
    hasData = false,
    refreshing = false,
    onRefresh
}: SellerDashboardProps) {
    const user = useAuthStore((state) => state.user);
    const theme = useTheme();
    const router = useRouter();
    const [redeemVisible, setRedeemVisible] = useState(false);

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
                            value={stats?.total_users || 0}
                            label="Total Users"
                            backgroundColor={theme.colors.surface}
                        />
                        <StatCard
                            icon="star-circle"
                            value={stats?.total_points_issued || 0}
                            label="Points Issued"
                            backgroundColor={theme.colors.surface}
                        />
                    </View>

                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="gift"
                            value={stats?.total_redemptions || 0}
                            label="Redemptions"
                            backgroundColor={theme.colors.surface}
                        />
                        <StatCard
                            icon="qrcode"
                            value={stats?.total_scanned || 0}
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
                        title="Redeem Today's Perk"
                        subtitle="Scan redemption QR"
                        bgColor={theme.colors.surface}
                        icon="star-four-points-outline"
                        iconColor={theme.colors.secondary}
                        onPress={() => setRedeemVisible(true)}
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
            <Portal>
                <RedeemModal visible={redeemVisible} onClose={() => setRedeemVisible(false)} />
            </Portal>
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
