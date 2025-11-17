import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { QR_CODE_TYPES } from '@/utils/constant';
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

type QrType = "dynamic" | "static" | "static_hidden";

export default function RewardsSettings() {
    const theme = useTheme();
    const { user, fetchUserDetails } = useAuthStore();

    const uid = user?.uid;
    const idToken = user?.idToken;

    const rewards = user?.user?.seller_profile?.rewards;
    const qr = user?.user?.seller_profile?.qr_settings;

    const subscriptionTier = user?.user?.seller_profile?.subscription.tier || "free";
    const canEditQR = subscriptionTier !== "free";

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Rewards values
    const [pointsPerVisit, setPointsPerVisit] = useState(
        rewards?.default_points_value ? String(rewards.default_points_value) : "5"
    );
    const [rewardPoints, setRewardPoints] = useState(
        rewards?.reward_points ? String(rewards.reward_points) : "50"
    );
    const [rewardDescription, setRewardDescription] = useState(
        rewards?.reward_description || ""
    );
    const [rewardName, setRewardName] = useState(
        rewards?.reward_name || ""
    );

    const [qrType, setQrType] = useState<QrType>(
        qr?.qr_code_type || "dynamic"
    );

    const [initial, setInitial] = useState({
        pointsPerVisit,
        rewardPoints,
        rewardDescription,
        rewardName,
        qrType,
    });

    const isDirty = useMemo(() => {
        return (
            pointsPerVisit !== initial.pointsPerVisit ||
            rewardPoints !== initial.rewardPoints ||
            rewardDescription !== initial.rewardDescription ||
            rewardName !== initial.rewardName ||
            qrType !== initial.qrType
        );
    }, [
        pointsPerVisit,
        rewardPoints,
        rewardDescription,
        rewardName,
        qrType,
        initial
    ]);

    const handleCancel = () => {
        setPointsPerVisit(initial.pointsPerVisit);
        setRewardPoints(initial.rewardPoints);
        setRewardDescription(initial.rewardDescription);
        setRewardName(initial.rewardName);
        setQrType(initial.qrType);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!pointsPerVisit || !rewardPoints) {
            return Alert.alert("Validation", "Please enter valid point values.");
        }

        try {
            setSaving(true);

            await api.patch(
                "/updateSellerProfile",
                {
                    section: "rewards",
                    data: {
                        rewards: {
                            default_points_value: Number(pointsPerVisit),
                            reward_points: Number(rewardPoints),
                            reward_description: rewardDescription,
                            reward_name: rewardName,
                        },
                        qr_settings: { qr_code_type: qrType },
                    },
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, "seller");

            setInitial({
                pointsPerVisit,
                rewardPoints,
                rewardDescription,
                rewardName,
                qrType,
            });

            setIsEditing(false);
            Alert.alert("Success", "Reward settings updated.");
        } catch (err: any) {
            Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to save settings."
            );
        } finally {
            setSaving(false);
        }
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
                            🎁 Rewards & QR Settings
                        </Text>

                        {!isEditing ? (
                            <Button
                                mode="text"
                                icon="pencil"
                                compact
                                onPress={() => !(!canEditQR && true) && setIsEditing(true)}
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
                                { label: "Points per Visit", value: pointsPerVisit },
                                { label: "Points for Reward", value: rewardPoints },
                                { label: "Reward Name", value: rewardName || "—" },
                                { label: "Reward Description", value: rewardDescription || "—" },
                                { label: "QR Type", value: qrType },
                            ].map((item) => (
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

                            {subscriptionTier === "free" && (
                                <HelperText type="error">
                                    QR type changes are locked for Free plan.
                                </HelperText>
                            )}

                            <HelperText type="info" style={{ color: theme.colors.onSurface }}>
                                Customize how customers earn and redeem rewards.
                            </HelperText>
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>
                            {/* REWARD POINTS */}
                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <TextInput
                                        label="Points per Visit *"
                                        value={pointsPerVisit}
                                        onChangeText={setPointsPerVisit}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={styles.input}
                                        left={<TextInput.Icon icon="star" color={theme.colors.onSurface} />}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,      // focused label color
                                                onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                            },
                                        }}
                                    />
                                </View>

                                <View style={styles.half}>
                                    <TextInput
                                        label="Points for Reward *"
                                        value={rewardPoints}
                                        onChangeText={setRewardPoints}
                                        keyboardType="numeric"
                                        mode="outlined"
                                        style={styles.input}
                                        left={<TextInput.Icon icon="gift" color={theme.colors.onSurface} />}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={theme.colors.onSurface}
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,      // focused label color
                                                onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                            },
                                        }}
                                    />
                                </View>
                            </View>

                            <TextInput
                                label="Reward Name"
                                value={rewardName}
                                onChangeText={setRewardName}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="gift-outline" color={theme.colors.onSurface} />}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.onSurface}
                                theme={{
                                    colors: {
                                        primary: theme.colors.primary,      // focused label color
                                        onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                    },
                                }}
                            />

                            <TextInput
                                label="Reward Description"
                                value={rewardDescription}
                                onChangeText={setRewardDescription}
                                multiline
                                numberOfLines={3}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="gift-outline" color={theme.colors.onSurface} />}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.onSurface}
                                theme={{
                                    colors: {
                                        primary: theme.colors.primary,      // focused label color
                                        onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                    },
                                }}
                            />

                            {/* QR TYPE */}
                            <Text
                                style={{
                                    marginTop: 12,
                                    marginBottom: 6,
                                    color: theme.colors.onSurface
                                }}
                            >
                                QR Code Type
                            </Text>

                            <View style={styles.chipRow}>
                                {QR_CODE_TYPES.map((item) => {
                                    const selected = qrType === item.value;

                                    return (
                                        <Chip
                                            key={item.value}
                                            selected={selected}
                                            disabled={!canEditQR}
                                            onPress={() =>
                                                canEditQR &&
                                                setQrType(item.value as QrType)
                                            }
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: selected
                                                        ? theme.colors.primary
                                                        : theme.colors.surfaceVariant
                                                },
                                                !canEditQR && { opacity: 0.4 }
                                            ]}
                                            textStyle={{
                                                color: selected
                                                    ? theme.colors.onPrimary
                                                    : theme.colors.onSurface,
                                                fontWeight: selected ? "600" : "400"
                                            }}
                                        >
                                            {item.label}
                                        </Chip>
                                    );
                                })}
                            </View>

                            {!canEditQR && (
                                <HelperText type="error">
                                    Upgrade your plan to change QR type.
                                </HelperText>
                            )}
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
                {!canEditQR && (
                    <LockedOverlay message="Reward & QR Settings cannot be edited on the Free plan." />
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
