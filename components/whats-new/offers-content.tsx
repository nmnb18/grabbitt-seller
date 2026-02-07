import { InfoBanner } from "@/components/whats-new/info-banner";
import { OfferCard } from "@/components/whats-new/offer-card";
import { OfferEmptyState } from "@/components/whats-new/offer-empty-state";
import { RedeemedPerks } from "@/components/whats-new/redeemed-perks";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { FlatList, RefreshControl, View } from "react-native";

type TabType = "active" | "upcoming" | "expired";

const TAB_NOTES: Record<TabType, string> = {
    active:
        "Approved offers that are currently live. Once Grabbitt approves and the start date arrives, they appear here.",
    upcoming:
        "Future offers waiting for approval or their start date. These will go live automatically.",
    expired:
        "Offers that have ended. Customers can no longer redeem them, but you can copy them again.",
};

interface OffersContentProps {
    tab: TabType;
    active: any[];
    upcoming: any[];
    expired: any[];
    deleting: string | null;
    refreshing: boolean;
    redeemed: any[];
    loadingRedeemed: boolean;
    redeemedOpen: boolean;
    onRefresh: () => void;
    onEdit: (date: string) => void;
    onDelete: (date: string) => void;
    onCopy: (offer: any) => void;
    onRedeemedToggle: (open: boolean) => void;
}

const OffersContentComponent: React.FC<OffersContentProps> = ({
    tab,
    active,
    upcoming,
    expired,
    deleting,
    refreshing,
    redeemed,
    loadingRedeemed,
    redeemedOpen,
    onRefresh,
    onEdit,
    onDelete,
    onCopy,
    onRedeemedToggle,
}) => {
    const router = useRouter();

    const data = useMemo(
        () => (tab === "active" ? active : tab === "upcoming" ? upcoming : expired),
        [tab, active, upcoming, expired]
    );

    const renderOfferCard = useCallback(
        ({ item }: { item: any }) => (
            <OfferCard
                offerDoc={item}
                state={tab}
                isDeleting={deleting === item.date}
                onEdit={onEdit}
                onDelete={onDelete}
                onCopy={onCopy}
            />
        ),
        [tab, deleting, onEdit, onDelete, onCopy]
    );

    const renderEmptyState = useCallback(
        () => (
            <OfferEmptyState
                state={tab}
                onCreateOffer={() => router.push("/(drawer)/whats-new/offer-add")}
            />
        ),
        [tab, router]
    );

    return (
        <FlatList
            data={data}
            renderItem={renderOfferCard}
            keyExtractor={(item: any) => item.id || `${item.date}-${item.id}`}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={<InfoBanner message={TAB_NOTES[tab]} />}
            ListEmptyComponent={renderEmptyState}
            ListFooterComponent={
                <>
                    {tab === "active" && (
                        <RedeemedPerks
                            open={redeemedOpen}
                            loading={loadingRedeemed}
                            perks={redeemed}
                            onToggle={onRedeemedToggle}
                        />
                    )}
                    <View style={{ height: 100 }} />
                </>
            }
        />
    );
};

export const OffersContent = React.memo(OffersContentComponent);
