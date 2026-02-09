import { LoadingOverlay } from "@/components/common";
import { AppHeader } from '@/components/shared/app-header';
import { GradientText } from '@/components/ui/gradient-text';
import { useSubscriptionHistory } from '@/hooks';
import { useTheme } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/store/authStore';
import { AppStyles } from '@/utils/theme';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

export default function SubscriptionHistoryScreen() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);

    const { history, loading, refreshing, fetchHistory, onRefresh } = useSubscriptionHistory();

    useFocusEffect(
        useCallback(() => {
            if (user?.user?.uid) {
                fetchHistory(user.user.uid);
            }
        }, [user?.user?.uid, fetchHistory])
    );

    const handleRefresh = () => {
        if (user?.user?.uid) {
            onRefresh(user.user.uid);
        }
    };

    const getPlanColor = (planId: string) => {
        switch (planId) {
            case 'pro': return '#2196F3';
            case 'premium': return '#FF9800';
            case 'free': return '#4CAF50';
            default: return '#757575';
        }
    };

    const getPlanName = (planId: string) => {
        switch (planId) {
            case 'pro': return 'Pro Plan';
            case 'premium': return 'Premium Plan';
            case 'free': return 'Free Plan';
            default: return planId;
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';

        try {
            // Handle Firestore timestamp
            const date = timestamp._seconds
                ? new Date(timestamp._seconds * 1000)
                : new Date(timestamp);

            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatAmount = (amount: number) => {
        return `₹${amount}`;
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return '#4CAF50';
            case 'failed': return '#F44336';
            case 'pending': return '#FF9800';
            case 'refunded': return '#9C27B0';
            default: return '#757575';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'Success';
            case 'failed': return 'Failed';
            case 'pending': return 'Pending';
            case 'refunded': return 'Refunded';
            default: return status;
        }
    };

    const formattedHistory = useMemo(
        () =>
            history.map((item) => ({
                ...item,
                planName: getPlanName(item.plan_id),
                planColor: getPlanColor(item.plan_id),
                statusText: getStatusText(item.status),
                statusColor: getStatusColor(item.status),
                paidAtText: formatDate(item.paid_at),
                expiresAtText: formatDate(item.expires_at),
                amountText: formatAmount(item.amount),
                originalAmountText: formatAmount(item.original_amount),
                discountAmountText: formatAmount(item.coupon?.discount_amount || 0),
            })),
        [history]
    );

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
                <AppHeader />
                <LoadingOverlay visible={loading} message="Loading subscription history..." />
            </View>
        );
    }

    const renderHeader = () => (
        <Text
            variant="headlineSmall"
            style={{ textAlign: 'center', marginBottom: AppStyles.spacing.xl, fontWeight: '700', color: theme.colors.onBackground }}
        >
            Subscription History
        </Text>
    );

    const renderEmpty = () => (
        <Card style={{ borderRadius: 12, backgroundColor: theme.colors.surface, marginTop: AppStyles.spacing.xl }}>
            <Card.Content style={{ alignItems: 'center', paddingVertical: AppStyles.spacing.xl }}>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurface, marginBottom: AppStyles.spacing.sm, textAlign: 'center' }}>
                    No subscription history found
                </Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurface, textAlign: 'center' }}>
                    Your subscription purchases will appear here
                </Text>
            </Card.Content>
        </Card>
    );

    const renderItem = ({ item }: { item: any }) => (
        <Card style={{ borderRadius: 12, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.outline }} elevation={2}>
            <Card.Content>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: AppStyles.spacing.sm }}>
                    <View style={{ flex: 1, gap: AppStyles.spacing.xs }}>
                        <Text
                            variant="titleMedium"
                            style={{ fontWeight: '600', color: item.planColor }}
                        >
                            {item.planName}
                        </Text>
                        <Chip
                            mode="flat"
                            style={{ alignSelf: 'flex-start', backgroundColor: item.statusColor + '20' }}
                            textStyle={{ fontSize: 12, fontWeight: '600', color: item.statusColor }}
                        >
                            {item.statusText}
                        </Chip>
                    </View>
                    <GradientText style={{ fontWeight: '700', fontSize: 24 }}>
                        {item.amountText}
                    </GradientText>
                </View>

                {item.coupon?.discount_amount > 0 && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: AppStyles.spacing.xs }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled, textDecorationLine: 'line-through' }}>
                            Original: {item.originalAmountText}
                        </Text>
                        <Text variant="bodySmall" style={{ color: '#4CAF50', fontWeight: '600' }}>
                            Saved: {item.discountAmountText}
                        </Text>
                    </View>
                )}

                {item.coupon_used && (
                    <View style={{ marginBottom: AppStyles.spacing.md }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.primary, fontWeight: '500' }}>
                            Coupon: {item.coupon_used}
                        </Text>
                    </View>
                )}

                <View style={{ gap: AppStyles.spacing.sm, paddingTop: AppStyles.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.outline }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled, fontWeight: '500' }}>
                            Order ID
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurface, flex: 1, textAlign: 'right', marginLeft: AppStyles.spacing.sm }}>
                            {item.internal_order_id}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled, fontWeight: '500' }}>
                            Payment ID
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurface, flex: 1, textAlign: 'right', marginLeft: AppStyles.spacing.sm }}>
                            {item.razorpay_payment_id || 'N/A'}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled, fontWeight: '500' }}>
                            Purchased On
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurface, flex: 1, textAlign: 'right', marginLeft: AppStyles.spacing.sm }}>
                            {item.paidAtText}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceDisabled, fontWeight: '500' }}>
                            Expires On
                        </Text>
                        <Text variant="bodySmall" style={{ color: theme.colors.error, flex: 1, textAlign: 'right', marginLeft: AppStyles.spacing.sm }}>
                            {item.expiresAtText}
                        </Text>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader />
            <FlatList
                data={formattedHistory}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.id || `${item.internal_order_id || index}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ padding: AppStyles.spacing.lg, paddingBottom: 0, gap: AppStyles.spacing.md }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={<View style={{ height: 30 }} />}
            />
        </View>
    );
}