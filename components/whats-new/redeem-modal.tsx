import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import { ActivityIndicator, Surface, Text } from "react-native-paper";

import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";

interface RedeemModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function RedeemModal({
    visible,
    onClose,
    onSuccess,
}: RedeemModalProps) {
    const theme = useTheme();

    const PREFIX = "RED-GRAB-";
    const [codeSuffix, setCodeSuffix] = useState("");
    const [loading, setLoading] = useState(false);
    const [successData, setSuccessData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const verifyCode = async () => {
        if (!codeSuffix.trim()) {
            setError("Please enter redeem code");
            return;
        }

        const redeem_code = `RED-GRAB-${codeSuffix.trim()}`;

        try {
            setLoading(true);
            setError(null);

            const resp = await api.post("/verifyRedeemCode", {
                redeem_code,
            });

            if (resp.data.success) {
                setSuccessData(resp.data.redemption);
                onSuccess?.();
            } else {
                setError(resp.data.error || "Invalid redeem code");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to verify code");
        } finally {
            setLoading(false);
        }
    };


    const handleClose = () => {
        setCodeSuffix("");
        setSuccessData(null);
        setError(null);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.overlay}
            >
                <Surface style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Redeem Offer</Text>
                        <MaterialCommunityIcons
                            name="close"
                            size={22}
                            onPress={handleClose}
                            color={theme.colors.onBackground}
                        />
                    </View>

                    {/* CONTENT */}
                    {!successData ? (
                        <>
                            <Text style={styles.label}>Enter Redeem Code</Text>

                            <View style={styles.codeRow}>
                                {/* PREFIX */}
                                <View style={styles.prefixBox}>
                                    <Text style={styles.prefixText}>RED-GRAB-</Text>
                                </View>

                                {/* SUFFIX INPUT */}
                                <TextInput
                                    value={codeSuffix}
                                    onChangeText={(text) =>
                                        setCodeSuffix(text.replace(/[^A-Z0-9]/gi, "").toUpperCase())
                                    }
                                    placeholder="XXXX"
                                    maxLength={8}
                                    autoCapitalize="characters"
                                    editable={!loading}
                                    style={[
                                        styles.suffixInput,
                                        {
                                            borderColor: error
                                                ? theme.colors.error
                                                : theme.colors.outline,
                                            color: theme.colors.onSurface,
                                        },
                                    ]}
                                />
                            </View>


                            {error && (
                                <Text style={[styles.error, { color: theme.colors.error }]}>
                                    {error}
                                </Text>
                            )}

                            <Button
                                variant="contained"
                                onPress={verifyCode}
                                loading={loading}
                                disabled={loading}
                            >
                                Verify & Redeem
                            </Button>
                        </>
                    ) : (
                        <>
                            {/* SUCCESS STATE */}
                            <View style={styles.successBox}>
                                <MaterialCommunityIcons
                                    name="check-circle"
                                    size={48}
                                    color={theme.colors.success}
                                />

                                <Text style={styles.successTitle}>Redeemed Successfully</Text>

                                <Text style={styles.successText}>
                                    Free {successData.offer.title} on minimum spend of Rs.{successData.offer.min_spend}!
                                </Text>

                                <Text style={styles.successSub}>
                                    Code: {successData.redeem_code}
                                </Text>
                            </View>

                            <Button variant="outlined" onPress={handleClose}>
                                Close
                            </Button>
                        </>
                    )}

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" />
                        </View>
                    )}
                </Surface>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    modal: {
        borderRadius: 16,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        marginBottom: 10,
        fontSize: 16,
    },
    codeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },

    prefixBox: {
        paddingHorizontal: 12,
        height: 48,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        backgroundColor: "rgba(0,0,0,0.05)",
    },

    prefixText: {
        fontWeight: "700",
        fontSize: 14,
    },

    suffixInput: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        paddingHorizontal: 12,
        fontSize: 16,
    },

    error: {
        marginBottom: 10,
        fontSize: 12,
    },
    successBox: {
        alignItems: "center",
        gap: 8,
        marginVertical: 20,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: "700",
    },
    successText: {
        fontSize: 18,
        textAlign: "center",
    },
    successSub: {
        fontSize: 12,
        opacity: 0.7,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.6)",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 16,
    },
});

