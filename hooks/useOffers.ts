/**
 * useOffers Hook
 * Manages seller offers (active, upcoming, expired)
 * Used by: whats-new-home.tsx, offer-add.tsx
 */

import { offersApi } from "@/services";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

export interface Offer {
    id: string;
    title: string;
    min_spend: number;
    terms?: string;
}

export interface OfferDoc {
    id?: string;
    date: string;
    offers: Offer[];
}

interface UseOffersReturn {
    active: OfferDoc[];
    upcoming: OfferDoc[];
    expired: OfferDoc[];
    loading: boolean;
    refreshing: boolean;
    deleting: string | null;
    fetchOffers: () => Promise<void>;
    onRefresh: () => Promise<void>;
    deleteOffer: (date: string) => Promise<void>;
    loadExistingOffer: (date: string) => Promise<OfferDoc | null>;
}

export function useOffers(): UseOffersReturn {
    const [active, setActive] = useState<OfferDoc[]>([]);
    const [upcoming, setUpcoming] = useState<OfferDoc[]>([]);
    const [expired, setExpired] = useState<OfferDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchOffers = useCallback(async () => {
        try {
            setLoading(true);
            const resp = await offersApi.getSellerOffers();

            if (resp?.success) {
                setActive(resp.active || resp.data?.active || []);
                setUpcoming(resp.upcoming || resp.data?.upcoming || []);
                setExpired(resp.expired || resp.data?.expired || []);
            }
        } catch (err) {
            console.error("getSellerOffers error:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchOffers();
    }, [fetchOffers]);

    const deleteOffer = useCallback(async (date: string) => {
        try {
            setDeleting(date);
            const resp = await offersApi.deleteSellerOffer(date);

            if (!resp?.success) {
                throw new Error(resp?.error || "Delete failed");
            }

            Alert.alert("Deleted", "Offer deleted successfully");
            await fetchOffers();
        } catch (err: any) {
            Alert.alert(
                "Error",
                err?.message || err?.response?.data?.error || "Failed to delete"
            );
        } finally {
            setDeleting(null);
        }
    }, [fetchOffers]);

    const loadExistingOffer = useCallback(async (date: string): Promise<OfferDoc | null> => {
        try {
            setLoading(true);
            const resp = await offersApi.getSellerOffers();

            if (resp?.success) {
                const allOffers = [
                    ...(resp.active || resp.data?.active || []),
                    ...(resp.upcoming || resp.data?.upcoming || []),
                ];

                const existingOffer = allOffers.find((o: any) => o.date === date);
                return existingOffer || null;
            }
            return null;
        } catch (err) {
            console.error("Load offer error:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        active,
        upcoming,
        expired,
        loading,
        refreshing,
        deleting,
        fetchOffers,
        onRefresh,
        deleteOffer,
        loadExistingOffer,
    };
}
