import { AppHeader } from '@/components/shared/app-header';
import { useTheme } from '@/hooks/use-theme-color';
import { useAuthStore } from '@/store/authStore';
import { PLANS } from '@/utils/constant';
import { AppStyles } from '@/utils/theme';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Chip, Text } from 'react-native-paper';

export default function SubscriptionScreen() {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const router = useRouter();
    const { user } = useAuthStore();

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

    return (
        <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
            <AppHeader />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >
                <Text variant="headlineSmall" style={styles.title}>
                    Choose your plan
                </Text>

                {sortedPlans.map((plan) => {
                    const isCurrent = plan.id === currentTier;
                    const isLocked = currentTier !== 'free' && !isCurrent;

                    return (
                        <Card
                            key={plan.id}
                            style={[
                                styles.card,
                                isCurrent && { borderColor: plan.color, borderWidth: 1 },
                            ]}
                            elevation={1}
                        >
                            <Card.Content>
                                <View style={styles.rowBetween}>
                                    <Text
                                        variant="titleLarge"
                                        style={[styles.planName, { color: plan.color }]}
                                    >
                                        {plan.name}
                                    </Text>

                                    <Text variant="bodyMedium" style={styles.price}>
                                        {plan.price}
                                    </Text>
                                </View>

                                <View style={styles.features}>
                                    {plan.features.map((f, i) => (
                                        <Text key={i} style={styles.feature}>
                                            • {f}
                                        </Text>
                                    ))}
                                </View>

                                {isCurrent && expiryDate && (
                                    <Text style={styles.expiryText}>
                                        Expires on: {expiryDate.toLocaleDateString()}
                                    </Text>
                                )}

                                {isCurrent && (
                                    <View style={styles.ribbonContainer}>
                                        <Chip
                                            mode="flat"
                                            style={[
                                                styles.ribbon,
                                                { backgroundColor: plan.color + '40', alignSelf: 'center' },

                                            ]}
                                            textStyle={[styles.ribbonText, { color: theme.colors.onBackground }]}
                                        >
                                            Current Active Plan
                                        </Chip>
                                    </View>
                                )}

                                {!isCurrent && currentTier === 'free' && (
                                    <Button
                                        mode="contained"
                                        buttonColor={plan.color}
                                        style={styles.buyBtn}
                                        onPress={() => router.push({
                                            pathname: '/(drawer)/checkout',
                                            params: { planId: plan.id }
                                        })}
                                    >
                                        Buy Now
                                    </Button>
                                )}

                                {isLocked && (
                                    <Text style={styles.lockedText}>
                                        You can purchase another plan after your current plan expires.
                                    </Text>
                                )}
                            </Card.Content>
                        </Card>
                    );
                })}

                <View style={{ height: 100 }} />
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
            marginBottom: AppStyles.spacing.md,
            fontWeight: '700',
            color: theme.colors.onBackground,
        },
        card: {
            marginBottom: AppStyles.spacing.lg,
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
        },
        rowBetween: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        planName: {
            ...AppStyles.typography.heading,
            color: theme.colors.primary,
        },
        price: {
            ...AppStyles.typography.subheading,
            color: theme.colors.onSurface,
        },
        features: {
            marginVertical: AppStyles.spacing.md,
        },
        feature: {
            marginBottom: 4,
            color: theme.colors.onSurface,
        },
        buyBtn: {
            borderRadius: 8,
            marginTop: 10,
        },
        expiryText: {
            color: theme.colors.accent,
            fontSize: 13,
            marginBottom: 10,
        },
        ribbonContainer: {
            width: '100%',
            marginBottom: 10,
        },
        ribbon: {
            justifyContent: 'center',
            height: 38,
        },
        ribbonText: {
            fontWeight: '600',
        },
        lockedText: {
            color: theme.colors.warning,
            fontSize: 12,
            textAlign: 'center',
            marginTop: 8,
        },
    });