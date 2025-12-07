import { useTheme } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';
import {
    Card,
    Text,
} from 'react-native-paper';

type SellerFreeAIInsightsProps = {
    stats: SellerStats | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    onRefresh: () => void;
};

type TodayStats = {
    scans: number;
    points: number;
};

type LastScan = {
    id: string;
    user_id?: string;
    seller_name?: string;
    points?: number;
    qr_type?: string;
    timestamp?: any;
    description?: string;
};

type SellerStats = {
    total_users: number;
    total_qrs: number;
    total_scanned: number;
    total_points_issued: number;
    total_redemptions: number;
    seller_id: string;
    seller_name?: string;
    today?: TodayStats;
    last_five_scans?: LastScan[];
    subscription_tier?: 'free' | 'pro' | 'premium';
    locked_features?: boolean;
};

export default function SellerFreeAIInsights({
    stats,
    refreshing,
    error,
    onRefresh,
}: SellerFreeAIInsightsProps) {
    const theme = useTheme();

    const isFree = stats?.subscription_tier === 'free' || !stats?.subscription_tier;


    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.colors.background }]}
            contentContainerStyle={styles.content}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* ERROR BANNER */}
            {error && (
                <Card
                    style={[
                        styles.errorCard,
                        { backgroundColor: theme.colors.error + '22' },
                    ]}
                >
                    <Card.Content>
                        <Text
                            style={[
                                styles.errorText,
                                { color: theme.colors.error },
                            ]}
                        >
                            {error}
                        </Text>
                    </Card.Content>
                </Card>
            )}

            {/* HEADER */}
            <View style={styles.headerRow}>
                <View>
                    <Text
                        style={[
                            styles.title,
                            { color: theme.colors.onSurface },
                        ]}
                    >
                        Analytics
                    </Text>
                    <Text
                        style={[
                            styles.subtitle,
                            { color: theme.colors.onSurfaceDisabled },
                        ]}
                    >
                        {stats?.seller_name ? stats.seller_name : 'Your shop'} • Overview
                    </Text>
                </View>
            </View>

            {/* TODAY SUMMARY CARD */}
            <Card
                style={[
                    styles.todayCard,
                    { backgroundColor: theme.colors.surface },
                ]}
                elevation={2}
            >
                <Card.Content style={styles.todayContent}>
                    <View>
                        <Text
                            style={[
                                styles.todayLabel,
                                {
                                    color: theme.colors.primary,
                                },
                            ]}
                        >
                            Today
                        </Text>
                        <Text
                            style={[
                                styles.todayScans,
                                { color: theme.colors.onSurface },
                            ]}
                        >
                            {stats?.today?.scans ?? 0} scans
                        </Text>
                        <Text
                            style={[
                                styles.todayPoints,
                                { color: theme.colors.onSurfaceDisabled },
                            ]}
                        >
                            {stats?.today?.points ?? 0} points issued
                        </Text>
                    </View>
                    <MaterialCommunityIcons
                        name="calendar-today"
                        size={32}
                        color={theme.colors.accent}
                    />
                </Card.Content>
            </Card>

            {/* GRID TILE ANALYTICS */}
            <View style={styles.grid}>
                <StatTile
                    label="Total Scans"
                    value={stats?.total_scanned ?? 0}
                    icon="qrcode-scan"
                />

                <StatTile
                    label="Unique Customers"
                    value={stats?.total_users ?? 0}
                    icon="account-group-outline"
                />

                <StatTile
                    label="Points Issued"
                    value={stats?.total_points_issued ?? 0}
                    icon="star-circle-outline"
                />

                <StatTile
                    label="QR Codes"
                    value={stats?.total_qrs ?? 0}
                    icon="qrcode"
                />

                <StatTile
                    label="Redemptions"
                    value={stats?.total_redemptions ?? 0}
                    icon="gift-outline"
                />
            </View>

            {/* LAST 5 SCANS */}
            <Card
                style={[
                    styles.card,
                    { backgroundColor: theme.colors.surface },
                ]}
                elevation={2}
            >
                <Card.Content>
                    <View style={styles.cardHeaderRow}>
                        <Text
                            style={[
                                styles.cardTitle,
                                { color: theme.colors.onSurface },
                            ]}
                        >
                            Recent Scans
                        </Text>
                    </View>

                    {stats?.last_five_scans && stats.last_five_scans.length > 0 ? (
                        stats.last_five_scans.map((scan, idx) => (
                            <View
                                key={scan.id || idx}
                                style={[
                                    styles.scanRow,
                                    { borderBottomColor: theme.colors.outline },
                                ]}
                            >
                                <View>
                                    <Text
                                        style={[
                                            styles.scanTitle,
                                            { color: theme.colors.onSurface },
                                        ]}
                                    >
                                        {scan.description || 'QR Scan'}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.scanSubtitle,
                                            { color: theme.colors.onSurfaceDisabled },
                                        ]}
                                    >
                                        {scan.points ?? 0} pts • {scan.qr_type || 'QR'}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <Text
                            style={[
                                styles.emptyText,
                                { color: theme.colors.onSurfaceDisabled },
                            ]}
                        >
                            No recent scans yet.
                        </Text>
                    )}
                </Card.Content>
            </Card>

            {/* UPGRADE CARD (PREVIEW PRO ANALYTICS) */}
            {isFree && (
                <Card
                    style={[
                        styles.upgradeCard,
                        { backgroundColor: theme.colors.surfaceVariant },
                    ]}
                >
                    <Card.Content>
                        <Text
                            style={[
                                styles.upgradeTitle,
                                { color: theme.colors.secondary },
                            ]}
                        >
                            Unlock full analytics
                        </Text>
                        <Text
                            style={[
                                styles.upgradeText,
                                { color: theme.colors.onSurface },
                            ]}
                        >
                            Get detailed trends, charts, customer segments, and more with Pro or
                            Premium.
                        </Text>

                        <View style={styles.upgradeFeaturesRow}>
                            <Text
                                style={[
                                    styles.upgradeBullet,
                                    { color: theme.colors.onSurfaceDisabled },
                                ]}
                            >
                                • Scan trends & charts
                            </Text>
                            <Text
                                style={[
                                    styles.upgradeBullet,
                                    { color: theme.colors.onSurfaceDisabled },
                                ]}
                            >
                                • Top customers insights
                            </Text>
                            <Text
                                style={[
                                    styles.upgradeBullet,
                                    { color: theme.colors.onSurfaceDisabled },
                                ]}
                            >
                                • Export reports
                            </Text>
                        </View>

                        <View style={styles.upgradeButtonRow}>
                            <Text
                                style={[
                                    styles.upgradeCta,
                                    { color: theme.colors.accent },
                                ]}
                            >
                                Go to Plans to upgrade →
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            )}

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}

