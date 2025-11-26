import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    View
} from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    HelperText,
    Text,
    TextInput,
    useTheme,
} from 'react-native-paper';
import { LockedOverlay } from '../shared/locked-overlay';

interface SlabRuleUI {
    max: string;     // string for input
    points: string;  // string for input
}

interface Offers {
    reward_points: string;     // string for input
    reward_name: string;  // string for input
    reward_description: string;
}

export default function RewardsSettings() {
    const theme = useTheme();
    const { user, fetchUserDetails } = useAuthStore();

    const uid = user?.uid;
    const idToken = user?.idToken;

    const rewards = user?.user?.seller_profile?.rewards;
    const upiFromProfile: string[] = user?.user?.seller_profile?.rewards.upi_ids || [];

    const subscriptionTier = user?.user?.seller_profile?.subscription?.tier || "free";
    const canEdit = subscriptionTier !== "free";

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // ─────────────────────────────────────
    // Base reward fields
    // ─────────────────────────────────────
    const [pointsPerVisit, setPointsPerVisit] = useState(
        rewards?.default_points_value ? String(rewards.default_points_value) : "5"
    );

    // ─────────────────────────────────────
    // NEW: Reward type & advanced config
    // ─────────────────────────────────────
    const [rewardType, setRewardType] = useState(
        rewards?.reward_type || "default"
    );

    const [percentageValue, setPercentageValue] = useState(
        rewards?.percentage_value != null ? String(rewards.percentage_value) : ""
    );

    // slab_rules: [{ min, max, points }]
    const initialSlabRulesUI: SlabRuleUI[] =
        Array.isArray(rewards?.slab_rules) && rewards!.slab_rules.length > 0
            ? rewards!.slab_rules.map((r: any) => ({
                max: String(r.max),
                points: String(r.points),
            }))
            : [];

    const [slabRules, setSlabRules] = useState<SlabRuleUI[]>(
        initialSlabRulesUI.length > 0 ? initialSlabRulesUI : [{ max: "", points: "" }]
    );

    const initialOffers: Offers[] =
        Array.isArray(rewards?.offers) && rewards!.offers.length > 0
            ? rewards!.offers.map((r: any) => ({
                reward_points: String(r.reward_points),
                reward_name: r.reward_name,
                reward_description: r.reward_description
            }))
            : [];

    const [offers, setOffers] = useState(initialOffers.length > 0 ? initialOffers : [{
        reward_points: '',
        reward_name: '',
        reward_description: ''
    }])

    // ─────────────────────────────────────
    // NEW: UPI IDs
    // ─────────────────────────────────────
    const [upiIds, setUpiIds] = useState<string[]>(upiFromProfile);
    const [newUpi, setNewUpi] = useState("");
    const [upiError, setUpiError] = useState<string | null>(null);

    const [initial, setInitial] = useState({
        pointsPerVisit,
        offers: offers.map((s) => ({ ...s })),
        rewardType,
        percentageValue,
        slabRules: slabRules.map((s) => ({ ...s })), // clone
        upiIds: [...upiIds],
    });

    const isDirty = useMemo(() => {
        const basicChanged =
            rewardType !== initial.rewardType ||
            percentageValue !== initial.percentageValue;

        const slabsChanged =
            slabRules.length !== initial.slabRules.length ||
            slabRules.some((s, idx) =>
                s.max !== initial.slabRules[idx]?.max ||
                s.points !== initial.slabRules[idx]?.points
            );

        const upiChanged =
            upiIds.length !== initial.upiIds.length ||
            upiIds.some((id, idx) => id !== initial.upiIds[idx]);

        const rewardsChanges = offers.length !== initial.offers.length ||
            offers.some((s, idx) =>
                s.reward_points !== initial.offers[idx]?.reward_points ||
                s.reward_description !== initial.offers[idx]?.reward_description ||
                s.reward_name !== initial.offers[idx]?.reward_name
            );

        return basicChanged || slabsChanged || upiChanged || rewardsChanges;
    }, [
        pointsPerVisit,
        offers,
        rewardType,
        percentageValue,
        slabRules,
        upiIds,
        initial
    ]);

    const handleCancel = () => {
        setPointsPerVisit(initial.pointsPerVisit);
        setOffers(initial.offers);
        setRewardType(initial.rewardType);
        setPercentageValue(initial.percentageValue);
        setSlabRules(initial.slabRules.map((s) => ({ ...s })));
        setUpiIds([...initial.upiIds]);
        setNewUpi("");
        setUpiError(null);
        setIsEditing(false);
    };

    // ─────────────────────────────────────
    // UPI helpers
    // ─────────────────────────────────────
    const validateUpi = (value: string): string | null => {
        const trimmed = value.trim().toLowerCase();

        if (!trimmed) return "UPI ID cannot be empty.";

        // at least 3 chars before @, allowed chars: letters, digits, dot, dash
        const upiRegex = /^[a-zA-Z0-9.\-]{3,}@[a-zA-Z0-9.\-]+$/;
        if (!upiRegex.test(trimmed)) {
            return "Enter a valid UPI ID (e.g. myshop@upi). Only letters, digits, dot and dash allowed.";
        }

        if (upiIds.map((id) => id.toLowerCase()).includes(trimmed)) {
            return "This UPI ID is already added.";
        }

        return null;
    };

    const handleAddUpi = () => {
        const err = validateUpi(newUpi);
        if (err) {
            setUpiError(err);
            return;
        }
        const trimmed = newUpi.trim();
        setUpiIds((prev) => [...prev, trimmed]);
        setNewUpi("");
        setUpiError(null);
    };

    const handleRemoveUpi = (id: string) => {
        setUpiIds((prev) => prev.filter((u) => u !== id));
    };

    // ─────────────────────────────────────
    // SLAB helpers
    // ─────────────────────────────────────

    const buildNumericSlabs = (): { min: number; max: number; points: number }[] => {
        const numericSlabs: { min: number; max: number; points: number }[] = [];

        let lastMax = -1;
        for (let i = 0; i < slabRules.length; i++) {
            const s = slabRules[i];
            const max = Number(s.max);
            const pts = Number(s.points);

            if (!max || max <= 0 || !pts || pts <= 0) {
                throw new Error("Please fill valid max amount and points for all slabs.");
            }
            if (max <= lastMax) {
                throw new Error("Each slab's max amount must be greater than the previous slab.");
            }

            const min = lastMax + 1;
            numericSlabs.push({ min, max, points: pts });
            lastMax = max;
        }

        return numericSlabs;
    };

    const handleSave = async () => {

        if (rewardType === "percentage") {
            const pct = Number(percentageValue);
            if (!percentageValue || isNaN(pct) || pct <= 0 || pct > 100) {
                return Alert.alert("Validation", "Enter a valid percentage between 1 and 100.");
            }
        }

        let numericSlabs: { min: number; max: number; points: number }[] = [];
        if (rewardType === "slab") {
            try {
                numericSlabs = buildNumericSlabs();
            } catch (e: any) {
                return Alert.alert("Validation", e.message || "Invalid slab configuration.");
            }
        }

        try {
            setSaving(true);

            await api.patch(
                "/updateSellerProfile",
                {
                    section: "rewards",
                    data: {
                        default_points_value: Number(pointsPerVisit),
                        offers: offers,
                        reward_type: rewardType,
                        percentage_value: percentageValue ? Number(percentageValue) : 0,
                        slab_rules: numericSlabs,
                        upi_ids: upiIds,
                    },
                }
            );

            if (uid) await fetchUserDetails(uid, "seller");

            setInitial({
                pointsPerVisit,
                offers,
                rewardType,
                percentageValue,
                slabRules: slabRules.map((s) => ({ ...s })),
                upiIds: [...upiIds],
            });

            setIsEditing(false);
            Alert.alert("Success", "Reward settings updated.");
        } catch (err: any) {
            Alert.alert(
                "Error",
                err?.response?.data?.message || "Failed to save settings."
            );
        } finally {
            setSaving(false);
        }
    };

    // Friendly label for reward type (view mode)
    const rewardTypeLabel = (type: string) => {
        switch (type) {
            case "percentage":
                return "Percentage of Bill Amount";
            case "slab":
                return "Slab-Based Points";
            case "default":
            default:
                return "Default (Use Points-Per-Visit)";
        }
    };

    const updateOffer = (index: number, field: "reward_points" | "reward_description" | "reward_name", value: string) => {
        const updated = [...offers];
        updated[index][field] = value;
        setOffers(updated);
    };

    const addOffer = () => {
        setOffers((prev) => [
            ...prev,
            { reward_description: "", reward_name: "", reward_points: "" }
        ]);
    };

    const removeOffer = (index: number) => {
        setOffers((prev) => prev.filter((_, i) => i !== index));
    };

    const updateSlab = (index: number, field: "max" | "points", value: string) => {
        const updated = [...slabRules];
        updated[index][field] = value;
        setSlabRules(updated);
    };

    const addSlab = () => {
        setSlabRules((prev) => [
            ...prev,
            { max: "", points: "" }
        ]);
    };

    const removeSlab = (index: number) => {
        setSlabRules((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
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
                                icon="pencil"
                                compact
                                onPress={() => canEdit && setIsEditing(true)}
                            >
                                Edit
                            </Button>
                        ) : (
                            <View style={styles.editButtons}>
                                <Button
                                    mode="text"
                                    icon="close"
                                    onPress={handleCancel}
                                    disabled={saving}
                                    compact
                                >
                                    Cancel
                                </Button>

                                <Button
                                    mode="text"
                                    icon="content-save-outline"
                                    loading={saving}
                                    disabled={!isDirty || saving}
                                    onPress={handleSave}
                                    compact
                                >
                                    Save
                                </Button>
                            </View>
                        )}
                    </View>

                    <Divider
                        style={[
                            styles.divider,
                            { backgroundColor: theme.colors.outline }
                        ]}
                    />

                    {/* VIEW MODE */}
                    {!isEditing ? (
                        <View>
                            {[
                                { label: "Reward Type", value: rewardTypeLabel(rewardType) },
                                rewardType === "default"
                                    ? { label: "", value: pointsPerVisit || "—" }
                                    : null,
                                rewardType === "percentage"
                                    ? { label: "Percentage (%)", value: percentageValue || "—" }
                                    : null,
                            ]
                                .filter(Boolean)
                                .map((item: any) => (
                                    <View
                                        key={item.label}
                                        style={[
                                            styles.infoRow,
                                            { borderBottomColor: theme.colors.outline }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.infoLabel,
                                                { color: theme.colors.onSurfaceDisabled }
                                            ]}
                                        >
                                            {item.label}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.infoValue,
                                                { color: theme.colors.onSurface }
                                            ]}
                                        >
                                            {item.value}
                                        </Text>
                                    </View>
                                ))}

                            {/* Slabs preview */}
                            {rewardType === "slab" && slabRules.length > 0 && (
                                <View style={{ marginTop: 8, marginBottom: 4 }}>
                                    <Text
                                        style={{
                                            fontSize: 14,
                                            marginBottom: 4,
                                            color: theme.colors.onSurfaceDisabled,
                                        }}
                                    >
                                        Slab Rules
                                    </Text>
                                    {slabRules.map((s, index) => {

                                        const prevMax = Number(slabRules[index - 1]?.max || -1);
                                        const min = index === 0 ? 0 : prevMax + 1;
                                        const isLast = index === slabRules.length - 1;
                                        return (
                                            <Text
                                                key={index}
                                                style={{
                                                    fontSize: 14,
                                                    color: theme.colors.onSurface,
                                                }}
                                            >
                                                {isLast ? `₹${min}+ → ${s.points || "…"} pts` : `₹${min} - ₹${s.max || "…"} → ${s.points || "…"} pts`}

                                            </Text>
                                        );
                                    })}
                                </View>
                            )}

                            <View style={{ marginTop: 8, marginBottom: 4 }}>
                                <Text
                                    style={{
                                        fontSize: 14,
                                        marginBottom: 4,
                                        color: theme.colors.onSurfaceDisabled,
                                    }}
                                >
                                    Offers
                                </Text>
                                {offers.map((s, index) => {
                                    return (
                                        <View key={index}>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    color: theme.colors.onSurface,
                                                }}
                                            >
                                                {`Points: ${s.reward_points || "-"}`}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    color: theme.colors.onSurface,
                                                }}
                                            >
                                                {`Item: ${s.reward_name || '-'}`}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    color: theme.colors.onSurface,
                                                }}
                                            >
                                                {`${s.reward_description}`}
                                            </Text>
                                        </View>


                                    );
                                })}
                            </View>

                            {/* UPI IDs (view) */}
                            <View style={{ marginTop: 12 }}>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        marginBottom: 4,
                                        color: theme.colors.onSurfaceDisabled,
                                    }}
                                >
                                    Linked UPI IDs
                                </Text>
                                {upiIds.length === 0 ? (
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: theme.colors.onSurfaceDisabled,
                                        }}
                                    >
                                        No UPI IDs added.
                                    </Text>
                                ) : (
                                    <View style={styles.chipRow}>
                                        {upiIds.map((id) => (
                                            <Chip
                                                key={id}
                                                style={styles.chip}
                                                disabled
                                            >
                                                {id}
                                            </Chip>
                                        ))}
                                    </View>
                                )}
                            </View>

                            {subscriptionTier === "free" && (
                                <HelperText type="error">
                                    Reward are locked on the Free plan.
                                </HelperText>
                            )}

                            <HelperText type="info" style={{ color: theme.colors.onSurface }}>
                                Customize how customers earn and redeem rewards, and link your UPI IDs for payment-based rewards.
                            </HelperText>
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>

                            {/* REWARD TYPE (Option B labels) */}
                            <Text
                                style={{
                                    marginTop: 12,
                                    marginBottom: 6,
                                    color: theme.colors.onSurface
                                }}
                            >
                                Reward Type
                            </Text>

                            <View style={styles.chipRow}>
                                {[
                                    {
                                        value: "default",
                                        label: "Default (Points-Per-Visit)",
                                    },
                                    {
                                        value: "percentage",
                                        label: "Percentage of Bill Amount",
                                    },
                                    {
                                        value: "slab",
                                        label: "Slab-Based Rewards",
                                    },
                                ].map((item) => {
                                    const selected = rewardType === item.value;
                                    return (
                                        <Chip
                                            key={item.value}
                                            selected={selected}
                                            onPress={() => setRewardType(item.value)}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: selected
                                                        ? theme.colors.primary
                                                        : theme.colors.surfaceVariant
                                                }
                                            ]}
                                            textStyle={{
                                                color: selected
                                                    ? theme.colors.onPrimary
                                                    : theme.colors.onSurface,
                                                fontWeight: selected ? "600" : "400",
                                                fontSize: 12,
                                            }}
                                        >
                                            {item.label}
                                        </Chip>
                                    );
                                })}
                            </View>

                            {/* Extra config per reward type */}
                            {rewardType === "default" && (
                                <>
                                    <TextInput
                                        label="Default (Flat) Points per Scan"
                                        value={pointsPerVisit}
                                        onChangeText={setPointsPerVisit}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                        left={<TextInput.Icon icon="star" color={theme.colors.onSurface} />}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,
                                                onSurfaceVariant: theme.colors.onSurface,
                                            },
                                        }}
                                    />
                                    <HelperText type="info" style={{ color: theme.colors.onSurface }}>
                                        Example: 5 means 5% of bill amount converted to points.
                                    </HelperText>
                                </>
                            )}

                            {rewardType === "percentage" && (
                                <>
                                    <TextInput
                                        label="Percentage of Bill Amount *"
                                        value={percentageValue}
                                        onChangeText={setPercentageValue}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                        left={<TextInput.Icon icon="percent" color={theme.colors.onSurface} />}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,
                                                onSurfaceVariant: theme.colors.onSurface,
                                            },
                                        }}
                                    />
                                    <HelperText type="info" style={{ color: theme.colors.onSurface }}>
                                        Example: 5 means 5% of bill amount converted to points.
                                    </HelperText>
                                </>
                            )}

                            {/* SLAB EDIT MODE */}
                            {rewardType === "slab" && (
                                <View style={{ marginTop: 16 }}>
                                    <Text
                                        style={{
                                            marginBottom: 8,
                                            color: theme.colors.onSurface,
                                            fontWeight: "600",
                                        }}
                                    >
                                        Slab Rules
                                    </Text>

                                    {slabRules.map((rule, index) => {
                                        const prevMax = Number(slabRules[index - 1]?.max || -1);
                                        const min = index === 0 ? 0 : prevMax + 1;
                                        return (
                                            <Card
                                                key={index}
                                                style={{
                                                    marginBottom: 12,
                                                    padding: 12,
                                                    backgroundColor: theme.colors.surfaceVariant,
                                                    borderRadius: 12,
                                                }}
                                                elevation={0}
                                            >

                                                <TextInput
                                                    value={String(min)}
                                                    mode="outlined"
                                                    editable={false}
                                                    label="Min"
                                                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                                    outlineColor={theme.colors.outline}
                                                    activeOutlineColor={theme.colors.onSurface}
                                                    theme={{
                                                        colors: {
                                                            primary: theme.colors.primary,
                                                            onSurfaceVariant: theme.colors.onSurface,
                                                        },
                                                    }}
                                                    left={<TextInput.Icon icon="arrow-collapse-down" color={theme.colors.onSurface} />}
                                                />


                                                <TextInput
                                                    value={rule.max}
                                                    onChangeText={(text) => updateSlab(index, "max", text)}
                                                    mode="outlined"
                                                    label="Max"
                                                    keyboardType="numeric"
                                                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                                    left={<TextInput.Icon icon="arrow-collapse-up" color={theme.colors.onSurface} />}
                                                    outlineColor={theme.colors.outline}
                                                    activeOutlineColor={theme.colors.onSurface}
                                                    theme={{
                                                        colors: {
                                                            primary: theme.colors.primary,
                                                            onSurfaceVariant: theme.colors.onSurface,
                                                        },
                                                    }}
                                                />

                                                <TextInput
                                                    value={rule.points}
                                                    onChangeText={(text) => updateSlab(index, "points", text)}
                                                    mode="outlined"
                                                    keyboardType="numeric"
                                                    label="Points"
                                                    style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                                    left={<TextInput.Icon icon="star" color={theme.colors.onSurface} />}
                                                    outlineColor={theme.colors.outline}
                                                    activeOutlineColor={theme.colors.onSurface}
                                                    theme={{
                                                        colors: {
                                                            primary: theme.colors.primary,
                                                            onSurfaceVariant: theme.colors.onSurface,
                                                        },
                                                    }}
                                                />

                                                {/* Action Buttons */}
                                                <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
                                                    {slabRules.length > 1 && (
                                                        <Button
                                                            icon="delete"
                                                            mode="outlined"
                                                            onPress={() => removeSlab(index)}
                                                            textColor={theme.colors.error}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}

                                                    {index === slabRules.length - 1 && (
                                                        <Button
                                                            icon="plus"
                                                            mode="contained"
                                                            onPress={addSlab}
                                                            buttonColor={theme.colors.primary}
                                                            textColor="#fff"
                                                        >
                                                            Add Slab
                                                        </Button>
                                                    )}
                                                </View>
                                            </Card>
                                        );
                                    })}
                                </View>
                            )}

                            <View style={{ marginTop: 16 }}>
                                <Text
                                    style={{
                                        marginBottom: 8,
                                        color: theme.colors.onSurface,
                                        fontWeight: "600",
                                    }}
                                >
                                    Offers
                                </Text>

                                {offers.map((o, index) => {
                                    return (
                                        <Card
                                            key={index}
                                            style={{
                                                marginBottom: 12,
                                                padding: 12,
                                                backgroundColor: theme.colors.surfaceVariant,
                                                borderRadius: 12,
                                            }}
                                            elevation={0}
                                        >

                                            <TextInput
                                                value={String(o.reward_points)}
                                                onChangeText={(text) => updateOffer(index, "reward_points", text)}
                                                mode="outlined"
                                                label="Reward points"
                                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                                outlineColor={theme.colors.outline}
                                                activeOutlineColor={theme.colors.onSurface}
                                                theme={{
                                                    colors: {
                                                        primary: theme.colors.primary,
                                                        onSurfaceVariant: theme.colors.onSurface,
                                                    },
                                                }}
                                                left={<TextInput.Icon icon="gift" color={theme.colors.onSurface} />}
                                            />


                                            <TextInput
                                                value={o.reward_name}
                                                onChangeText={(text) => updateOffer(index, "reward_name", text)}
                                                mode="outlined"
                                                label="Reward Name"

                                                keyboardType="numeric"
                                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                                left={<TextInput.Icon icon="star" color={theme.colors.onSurface} />}
                                                outlineColor={theme.colors.outline}
                                                activeOutlineColor={theme.colors.onSurface}
                                                theme={{
                                                    colors: {
                                                        primary: theme.colors.primary,
                                                        onSurfaceVariant: theme.colors.onSurface,
                                                    },
                                                }}
                                            />

                                            <TextInput
                                                value={o.reward_description}
                                                onChangeText={(text) => updateOffer(index, "reward_description", text)}
                                                mode="outlined"
                                                label="Reward Description"
                                                style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                                left={<TextInput.Icon icon="text" color={theme.colors.onSurface} />}
                                                outlineColor={theme.colors.outline}
                                                activeOutlineColor={theme.colors.onSurface}
                                                theme={{
                                                    colors: {
                                                        primary: theme.colors.primary,
                                                        onSurfaceVariant: theme.colors.onSurface,
                                                    },
                                                }}
                                            />

                                            {/* Action Buttons */}
                                            <View style={{ flexDirection: "row", marginTop: 8, gap: 8 }}>
                                                {offers.length > 1 && (
                                                    <Button
                                                        icon="delete"
                                                        mode="outlined"
                                                        onPress={() => removeOffer(index)}
                                                        textColor={theme.colors.error}
                                                    >
                                                        Remove
                                                    </Button>
                                                )}

                                                {index === offers.length - 1 && (
                                                    <Button
                                                        icon="plus"
                                                        mode="contained"
                                                        onPress={addOffer}
                                                        buttonColor={theme.colors.primary}
                                                        textColor="#fff"
                                                    >
                                                        Add Slab
                                                    </Button>
                                                )}
                                            </View>
                                        </Card>
                                    );
                                })}
                            </View>


                            {/* UPI IDs (edit) */}
                            <View style={{ marginTop: 16 }}>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        marginBottom: 6,
                                        color: theme.colors.onSurface
                                    }}
                                >
                                    Linked UPI IDs
                                </Text>

                                <View style={styles.chipRow}>
                                    {upiIds.map((id) => (
                                        <Chip
                                            key={id}
                                            style={styles.chip}
                                            onClose={() => handleRemoveUpi(id)}
                                        >
                                            {id}
                                        </Chip>
                                    ))}
                                </View>

                                <View style={styles.row}>
                                    <View style={styles.half}>
                                        <TextInput
                                            label="Add UPI ID"
                                            value={newUpi}
                                            onChangeText={(v) => {
                                                setNewUpi(v);
                                                setUpiError(null);
                                            }}
                                            mode="outlined"
                                            style={[styles.input, { backgroundColor: theme.colors.surface }]}
                                            outlineColor={theme.colors.outline}
                                            activeOutlineColor={theme.colors.onSurface}
                                            theme={{
                                                colors: {
                                                    primary: theme.colors.primary,
                                                    onSurfaceVariant: theme.colors.onSurface,
                                                },
                                            }}
                                        />
                                    </View>
                                    <View style={styles.half}>
                                        <Button
                                            mode="contained"
                                            style={{ marginTop: 6 }}
                                            onPress={handleAddUpi}
                                        >
                                            Add
                                        </Button>
                                    </View>
                                </View>
                                {upiError && (
                                    <HelperText type="error">
                                        {upiError}
                                    </HelperText>
                                )}
                                <HelperText type="info" style={{ color: theme.colors.onSurface }}>
                                    Example: <Text style={{ fontWeight: '600' }}>myshop@upi</Text>. Only letters, numbers, dot (.) and dash (-) are allowed.
                                </HelperText>
                            </View>
                        </View>
                    )}
                </Card.Content>

                {/* Saving Overlay */}
                {saving && (
                    <View
                        style={[
                            styles.overlay,
                            {
                                backgroundColor: theme.dark
                                    ? "rgba(0,0,0,0.5)"
                                    : "rgba(255,255,255,0.7)"
                            }
                        ]}
                    >
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text
                            style={[
                                styles.overlayText,
                                { color: theme.colors.onSurface }
                            ]}
                        >
                            Saving…
                        </Text>
                    </View>
                )}

                {/* Locked for Free Plan */}
                {!canEdit && (
                    <LockedOverlay message="Reward cannot be edited on the Free plan." />
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        paddingVertical: 12,
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
    divider: {
        height: 1,
        marginBottom: 16,
    },
    infoRow: {
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 0.5,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontWeight: "600",
        textTransform: "capitalize",
    },
    editButtons: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    row: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    half: { flex: 1 },
    input: { marginBottom: 12 },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 8,
    },
    chip: {
        paddingHorizontal: 8,
    },
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        zIndex: 100,
    },
    overlayText: {
        marginTop: 8,
        fontWeight: "500",
    },
});
