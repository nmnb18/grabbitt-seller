// screens/store/store-details-container.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, useFocusEffect, useNavigation } from "expo-router";

import withSkeletonTransition from "@/components/wrappers/withSkeletonTransition";

import { ApiResponse, StoreDetails } from "@/types/seller";
import api from "@/services/axiosInstance";
import StoreDetailsScreen from "@/components/store/store-details-screen";
import StoreDetailsSkeleton from "@/components/skeletons/store-details";
import { ScreenError, NotFoundError, NetworkError } from "@/components/shared/screen-error";
import { SafeAreaView } from "react-native-safe-area-context";
import { GradientHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";

// Wrap with skeleton transition
const StoreDetailsWithSkeleton = withSkeletonTransition(StoreDetailsSkeleton)(
    StoreDetailsScreen
);

interface StoreDetailsContainerProps {
    loading?: boolean;
    hasData?: boolean;
}

export default function StoreDetailsContainer(props: StoreDetailsContainerProps) {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const theme = useTheme();

    const [store, setStore] = useState<StoreDetails | null>(null);
    const [todayOffer, setTodayOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasData, setHasData] = useState(false);
    const [redemptionCode, setRedemptionCode] = useState();
    const [redemptionStatus, setRedemptionStatus] = useState();
    const [error, setError] = useState<{ type: 'network' | 'notfound' | 'general'; message: string } | null>(null);

    const storeId = params.storeId as string;

    useFocusEffect(
        useCallback(() => {
            fetchStoreDetails();
        }, [storeId]));

    const fetchTodayOffer = async () => {
        try {
            const resp = await api.get(`/getSellerOfferById?seller_id=${storeId}`);
            if (resp.data.active?.length > 0) {
                setTodayOffer(resp.data.active[0]); // today's single entry
            } else {
                setTodayOffer(null);
            }
        } catch (e) {
            console.log("Failed to fetch today's offer");
        }
    };

    const fetchOfferStatus = async () => {
        try {
            const resp = await api.get(`/getTodayOfferStatus?seller_id=${storeId}`);
            if (!resp.data.error) {
                setRedemptionCode(resp.data.redeem_code);
                setRedemptionStatus(resp.data.status);
            }
        } catch (e) {
            console.log("Failed to fetch today's offer status");
        }
    };


    const fetchStoreDetails = async () => {
        if (!storeId) {
            setError({ type: 'general', message: 'Store ID is required' });
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await api.get<ApiResponse>(`/getSellerDetails`, {
                params: { uid: storeId },
            });

            await fetchTodayOffer();
            await fetchOfferStatus();

            if (response.data.success && response.data.user.seller_profile) {
                setStore(response.data.user.seller_profile);
            } else {
                setError({ 
                    type: 'notfound', 
                    message: response.data.error || "Store not found" 
                });
            }
        } catch (err: any) {
            console.error("Store details error:", err);
            
            // Determine error type
            if (err.message?.includes('Network') || err.code === 'ECONNABORTED') {
                setError({ type: 'network', message: 'Network error' });
            } else if (err.response?.status === 404) {
                setError({ type: 'notfound', message: 'Store not found' });
            } else {
                setError({ 
                    type: 'general', 
                    message: err.response?.data?.error || "Failed to load store details" 
                });
            }
        } finally {
            setLoading(false);
            setHasData(true);
        }
    };

    const handleRedeem = async (storeData: StoreDetails) => {
        setLoading(true);
        try {
            const store = await api.get('/getBalanceBySeller', {
                params: {
                    seller_id: storeData.user_id
                }
            })
            if (!store.data.can_redeem) {
                Alert.alert("Redeem", "You don't have enough rewards points! Earn more to redeem points")
                return;
            } else {
                router.push({
                    pathname: "/(drawer)/redeem/redeem-home",
                    params: { store: JSON.stringify(store.data) },
                });
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || "Failed to redeem";
            Alert.alert("Error", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            router.back();
        } else {
            router.replace("/(drawer)/(tabs)/home");
        }
    };

    // Show error states
    if (error && !loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
                <GradientHeader title="Store Details" onBackPress={handleBack} />
                {error.type === 'network' ? (
                    <NetworkError onRetry={fetchStoreDetails} />
                ) : error.type === 'notfound' ? (
                    <NotFoundError itemName="Store" />
                ) : (
                    <ScreenError 
                        title="Unable to Load Store"
                        message={error.message}
                        onRetry={fetchStoreDetails}
                    />
                )}
            </SafeAreaView>
        );
    }

    // Combine container loading with props loading
    const isLoading = loading || props.loading;

    return (
        <StoreDetailsWithSkeleton
            store={store}
            loading={isLoading}
            todayOffer={todayOffer}
            redemptionCode={redemptionCode}
            redemptionStatus={redemptionStatus}
            onBack={handleBack}
            onRedeem={handleRedeem}
            setRedemptionCode={setRedemptionCode}
            setRedemptionStatus={setRedemptionStatus}
            storeId={storeId}
            hasData={hasData}
            {...props}
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});