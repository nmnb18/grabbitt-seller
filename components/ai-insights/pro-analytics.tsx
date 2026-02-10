/**
 * Pro Analytics Component - Refactored
 * Uses custom hooks and modular sub-components
 * Displays advanced analytics for pro/premium tiers
 */

import React from 'react';
import { RefreshControl, ScrollView } from 'react-native';

import { useTheme } from '@/hooks/use-theme-color';
import { AdvancedAnalytics, useProAnalytics } from '@/hooks/useProAnalytics';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { CustomersCard } from './customers-card';
import { ErrorBanner } from './error-banner';
import { PeakTimesCard } from './peak-times-card';
import { ProAnalyticsHeader } from './pro-analytics-header';
import { ProAnalyticsLocked } from './pro-analytics-locked';
import { RewardFunnelCard } from './reward-funnel-card';
import { TopCustomersCard } from './top-customers-card';
import { TrendChart } from './trend-chart';

interface SellerProAnalyticsInsightsProps {
    data: AdvancedAnalytics | null;
    refreshing: boolean;
    loading: boolean;
    error: string | null;
    tier: 'free' | 'pro' | 'premium';
    onRefresh: () => void;
}

export default function SellerProAnalyticsInsights({
    data,
    refreshing,
    error,
    tier,
    onRefresh,
}: SellerProAnalyticsInsightsProps) {
    const theme = useTheme();
    const isFree = tier === 'free';

    // Use computed values from hook
    const { maxScans7, topHours, topDays, totalQrScans } = useProAnalytics(data);

    // If free, show locked message
    if (isFree) {
        return <ProAnalyticsLocked />;
    }

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

            {/* Header with Tier Badge */}
            <ProAnalyticsHeader sellerName={data?.seller_name} tier={tier} />

            {/* 7-Day Trend Chart */}
            {data?.trends_7d && <TrendChart trends={data.trends_7d} maxScans={maxScans7} />}

            {/* Customers Card - New vs Returning & Segments */}
            <CustomersCard
                newVsReturning={data?.new_vs_returning_30d}
                segments={data?.segments}
            />

            {/* Peak Times Card - Hours & Days */}
            <PeakTimesCard topHours={topHours} topDays={topDays} />

            {/* Top Customers Card */}
            <TopCustomersCard customers={data?.top_customers} />

            {/* Reward Funnel Card */}
            <RewardFunnelCard funnel={data?.reward_funnel} />

            {/* Export Tools Card */}
            <Card
                style={{
                    borderRadius: 16,
                    backgroundColor: theme.colors.surface,
                    marginBottom: 16,
                }}
            >
                <Card.Content>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'baseline',
                            marginBottom: 8,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme.colors.onSurface,
                            }}
                        >
                            Export
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 13,
                            color: theme.colors.onSurface,
                        }}
                    >
                        {data?.export_available
                            ? 'Export detailed analytics as CSV or integrate with your reporting tools (to be implemented).'
                            : 'Exports are available on Premium plans.'}
                    </Text>
                </Card.Content>
            </Card>

            <View style={{ height: 32 }} />
        </ScrollView>
    );
}