interface StatTileProps {
    label: string;
    value: number;
    icon: string;
}

function StatTile({ label, value, icon }: StatTileProps) {
    const theme = useTheme();

    return (
        <Card style={styles.tile} elevation={0}>
            <Card.Content
                style={[
                    styles.tileContent,
                    {
                        backgroundColor: theme.colors.surface,
                        shadowColor: theme.dark ? '#000' : '#000',
                    },
                ]}
            >
                <View style={styles.tileHeader}>
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={22}
                        color={theme.colors.accent}
                    />

                    {/* Trend placeholder */}
                    <View
                        style={[
                            styles.trendBadge,
                            { backgroundColor: theme.colors.success + '22' },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name="trending-up"
                            size={14}
                            color={theme.colors.success}
                        />
                        <Text
                            style={[
                                styles.trendText,
                                { color: theme.colors.success },
                            ]}
                        >
                            —
                        </Text>
                    </View>
                </View>

                <Text
                    style={[
                        styles.tileValue,
                        { color: theme.colors.onSurface },
                    ]}
                >
                    {value}
                </Text>
                <Text
                    style={[
                        styles.tileLabel,
                        { color: theme.colors.onSurfaceDisabled },
                    ]}
                >
                    {label}
                </Text>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 16, paddingBottom: 32 },

    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 13,
        marginTop: 2,
    },

    errorCard: {
        marginBottom: 12,
        borderRadius: 12,
    },
    errorText: {
        fontSize: 13,
    },

    todayCard: {
        borderRadius: 16,
        marginBottom: 16,
    },
    todayContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    todayLabel: {
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 4,
        fontWeight: '600',
    },
    todayScans: {
        fontSize: 18,
        fontWeight: '700',
    },
    todayPoints: {
        fontSize: 13,
        marginTop: 4,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
        justifyContent: 'space-between',
    },
    tile: {
        width: '48%',
        marginBottom: 12,
        backgroundColor: 'transparent',
    },
    tileContent: {
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 12,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    tileValue: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 4,
    },
    tileLabel: {
        fontSize: 12,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    trendText: {
        marginLeft: 4,
        fontSize: 10,
    },

    card: {
        borderRadius: 16,
        marginBottom: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    scanRow: {
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    scanTitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    scanSubtitle: {
        fontSize: 12,
        marginTop: 2,
    },
    emptyText: {
        fontSize: 13,
        marginTop: 4,
    },

    upgradeCard: {
        borderRadius: 16,
    },
    upgradeTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 4,
    },
    upgradeText: {
        fontSize: 13,
        marginBottom: 8,
    },
    upgradeFeaturesRow: {
        marginBottom: 8,
    },
    upgradeBullet: {
        fontSize: 12,
    },
    upgradeButtonRow: {
        marginTop: 4,
    },
    upgradeCta: {
        fontSize: 13,
        fontWeight: '600',
    },
});