import { AppHeader } from '@/components/shared/app-header';
import { GradientText } from '@/components/ui/gradient-text';
import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { AppStyles } from '@/utils/theme';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Chip, Text } from 'react-native-paper';

interface SubscriptionHistory {
    id: string;
    internal_order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    plan_id: string;
    amount: number;
    original_amount: number;
    coupon: {
        discount_amount: number;
    };
    status: string;
    paid_at: any; // Firestore Timestamp
    expires_at: any; // Firestore Timestamp
    environment: string;
    coupon_used?: string;
    created_at?: any;
}

export default function SubscriptionHistoryScreen() {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const { user } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [history, setHistory] = useState<SubscriptionHistory[]>([]);

    const fetchSubscriptionHistory = useCallback(async () => {
        if (!user?.user?.uid) return;

        try {
            setLoading(true);
            const response = await api.get(`/getSubscriptionHistory?sellerId=${user.user.uid}`);

            if (response.data.success) {
                setHistory(response.data.history);
            } else {
                Alert.alert('Error', 'Failed to fetch subscription history');
            }
        } catch (error: any) {
            console.error('Subscription history error:', error);
            Alert.alert('Error', 'Failed to load subscription history');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.user?.uid]);

    useFocusEffect(
        useCallback(() => {
            fetchSubscriptionHistory();
        }, [fetchSubscriptionHistory])
    );

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSubscriptionHistory();
    }, [fetchSubscriptionHistory]);

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

    if (loading) {
        return (
            <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
                <AppHeader />
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={styles.loaderText}>Loading subscription history...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <AppHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                    />
                }
            >
                <Text variant="headlineSmall" style={styles.title}>
                    Subscription History
                </Text>

                {history.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content style={styles.emptyContent}>
                            <Text variant="titleMedium" style={styles.emptyText}>
                                No subscription history found
                            </Text>
                            <Text variant="bodyMedium" style={styles.emptySubtext}>
                                Your subscription purchases will appear here
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    <View style={styles.historyList}>
                        {history.map((item, index) => (
                            <Card key={item.id || index} style={styles.historyCard} elevation={2}>
                                <Card.Content>
                                    {/* Header Row */}
                                    <View style={styles.cardHeader}>
                                        <View style={styles.planInfo}>
                                            <Text
                                                variant="titleMedium"
                                                style={[styles.planName, { color: getPlanColor(item.plan_id) }]}
                                            >
                                                {getPlanName(item.plan_id)}
                                            </Text>
                                            <Chip
                                                mode="flat"
                                                style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
                                                textStyle={[styles.statusText, { color: getStatusColor(item.status) }]}
                                            >
                                                {getStatusText(item.status)}
                                            </Chip>
                                        </View>
                                        <GradientText style={styles.amount}>
                                            {formatAmount(item.amount)}
                                        </GradientText>
                                    </View>

                                    {/* Discount Info */}
                                    {item.coupon?.discount_amount > 0 && (
                                        <View style={styles.discountRow}>
                                            <Text variant="bodySmall" style={styles.originalAmount}>
                                                Original: {formatAmount(item.original_amount)}
                                            </Text>
                                            <Text variant="bodySmall" style={styles.discountAmount}>
                                                Saved: {formatAmount(item.coupon?.discount_amount)}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Coupon Info */}
                                    {item.coupon_used && (
                                        <View style={styles.couponRow}>
                                            <Text variant="bodySmall" style={styles.couponText}>
                                                Coupon: {item.coupon_used}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Order Details */}
                                    <View style={styles.detailsGrid}>
                                        <View style={styles.detailItem}>
                                            <Text variant="bodySmall" style={styles.detailLabel}>
                                                Order ID
                                            </Text>
                                            <Text variant="bodySmall" style={styles.detailValue}>
                                                {item.internal_order_id}
                                            </Text>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <Text variant="bodySmall" style={styles.detailLabel}>
                                                Payment ID
                                            </Text>
                                            <Text variant="bodySmall" style={styles.detailValue}>
                                                {item.razorpay_payment_id || 'N/A'}
                                            </Text>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <Text variant="bodySmall" style={styles.detailLabel}>
                                                Purchased On
                                            </Text>
                                            <Text variant="bodySmall" style={styles.detailValue}>
                                                {formatDate(item.paid_at)}
                                            </Text>
                                        </View>

                                        <View style={styles.detailItem}>
                                            <Text variant="bodySmall" style={styles.detailLabel}>
                                                Expires On
                                            </Text>
                                            <Text variant="bodySmall" style={[styles.detailValue, { color: theme.colors.error }]}>
                                                {formatDate(item.expires_at)}
                                            </Text>
                                        </View>


                                    </View>
                                </Card.Content>
                            </Card>
                        ))}
                    </View>
                )}

                <View style={{ height: 30 }} />
            </ScrollView>
        </View>
    );
}

const createStyles = (theme: any) =>
    StyleSheet.create({
        screen: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollContainer: {
            padding: AppStyles.spacing.lg,
            paddingBottom: 0,
        },
        title: {
            textAlign: 'center',
            marginBottom: AppStyles.spacing.xl,
            fontWeight: '700',
            color: theme.colors.onBackground,
        },
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: AppStyles.spacing.md,
        },
        loaderText: {
            color: theme.colors.onBackground,
            fontSize: 16,
        },
        emptyCard: {
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            marginTop: AppStyles.spacing.xl,
        },
        emptyContent: {
            alignItems: 'center',
            paddingVertical: AppStyles.spacing.xl,
        },
        emptyText: {
            color: theme.colors.onSurface,
            marginBottom: AppStyles.spacing.sm,
            textAlign: 'center',
        },
        emptySubtext: {
            color: theme.colors.onSurfaceVariant,
            textAlign: 'center',
        },
        historyList: {
            gap: AppStyles.spacing.md,
        },
        historyCard: {
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.outline,
        },
        cardHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: AppStyles.spacing.sm,
        },
        planInfo: {
            flex: 1,
            gap: AppStyles.spacing.xs,
        },
        planName: {
            fontWeight: '600',
        },
        amount: {
            fontWeight: '700',
            fontSize: 24
        },
        statusChip: {
            alignSelf: 'flex-start',
        },
        statusText: {
            fontSize: 12,
            fontWeight: '600',
        },
        discountRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: AppStyles.spacing.xs,
        },
        originalAmount: {
            color: theme.colors.onSurfaceDisabled,
            textDecorationLine: 'line-through',
        },
        discountAmount: {
            color: '#4CAF50',
            fontWeight: '600',
        },
        couponRow: {
            marginBottom: AppStyles.spacing.md,
        },
        couponText: {
            color: theme.colors.primary,
            fontWeight: '500',
        },
        detailsGrid: {
            gap: AppStyles.spacing.sm,
            paddingTop: AppStyles.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.outline,
        },
        detailItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        detailLabel: {
            color: theme.colors.onSurfaceDisabled,
            fontWeight: '500',
        },
        detailValue: {
            color: theme.colors.onSurface,
            flex: 1,
            textAlign: 'right',
            marginLeft: AppStyles.spacing.sm,
        },
        envChip: {
            borderColor: theme.colors.outline,
        },
        envText: {
            fontSize: 11,
            fontWeight: '600',
        },
    });