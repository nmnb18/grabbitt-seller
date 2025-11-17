import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    Text,
    TextInput,
} from 'react-native-paper';

export default function VerificationInformation() {
    const theme = useTheme();
    const { user, fetchUserDetails } = useAuthStore();

    const uid = user?.uid;
    const idToken = user?.idToken;

    const profile = user?.user?.seller_profile?.verification;

    const [gst, setGst] = useState(profile?.gst_number || '');
    const [pan, setPan] = useState(profile?.pan_number || '');
    const [regNum, setRegNum] = useState(profile?.business_registration_number || '');

    const verificationStatus = profile?.status || 'pending';

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [initialState, setInitialState] = useState({
        gst,
        pan,
        regNum,
    });

    const isDirty = useMemo(() => {
        return (
            gst !== initialState.gst ||
            pan !== initialState.pan ||
            regNum !== initialState.regNum
        );
    }, [gst, pan, regNum, initialState]);

    const handleCancel = () => {
        setGst(initialState.gst);
        setPan(initialState.pan);
        setRegNum(initialState.regNum);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            await api.patch(
                '/updateSellerProfile',
                {
                    section: 'verification',
                    data: {
                        gst_number: gst || null,
                        pan_number: pan || null,
                        business_registration_number: regNum || null,
                    },
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, 'seller');

            setInitialState({ gst, pan, regNum });
            setIsEditing(false);

            Alert.alert('Success', 'Verification details updated.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update verification info.');
        } finally {
            setSaving(false);
        }
    };

    // THEME-BASED STATUS COLORS
    const statusColor =
        verificationStatus === "approved"
            ? theme.colors.success
            : verificationStatus === "rejected"
                ? theme.colors.error
                : theme.colors.warning;

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
                            ✅ Verification Details
                        </Text>

                        {!isEditing ? (
                            <Button
                                mode="text"
                                icon="pencil"
                                compact
                                onPress={() => setIsEditing(true)}
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
                                    onPress={handleSave}
                                    loading={saving}
                                    disabled={!isDirty || saving}
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

                    {/* STATUS CHIP */}
                    <View style={{ marginBottom: 16 }}>
                        <Chip
                            style={[
                                styles.statusChip,
                                { backgroundColor: statusColor + "22" }
                            ]}
                            textStyle={{
                                color: statusColor,
                                fontWeight: "600"
                            }}
                            icon={
                                verificationStatus === "approved"
                                    ? "check-decagram"
                                    : "shield-alert"
                            }
                        >
                            {verificationStatus === "approved"
                                ? "Verified"
                                : verificationStatus === "rejected"
                                    ? "Rejected"
                                    : "Pending Verification"}
                        </Chip>
                    </View>

                    {/* VIEW MODE */}
                    {!isEditing ? (
                        <View>
                            {[
                                { label: "GST Number", value: gst },
                                { label: "PAN Number", value: pan },
                                { label: "Business Registration No.", value: regNum },
                            ].map((row) => (
                                <View
                                    key={row.label}
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
                                        {row.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurface }
                                        ]}
                                    >
                                        {row.value || "—"}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>
                            <TextInput
                                label="GST Number"
                                value={gst}
                                onChangeText={setGst}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="card-account-details-outline" color={theme.colors.onSurface} />}
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
                                label="PAN Number"
                                value={pan}
                                onChangeText={setPan}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="card-bulleted" color={theme.colors.onSurface} />}
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
                                label="Business Registration Number"
                                value={regNum}
                                onChangeText={setRegNum}
                                mode="outlined"
                                style={styles.input}
                                left={<TextInput.Icon icon="file-document-outline" color={theme.colors.onSurface} />}
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
    editButtons: {
        flexDirection: "row",
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
        textAlign: "right",
    },
    input: {
        marginBottom: 12,
    },
    statusChip: {
        alignSelf: "flex-start",
        borderRadius: 8,
    },
    overlay: {
        position: "absolute",
        top: 0, bottom: 0, left: 0, right: 0,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
        zIndex: 200,
    },
    overlayText: {
        marginTop: 8,
        fontWeight: "500",
    },
});
