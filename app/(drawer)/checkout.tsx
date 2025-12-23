import { AppHeader } from '@/components/shared/app-header';
import { Button } from '@/components/ui/paper-button';
import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { requestIOSPurchase } from "@/services/iap";
import { clearIAPCallbacks, setIAPCallbacks } from '@/services/iapState';
import { useAuthStore } from '@/store/authStore';
import { PLANS } from '@/utils/constant';
import { AppStyles } from '@/utils/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Divider, Text, TextInput } from 'react-native-paper';
import RazorpayCheckout from 'react-native-razorpay';

export default function CheckoutScreen() {
    const theme = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);
    const router = useRouter();
    const params = useLocalSearchParams();

    const { user, fetchUserDetails } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [applyingCoupon, setApplyingCoupon] = useState(false);

    // Get selected plan from params
    const selectedPlanId = params.planId as string;
    const selectedPlan = PLANS.find(plan => plan.id === selectedPlanId);
    const productIdMap: Record<string, string> = {
        pro: "seller_pro_30d",
        premium: "seller_premium_1yr",
    };

    if (!selectedPlan || selectedPlan.id === 'free') {
        return (
            <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
                <AppHeader />
                <View style={styles.errorContainer}>
                    <Text variant="titleMedium">Invalid plan selected</Text>
                    <Button
                        variant="contained"
                        onPress={() => router.back()}
                    >
                        Go Back
                    </Button>
                </View>
            </View>
        );
    }

    // Calculate prices
    const originalPrice = parseFloat(selectedPlan.price.replace('₹', ''));
    const discount = appliedCoupon?.discountAmount || 0;
    const finalAmount = Math.max(originalPrice - discount, 0);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            Alert.alert('Error', 'Please enter a coupon code');
            return;
        }

        setApplyingCoupon(true);
        try {
            const response = await api.post('/applyCoupon', {
                couponCode: couponCode.trim(),
                planId: selectedPlan.id,
                sellerId: user?.user.uid,
            });

            if (response.data.success) {
                setAppliedCoupon(response.data.coupon);
                Alert.alert('Success', `Coupon applied! ${response.data.coupon.discountValue} discount`);
            } else {
                Alert.alert('Invalid Coupon', response.data.message);
            }
        } catch (error: any) {
            console.error('Coupon error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to apply coupon');
        } finally {
            setApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
    };

    const handleProceedToPayment = async () => {
        if (Platform.OS === "ios") {
            await handleIOSPayment();
        } else {
            await handleAndroidRazorpayPayment();
        }
    };

    const handleIOSPayment = async () => {
        try {
            setLoading(true);

            const appleProductId = productIdMap[selectedPlan.id];
            if (!appleProductId) {
                Alert.alert("Error", "Plan not available on iOS.");
                return;
            }

            // This will trigger Apple sheet. When purchase succeeds,
            // purchaseUpdatedListener (initIAP) will call your backend verify.
            await requestIOSPurchase(appleProductId);
        } catch (err: any) {
            console.error("IAP error:", err);
            Alert.alert("Error", err?.message || "Purchase failed.");
        } finally {
            setLoading(false);
        }
    };



    const handleAndroidRazorpayPayment = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/createOrder`, {
                planId: selectedPlan.id,
                sellerId: user?.user.uid,
                couponCode: appliedCoupon?.code,
            });

            const { order_id, key_id, amount, currency } = response.data;

            const options = {
                description: `Grabbitt ${selectedPlan.name} Plan`,
                currency,
                key: key_id,
                amount: amount.toString(),
                name: 'Grabbitt',
                order_id,
                prefill: {
                    email: user?.user.email,
                    contact: user?.user.phone,
                    name: user?.user.name,
                },
                theme: { color: theme.colors.primary },
            };

            RazorpayCheckout.open(options)
                .then(async (data) => {
                    setVerifying(true);

                    const verifyRes = await api.post(`/verifyPayment`, {
                        ...data,
                        sellerId: user?.user.uid,
                        planId: selectedPlan.id,
                        couponCode: appliedCoupon?.code,
                    });

                    if (verifyRes.data.success) {
                        await fetchUserDetails(user?.user.uid ?? '', 'seller');

                        setLoading(false);
                        setVerifying(false);

                        router.replace({
                            pathname: '/(drawer)/payment-sucess',
                            params: {
                                orderId: verifyRes.data.subscription.order_id,
                                plan: selectedPlan.id,
                                expiresAt: verifyRes.data.subscription.expires_at,
                                finalAmount: finalAmount.toString(),
                                couponUsed: appliedCoupon?.code || 'none',
                            },
                        });
                    } else {
                        setLoading(false);
                        setVerifying(false);
                        Alert.alert('Verification Failed', verifyRes.data.error);
                    }
                })
                .catch((error) => {
                    setLoading(false);
                    setVerifying(false);
                    console.error('Razorpay Error:', error);
                    Alert.alert('Payment Failed', error.description);
                });
        } catch (error) {
            console.error('Payment flow error:', error);
            Alert.alert('Error', 'Unable to start payment.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Platform.OS !== "ios") return;

        setIAPCallbacks({
            onVerifying: () => {
                setVerifying(true);
            },
            onSuccess: async (data: any) => {
                setVerifying(false);
                setLoading(false);

                await fetchUserDetails(user?.user.uid ?? "", "seller");

                router.replace({
                    pathname: "/(drawer)/payment-sucess",
                    params: {
                        orderId: data.subscription.order_id,
                        plan: selectedPlan.id,
                        expiresAt: data.subscription.expires_at,
                    },
                });
            },
            onError: (err) => {
                setVerifying(false);
                setLoading(false);
                Alert.alert(
                    "Payment Failed",
                    err?.message || "Verification failed"
                );
            },
        });

        return () => {
            clearIAPCallbacks();
        };
    }, []);



    if (verifying) {
        return (
            <View style={[styles.loaderWrapper]}>
                <AppHeader />
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ color: theme.colors.onBackground }}>
                        Please wait! Verifying your payment...
                    </Text>
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
            >
                <Text variant="headlineSmall" style={styles.title}>
                    Checkout
                </Text>

                {/* Order Summary Card */}
                <Card style={styles.card} elevation={2}>
                    <Card.Content>
                        <Text variant="titleMedium" style={styles.sectionTitle}>
                            Order Summary
                        </Text>

                        <View style={styles.planSummary}>
                            <View style={styles.planHeader}>
                                <Text variant="titleLarge" style={[styles.planName, { color: selectedPlan.color }]}>
                                    {selectedPlan.name}
                                </Text>
                                <Text variant="titleMedium" style={styles.originalPrice}>
                                    ₹{originalPrice}
                                </Text>
                            </View>

                            <View style={styles.features}>
                                {selectedPlan.features.map((feature, index) => (
                                    <Text key={index} style={styles.feature}>
                                        • {feature}
                                    </Text>
                                ))}
                            </View>
                        </View>

                        <Divider style={styles.divider} />

                        {/* Coupon Section */}
                        {Platform.OS === "android" && <View style={styles.couponSection}>
                            <Text variant="titleMedium" style={styles.sectionTitle}>
                                Apply Coupon
                            </Text>

                            {!appliedCoupon ? (
                                <View style={styles.couponInputRow}>
                                    <TextInput
                                        mode="outlined"
                                        placeholder="Enter coupon code"
                                        value={couponCode}
                                        onChangeText={setCouponCode}
                                        style={styles.couponInput}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.primary}
                                    />
                                    <Button
                                        variant="contained"
                                        onPress={handleApplyCoupon}
                                        loading={applyingCoupon}
                                        disabled={applyingCoupon || !couponCode.trim()}
                                    >
                                        Apply
                                    </Button>
                                </View>
                            ) : (
                                <View style={styles.appliedCoupon}>
                                    <View style={styles.couponInfo}>
                                        <Text variant="bodyMedium" style={styles.couponCode}>
                                            {appliedCoupon.code}
                                        </Text>
                                        <Text variant="bodySmall" style={styles.couponDiscount}>
                                            -₹{appliedCoupon.discountAmount}
                                        </Text>
                                    </View>
                                    <Button
                                        variant="text"
                                        onPress={handleRemoveCoupon}
                                    >
                                        Remove
                                    </Button>
                                </View>
                            )}
                        </View>}

                        {Platform.OS === "android" && <Divider style={styles.divider} />}

                        {/* Price Breakdown */}
                        <View style={styles.priceBreakdown}>
                            <View style={styles.priceRow}>
                                <Text variant="bodyMedium">Plan Price</Text>
                                <Text variant="bodyMedium">₹{originalPrice}</Text>
                            </View>

                            {appliedCoupon && (
                                <View style={styles.priceRow}>
                                    <Text variant="bodyMedium">Discount</Text>
                                    <Text variant="bodyMedium" style={styles.discountText}>
                                        -₹{discount}
                                    </Text>
                                </View>
                            )}

                            <Divider style={styles.thinDivider} />

                            <View style={[styles.priceRow, styles.totalRow]}>
                                <Text variant="titleMedium" style={styles.totalLabel}>
                                    Total Amount
                                </Text>
                                <Text variant="titleMedium" style={styles.totalAmount}>
                                    ₹{finalAmount}
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Payment Button */}
                <View style={styles.paymentSection}>
                    <Button
                        variant="contained"
                        onPress={handleProceedToPayment}
                        loading={loading}
                        disabled={loading}
                    >
                        {`Proceed to Payment - ₹${finalAmount}`}
                    </Button>

                    <Button
                        variant="outlined"
                        onPress={() => router.replace('/(drawer)/subscription')}
                        disabled={loading}
                    >
                        Back to Plans
                    </Button>
                </View>

                <View style={{ height: 50 }} />
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
        card: {
            borderRadius: 16,
            backgroundColor: theme.colors.surface,
            marginBottom: AppStyles.spacing.lg,
        },
        sectionTitle: {
            marginBottom: AppStyles.spacing.md,
            fontWeight: '600',
            color: theme.colors.onSurface,
        },
        planSummary: {
            marginBottom: AppStyles.spacing.md,
        },
        planHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: AppStyles.spacing.sm,
        },
        planName: {
            fontWeight: '700',
            flex: 1,
        },
        originalPrice: {
            fontWeight: '600',
            color: theme.colors.onSurface,
        },
        features: {
            marginLeft: AppStyles.spacing.sm,
        },
        feature: {
            marginBottom: 4,
            color: theme.colors.onBackground,
            fontSize: 14,
        },
        divider: {
            marginVertical: AppStyles.spacing.lg,
            backgroundColor: theme.colors.accent,
        },
        thinDivider: {
            marginVertical: AppStyles.spacing.md,
            backgroundColor: theme.colors.accent,
        },
        couponSection: {
            marginBottom: AppStyles.spacing.md,
        },
        couponInputRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: AppStyles.spacing.sm,
        },
        couponInput: {
            flex: 1,
            backgroundColor: theme.colors.surface,
        },
        applyButton: {
            minWidth: 80,
        },
        appliedCoupon: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: theme.colors.surfaceVariant,
            padding: AppStyles.spacing.md,
            borderRadius: 8,
        },
        couponInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: AppStyles.spacing.sm,
        },
        couponCode: {
            fontWeight: '600',
            color: theme.colors.primary,
        },
        couponDiscount: {
            color: theme.colors.success,
            fontWeight: '600',
        },
        priceBreakdown: {
            gap: AppStyles.spacing.sm,
        },
        priceRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        discountText: {
            color: theme.colors.success,
            fontWeight: '600',
        },
        totalRow: {
            marginTop: AppStyles.spacing.sm,
        },
        totalLabel: {
            fontWeight: '700',
            color: theme.colors.onSurface,
        },
        totalAmount: {
            fontWeight: '700',
            color: theme.colors.primary,
            fontSize: 20,
        },
        paymentSection: {
            gap: AppStyles.spacing.md,
            marginTop: AppStyles.spacing.lg,
        },
        paymentButton: {
            borderRadius: 12,
            paddingVertical: 4,
        },
        paymentButtonContent: {
            paddingVertical: 8,
        },
        backButton: {
            borderRadius: 12,
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: AppStyles.spacing.lg,
            padding: AppStyles.spacing.xl,
        },
        loaderWrapper: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        loaderContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
        },
    });