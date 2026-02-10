/**
 * Free Analytics Component - Refactored
 * Uses custom hooks and modular sub-components
 * Displays free tier analytics overview
 */

import { useTheme } from '@/hooks/use-theme-color';
import { SellerStats } from '@/hooks/useAnalytics';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { AnalyticsHeader } from './analytics-header';
import { ErrorBanner } from './error-banner';
import { RecentScansCard } from './recent-scans-card';
import { StatTile } from './stat-tile';
import { TodayCard } from './today-card';
import { UpgradeCard } from './upgrade-card';

interface SellerFreeAIInsightsProps {
    stats: SellerStats | null;
    loading: boolean;
    refreshing: boolean;
    error: string | null;
    onRefresh: () => void;
}

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
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                paddingHorizontal: 6
            }}
            contentContainerStyle={{
                padding: 16,
                paddingBottom: 32,
            }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            {/* Error Banner */}
            {error && <ErrorBanner error={error} />}

            {/* Header */}
            <AnalyticsHeader
                title="Analytics"
                subtitle={`${stats?.seller_name ? stats.seller_name : 'Your shop'} • Overview`}
            />

            {/* Today Summary */}
            <TodayCard today={stats?.today} />

            {/* Stats Grid */}
            <View
                style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    marginBottom: 16,
                    justifyContent: 'space-between',
                }}
            >
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
                    label="Redemptions"
                    value={stats?.total_redemptions ?? 0}
                    icon="gift-outline"
                />
            </View>

            {/* Recent Scans */}
            <RecentScansCard scans={stats?.last_five_scans} />

            {/* Upgrade Card - Free Tier Only */}
            {isFree && <UpgradeCard />}

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}
