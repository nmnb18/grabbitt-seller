/**
 * useRedemptions Hook
 * Manages seller redemptions and redeemed perks
 * Used by: whats-new-home.tsx, redemptions.tsx
 */

import { offersApi, sellerRedemptionsApi } from "@/services";
import { useCallback, useState } from "react";

export interface PerkItem {
    id: string;
    customer_name: string;
    offer_title: string;
    redeem_code: string;
    min_spend: number;
    status: string;
}

export interface Redemption {
    redemption_id: string;
    offer_name?: string;
    points: string;
    status: "pending" | "approved" | "cancelled" | string;
    user_name: string;
    user_email: string;
    seller_shop_name: string;
    created_at: any;
}

interface UseRedemptionsReturn {
    redeemed: PerkItem[];
    loadingRedeemed: boolean;
    redeemedOpen: boolean;
    setRedeemedOpen: (open: boolean) => void;
    fetchRedeemed: () => Promise<void>;
}

export function useRedemptions(): UseRedemptionsReturn {
    const [redeemed, setRedeemed] = useState<PerkItem[]>([]);
    const [loadingRedeemed, setLoadingRedeemed] = useState(false);
    const [redeemedOpen, setRedeemedOpen] = useState(false);

    const fetchRedeemed = useCallback(async () => {
        try {
            setLoadingRedeemed(true);
            const resp = await offersApi.getSellerRedeemedPerks();

            if (resp?.success) {
                setRedeemed(resp.perks || resp.data?.perks || []);
            }
        } catch (e) {
            console.error("redeemed error", e);
        } finally {
            setLoadingRedeemed(false);
        }
    }, []);

    return {
        redeemed,
        loadingRedeemed,
        redeemedOpen,
        setRedeemedOpen,
        fetchRedeemed,
    };
}

interface UseSellerRedemptionsReturn {
    redemptions: Redemption[];
    stats: any;
    loading: boolean;
    refreshing: boolean;
    fetchRedemptions: () => Promise<void>;
    onRefresh: () => Promise<void>;
}

export function useSellerRedemptions(): UseSellerRedemptionsReturn {
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchRedemptions = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await sellerRedemptionsApi.getSellerRedemptions();

            if (resp?.success) {
                setRedemptions(resp.redemptions || resp.data?.redemptions || []);
                setStats(resp.stats || resp.data?.stats || []);
            }
        } catch (error) {
            console.log("Redemption fetch error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchRedemptions();
    }, [fetchRedemptions]);

    return {
        redemptions,
        stats,
        loading,
        refreshing,
        fetchRedemptions,
        onRefresh,
    };
}
