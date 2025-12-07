import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/use-theme-color";
import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";

import { LoadingView } from "@/components/shared/loading-view";
import { PermissionView } from "@/components/shared/permission-view";
import { ScannerOverlay } from "@/components/shared/scan-overlay";

export default function SellerRedeemQR() {
    const { user } = useAuthStore();
    const theme = useTheme();
    const router = useRouter();
    const { primary, onPrimary } = theme.colors;

    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [processingScan, setProcessingScan] = useState(false);
    const [cameraActive, setCameraActive] = useState(true);

    // ✅ Reset when screen refocuses
    useFocusEffect(
        useCallback(() => {
            setCameraActive(true);
            setScanned(false);
            setProcessingScan(false);

            return () => {
                setCameraActive(false);
            };
        }, [])
    );

    // ✅ PERMISSIONS
    if (!cameraPermission) {
        return <LoadingView color={primary} />;
    }

    if (!cameraPermission.granted) {
        return (
            <PermissionView
                onRequestPermission={requestCameraPermission}
                primary={primary}
                onPrimary={onPrimary}
            />
        );
    }

    if (processingScan) {
        return <LoadingView color={primary} message="Processing redemption..." />;
    }

    // ✅ MAIN SCAN HANDLER
    const handleBarcodeScanned = async ({
        data,
        type,
    }: {
        data: string;
        type: string;
    }) => {
        if (scanned || !cameraActive || processingScan || type !== "qr") return;

        setScanned(true);
        setProcessingScan(true);

        try {
            // ✅ Parse QR Payload
            const parsed = JSON.parse(data);

            if (!parsed?.redemption_id) {
                throw new Error("Invalid redemption QR");
            }

            // ✅ Call your existing working function
            const response = await api.post("/processRedemption", {
                redemption_id: parsed.redemption_id,
            });

            if (!response.data.success) {
                throw new Error(response.data.error || "Redemption failed");
            }

            // ✅ SUCCESS → Navigate to Seller Success Screen
            router.replace({
                pathname: "/(drawer)/redeem-success",
                params: {
                    redemption_id: parsed.redemption_id,
                    points: response.data.points_redeemed,
                    user_name: parsed.user_name,
                    timestamp: new Date().toISOString(),
                },
            });
        } catch (error: any) {
            console.error("Redeem Scan Error:", error);

            Alert.alert(
                "Redemption Failed",
                error.response?.data?.error || error.message || "Invalid QR Code",
                [
                    {
                        text: "Scan Again",
                        onPress: () => {
                            setScanned(false);
                            setProcessingScan(false);
                        },
                    },
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* ✅ CAMERA */}
            {cameraActive && !scanned && !processingScan && (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarcodeScanned}
                    barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                />
            )}

            {/* ✅ OVERLAY */}
            {!processingScan && <ScannerOverlay />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
});
