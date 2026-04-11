import { analyticsApi } from "@/services";
import { useQuery } from "@tanstack/react-query";

export type SellerStats = {
    total_users: number;
    total_qrs: number;
    total_scanned: number;
    total_points_issued: number;
    total_redemptions: number;
    seller_name: string;
    today?: any;
    last_five_scans?: any[];
    subscription_tier?: string;
};

export function useSellerStats() {
    const query = useQuery<SellerStats>({
        queryKey: ["seller-stats"], // 🔥 shared cache key
        queryFn: async () => {
            const data = await analyticsApi.sellerStats();

            if (!data || typeof data !== "object") {
                throw new Error("Failed to load stats");
            }

            return data as SellerStats;
        },

        // ------------------------------
        // caching strategy (your requirement)
        // ------------------------------
        staleTime: Infinity,          // never auto refetch
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    return {
        stats: query.data ?? null,
        loading: query.isLoading,
        refreshing: query.isFetching && !query.isLoading,
        error: query.error ? (query.error as Error).message : null,
        hasData: !!query.data,
        refetch: query.refetch,
    };
}
