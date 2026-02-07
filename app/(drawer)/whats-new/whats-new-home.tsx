/**
 * What's New - Redesigned Offer Management
 * Interactive UX with proper validations
 */

import { CopyOfferModal } from "@/components/whats-new/copy-offer-modal";
import { LoadingState } from "@/components/whats-new/loading-state";
import { OffersContent } from "@/components/whats-new/offers-content";
import { SubscriptionBanner } from "@/components/whats-new/subscription-banner";
import { TabSwitcher } from "@/components/whats-new/tab-switcher";
import { useCopyOfferModal, useOffers, useRedemptions } from "@/hooks";
import { useTheme } from "@/hooks/use-theme-color";
import { useAuthStore } from "@/store/authStore";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { FAB } from "react-native-paper";

type TabType = "active" | "upcoming" | "expired";


export default function WhatsNewScreen() {
    const theme = useTheme();
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [tab, setTab] = useState<TabType>("upcoming");
    const [showSubscriptionBanner, setShowSubscriptionBanner] = useState(false);

    // Use custom hooks
    const { active, upcoming, expired, loading, refreshing, deleting, fetchOffers, onRefresh, deleteOffer } = useOffers();
    const { redeemed, loadingRedeemed, redeemedOpen, setRedeemedOpen, fetchRedeemed } = useRedemptions();
    const {
        copyModalVisible,
        copyingOffer,
        copyDateMode,
        copyStartDate,
        copyEndDate,
        copyOffers,
        savingCopy,
        openCopyModal,
        closeCopyModal,
        setCopyDateMode,
        handleCopyDateChange,
        updateCopyOffer,
        addCopyOffer,
        removeCopyOffer,
        saveCopiedOffer,
    } = useCopyOfferModal();

    // Check subscription and fetch initial data
    const handleInitialFetch = useCallback(async () => {
        if (user?.user.seller_profile?.subscription.tier === "free") {
            setShowSubscriptionBanner(true);
            return;
        }
        await fetchOffers();
    }, [user, fetchOffers]);

    // Handle copy offer save
    const handleCopyOffer = useCallback(async () => {
        await saveCopiedOffer(() => fetchOffers());
    }, [saveCopiedOffer, fetchOffers]);

    // Fetch redeemed perks when active tab
    useFocusEffect(
        useCallback(() => {
            handleInitialFetch();
            if (tab === "active") {
                fetchRedeemed();
            }
        }, [handleInitialFetch, tab, fetchRedeemed])
    );

    // Handle edit offer
    const handleEditOffer = useCallback(
        (date: string) => {
            router.push({
                pathname: "/(drawer)/whats-new/offer-add",
                params: { editDate: date },
            });
        },
        [router]
    );

    // Render loading state
    if (loading) {
        return <LoadingState visible={loading} />;
    }

    // Render subscription banner
    if (showSubscriptionBanner) {
        return <SubscriptionBanner visible={showSubscriptionBanner} />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            {/* Tab Switcher */}
            <TabSwitcher
                activeTab={tab}
                counts={{ active: active.length, upcoming: upcoming.length, expired: expired.length }}
                onTabChange={setTab}
            />

            {/* Content */}
            <OffersContent
                tab={tab}
                active={active}
                upcoming={upcoming}
                expired={expired}
                deleting={deleting}
                refreshing={refreshing}
                redeemed={redeemed}
                loadingRedeemed={loadingRedeemed}
                redeemedOpen={redeemedOpen}
                onRefresh={onRefresh}
                onEdit={handleEditOffer}
                onDelete={deleteOffer}
                onCopy={openCopyModal}
                onRedeemedToggle={setRedeemedOpen}
            />

            {/* FAB for upcoming tab */}
            {tab === "upcoming" && (
                <FAB
                    icon="plus"
                    style={{ position: "absolute", right: 20, bottom: 30, backgroundColor: theme.colors.primary }}
                    color="#fff"
                    onPress={() => router.push("/(drawer)/whats-new/offer-add")}
                    testID="add-offer-fab"
                />
            )}

            {/* Copy Modal */}
            <CopyOfferModal
                visible={copyModalVisible}
                originalDate={copyingOffer?.date || ""}
                dateMode={copyDateMode}
                startDate={copyStartDate}
                endDate={copyEndDate}
                offers={copyOffers}
                saving={savingCopy}
                onDateModeChange={setCopyDateMode}
                onDateChange={handleCopyDateChange}
                onOfferUpdate={updateCopyOffer}
                onAddOffer={addCopyOffer}
                onRemoveOffer={removeCopyOffer}
                onSave={() => handleCopyOffer()}
                onClose={closeCopyModal}
            />
        </View>
    );
}

