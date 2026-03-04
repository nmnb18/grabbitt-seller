import { ButtonRow, PlanCard } from '@/components/common';
import { GradientHeader } from '@/components/shared/app-header';
import { SubscriptionLegalFooter } from '@/components/shared/subscription-legal-footer';
import { Button } from '@/components/ui/paper-button';
import { useTheme } from '@/hooks/use-theme-color';
import { restoreIOSPurchases } from '@/services/iap';
import { useAuthStore } from '@/store/authStore';
import { PLANS } from '@/utils/constant';
import { AppStyles } from '@/utils/theme';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

export default function SubscriptionScreen() {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);

    const subscription = user?.user?.seller_profile?.subscription;
    const currentTier = subscription?.tier ?? 'free';
    const expiryDate = subscription?.expires_at
        ? new Date(subscription?.expires_at._seconds * 1000)
        : null;

    const sortedPlans = useMemo(() => {
        const activePlan = PLANS.find((p) => p.id === currentTier);
        const others = PLANS.filter((p) => p.id !== currentTier);
        return activePlan ? [activePlan, ...others] : PLANS;
    }, [currentTier]);

    const handleRestorePurchase = async () => {
        try {
            setLoading(true);

            await restoreIOSPurchases();

            Alert.alert(
                "Restore initiated",
                "If you have an active subscription, it will be restored shortly."
            );
        } catch (err: any) {
            Alert.alert(
                "Restore failed",
                err?.message || "Unable to restore purchases."
            );
        } finally {
            setLoading(false);
        }
    }

    const renderHeader = () => (
        <Text variant="headlineSmall" style={styles.title}>
            Choose your plan
        </Text>
    );

    const renderFooter = () => (
        <View>
            {Platform.OS === "ios" && <SubscriptionLegalFooter />}
            {Platform.OS === 'ios' && (
                <ButtonRow vertical>
                    <Button
                        variant="outlined"
                        size="medium"
                        fullWidth
                        loading={loading}
                        onPress={handleRestorePurchase}
                    >
                        Restore Purchase
                    </Button>
                </ButtonRow>
            )}
            <View style={{ height: 100 }} />
        </View>
    );

    const renderItem = ({ item: plan }: { item: (typeof PLANS)[number] }) => {
        const isCurrent = plan.id === currentTier;
        const isLocked = currentTier !== 'free' && !isCurrent;

        return (
            <PlanCard
                name={plan.name}
                price={plan.price}
                features={plan.features}
                color={plan.color}
                isCurrent={isCurrent}
                isLocked={isLocked}
                expiryDate={expiryDate}
                onBuy={() => {
                    if (!isCurrent && currentTier === 'free') {
                        router.push({
                            pathname: '/(drawer)/checkout',
                            params: { planId: plan.id }
                        });
                    }
                }}
            >
                {!isCurrent && currentTier === 'free' && (
                    <Button
                        variant="contained"
                        size="medium"
                        fullWidth
                        onPress={() => {
                            router.push({
                                pathname: '/(drawer)/checkout',
                                params: { planId: plan.id }
                            });
                        }}
                    >
                        Buy Now
                    </Button>
                )}
            </PlanCard>
        );
    };

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <GradientHeader title='Subscriptions' />

            <FlatList
                data={sortedPlans}
                renderItem={renderItem}
                keyExtractor={(plan) => plan.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
            />
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
            marginBottom: AppStyles.spacing.md,
            fontWeight: '700',
            color: theme.colors.onBackground,
        },
    });