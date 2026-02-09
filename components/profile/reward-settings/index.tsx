/**
 * Reward Settings - Main Container
 * Orchestrates all reward configuration sub-components
 */

import { useTheme } from "@/hooks/use-theme-color";
import { userApi } from '@/services';
import { useAuthStore } from "@/store/authStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, Card, Surface, Text } from "react-native-paper";
import { FixedPointsConfig } from "./fixed-points-config";
import { OffersSection } from "./offers-section";
import { PercentageConfig } from "./percentage-config";
import { RewardTypeSelector } from "./reward-type-selector";
import { SlabConfig } from "./slab-config";
import { Offer, REWARD_TYPES, RewardType, SlabRuleUI } from "./types";
import { ViewModeSummary } from "./view-mode-summary";

export default function RewardsSettings() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const fetchUserDetails = useAuthStore((state) => state.fetchUserDetails);

    const uid = user?.uid;
    const rewards = user?.user?.seller_profile?.rewards;
    const upiFromProfile = useMemo(() => rewards?.upi_ids || [], [rewards]);

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Form state
    const [rewardType, setRewardType] = useState(rewards?.reward_type || "default");
    const [pointsPerVisit, setPointsPerVisit] = useState(
        rewards?.default_points_value ? String(rewards.default_points_value) : "10"
    );
    const [percentageValue, setPercentageValue] = useState(
        rewards?.percentage_value != null ? String(rewards.percentage_value) : "2"
    );

    const initialSlabRules: SlabRuleUI[] = useMemo(
        () =>
            Array.isArray(rewards?.slab_rules) && rewards!.slab_rules.length > 0
                ? rewards!.slab_rules.map((r: any) => ({
                    max: String(r.max),
                    points: String(r.points),
                }))
                : [],
        [rewards]
    );

    const [slabRules, setSlabRules] = useState<SlabRuleUI[]>(initialSlabRules);

    const initialOffers: Offer[] = useMemo(
        () =>
            Array.isArray(rewards?.offers) && rewards!.offers.length > 0
                ? rewards!.offers.map((r: any) => ({
                    reward_points: String(r.reward_points),
                    reward_name: r.reward_name,
                    reward_description: r.reward_description,
                }))
                : [],
        [rewards]
    );

    const [offers, setOffers] = useState<Offer[]>(initialOffers);
    const [upiIds, setUpiIds] = useState<string[]>(upiFromProfile);

    const selectedType: RewardType | undefined = useMemo(() => REWARD_TYPES.find((t) => t.id === rewardType), [rewardType]);

    const slabPreviewRows = useMemo(
        () =>
            slabRules.map((slab, index) => {
                const prevMax = Number(slabRules[index - 1]?.max || -1);
                const min = index === 0 ? 0 : prevMax + 1;
                return {
                    key: `slab-${min}-${slab.max}`,
                    min,
                    max: slab.max,
                    points: slab.points,
                };
            }),
        [slabRules]
    );

    const syncFromRewards = useCallback((source?: typeof rewards) => {
        if (!source) return;
        setRewardType(source.reward_type || "default");
        setPointsPerVisit(source.default_points_value ? String(source.default_points_value) : "10");
        setPercentageValue(source.percentage_value != null ? String(source.percentage_value) : "2");

        if (Array.isArray(source.slab_rules) && source.slab_rules.length > 0) {
            setSlabRules(source.slab_rules.map((r: any) => ({
                max: String(r.max),
                points: String(r.points),
            })));
        } else {
            setSlabRules([]);
        }

        if (Array.isArray(source.offers) && source.offers.length > 0) {
            setOffers(source.offers.map((r: any) => ({
                reward_points: String(r.reward_points),
                reward_name: r.reward_name,
                reward_description: r.reward_description,
            })));
        } else {
            setOffers([]);
        }

        setUpiIds(source.upi_ids || []);
    }, []);

    // Sync state when rewards data changes from parent/store
    useEffect(() => {
        if (!isEditing && rewards) {
            syncFromRewards(rewards);
        }
    }, [rewards, isEditing, syncFromRewards]);

    const handleCancel = useCallback(() => {
        syncFromRewards(rewards);
        setSlabRules(initialSlabRules);
        setOffers(initialOffers);
        setUpiIds(upiFromProfile);
        setIsEditing(false);
        setShowAdvanced(false);
    }, [rewards, initialSlabRules, initialOffers, upiFromProfile, syncFromRewards]);

    const buildNumericSlabs = useCallback((): { min: number; max: number; points: number }[] => {
        const numericSlabs: { min: number; max: number; points: number }[] = [];
        let lastMax = -1;

        for (let i = 0; i < slabRules.length; i++) {
            const s = slabRules[i];
            const max = Number(s.max);
            const pts = Number(s.points);

            if (!max || max <= 0 || !pts || pts <= 0) {
                throw new Error("Please fill valid max amount and points for all tiers.");
            }
            if (max <= lastMax) {
                throw new Error("Each tier's max amount must be greater than the previous tier.");
            }

            const min = lastMax + 1;
            numericSlabs.push({ min, max, points: pts });
            lastMax = max;
        }

        return numericSlabs;
    }, [slabRules]);

    const handleSave = useCallback(async () => {
        if (rewardType === "percentage") {
            const pct = Number(percentageValue);
            if (!percentageValue || isNaN(pct) || pct <= 0 || pct > 100) {
                return Alert.alert("Invalid Percentage", "Enter a value between 1 and 100.");
            }
        }

        if (rewardType === "default") {
            const pts = Number(pointsPerVisit);
            if (!pointsPerVisit || isNaN(pts) || pts <= 0) {
                return Alert.alert("Invalid Points", "Enter points greater than 0.");
            }
        }

        let numericSlabs: { min: number; max: number; points: number }[] = [];
        if (rewardType === "slab") {
            try {
                numericSlabs = buildNumericSlabs();
            } catch (e: any) {
                return Alert.alert("Invalid Tiers", e.message);
            }
        }

        try {
            setSaving(true);

            await userApi.updateSellerProfile("rewards", {
                default_points_value: Number(pointsPerVisit),
                offers: offers,
                reward_type: rewardType,
                percentage_value: percentageValue ? Number(percentageValue) : 0,
                slab_rules: numericSlabs,
                upi_ids: upiIds,
                payment_reward_enabled: upiIds?.length > 0,
            } as any);

            if (uid) await fetchUserDetails(uid, "seller");
            setIsEditing(false);
            setShowAdvanced(false);
            Alert.alert("Saved", "Reward settings updated successfully.");
        } catch (err: any) {
            console.error("Save Error:", err?.response || err);
            Alert.alert("Error", err?.response?.data?.message || "Failed to save settings.");
        } finally {
            setSaving(false);
        }
    }, [
        rewardType,
        percentageValue,
        pointsPerVisit,
        buildNumericSlabs,
        offers,
        upiIds,
        uid,
        fetchUserDetails,
    ]);

    // Slab helpers
    const updateSlab = useCallback((index: number, field: "max" | "points", value: string) => {
        setSlabRules((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const addSlab = useCallback(() => {
        setSlabRules((prev) => [...prev, { max: "", points: "" }]);
    }, []);

    const removeSlab = useCallback((index: number) => {
        setSlabRules((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Offer helpers
    const updateOffer = useCallback((index: number, field: keyof Offer, value: string) => {
        setOffers((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const addOffer = useCallback(() => {
        setOffers((prev) => [...prev, { reward_points: "", reward_name: "", reward_description: "" }]);
    }, []);

    const removeOffer = useCallback((index: number) => {
        setOffers((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // Get current value display
    const getCurrentValueDisplay = useMemo(() => {
        if (rewardType === "default") return `${pointsPerVisit} pts/scan`;
        if (rewardType === "percentage") return `${percentageValue}% of bill`;
        if (rewardType === "slab") return `${slabRules.length} tiers`;
        return "";
    }, [rewardType, pointsPerVisit, percentageValue, slabRules.length]);

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} testID="reward-settings-card">
            <View style={{ position: "relative" }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text
                            variant="titleMedium"
                            style={[styles.cardTitle, { color: theme.colors.onSurface }]}
                        >
                            🎁 Rewards
                        </Text>

                        {!isEditing ? (
                            <Button
                                mode="text"
                                icon={rewards?.noEdit ? 'eye' : 'pencil'}
                                compact
                                onPress={() => setIsEditing(true)}
                            >
                                {rewards?.noEdit ? 'Show' : 'Edit'}
                            </Button>
                        ) : (
                            <View style={styles.headerButtons}>
                                <Button
                                    mode="text"
                                    onPress={handleCancel}
                                    icon="close"
                                    disabled={saving}
                                    compact
                                >
                                    Cancel
                                </Button>
                                {!rewards?.noEdit && <Button
                                    mode="text"
                                    onPress={handleSave}
                                    icon="content-save-outline"
                                    disabled={saving}
                                    loading={saving}
                                    compact
                                >
                                    Save
                                </Button>}
                            </View>
                        )}
                    </View>

                    {/* VIEW MODE - Clean Summary */}
                    {!isEditing ? (
                        <ViewModeSummary
                            theme={theme}
                            rewardType={rewardType}
                            selectedType={selectedType}
                            getCurrentValueDisplay={getCurrentValueDisplay}
                            slabPreviewRows={slabPreviewRows}
                            offersCount={offers.length}
                            onEdit={() => setIsEditing(true)}
                        />
                    ) : (
                        /* EDIT MODE - Simplified */
                        <View style={styles.editMode}>
                            {/* Reward Type Selector - Horizontal Pills */}
                            <RewardTypeSelector
                                rewardType={rewardType}
                                onSelectType={setRewardType}
                            />

                            {/* Configuration Based on Type - Config Card */}
                            <Surface style={[styles.configCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                                {rewardType === "default" && (
                                    <FixedPointsConfig
                                        pointsPerVisit={pointsPerVisit}
                                        onChangePoints={setPointsPerVisit}
                                    />
                                )}

                                {rewardType === "percentage" && (
                                    <PercentageConfig
                                        percentageValue={percentageValue}
                                        onChangePercentage={setPercentageValue}
                                    />
                                )}

                                {rewardType === "slab" && (
                                    <SlabConfig
                                        noEdit={rewards?.noEdit ?? true}
                                        slabRules={slabRules}
                                        onUpdateSlab={updateSlab}
                                        onAddSlab={addSlab}
                                        onRemoveSlab={removeSlab}
                                    />
                                )}
                            </Surface>

                            {/* Collapsible Advanced Section */}
                            <TouchableOpacity
                                onPress={() => setShowAdvanced(!showAdvanced)}
                                style={styles.advancedToggle}
                            >
                                <Text style={[styles.advancedToggleText, { color: theme.colors.primary }]}>
                                    {showAdvanced ? "Hide" : "Show"} Advanced Options
                                </Text>
                                <MaterialCommunityIcons
                                    name={showAdvanced ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={theme.colors.primary}
                                />
                            </TouchableOpacity>

                            {showAdvanced && (
                                <OffersSection
                                    offers={offers}
                                    disableEdits={!!rewards?.noEdit}
                                    onUpdateOffer={updateOffer}
                                    onRemoveOffer={removeOffer}
                                    onAddOffer={addOffer}
                                />
                            )}
                        </View>
                    )}
                </Card.Content>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        overflow: "hidden",
        paddingBottom: 10
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    cardTitle: {
        fontWeight: "600",
        marginBottom: 12,
    },
    headerButtons: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    editMode: {
        marginTop: 16,
    },
    configCard: {
        padding: 16,
        borderRadius: 12,
    },
    advancedToggle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 14,
        marginTop: 8,
    },
    advancedToggleText: {
        fontSize: 13,
        fontWeight: "500",
    },
});
