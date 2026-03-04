/**
 * Scan Customer QR Screen
 * Main screen for sellers to scan customer QR codes and award points
 */

import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { useTheme } from "@/hooks/use-theme-color";
import { useCustomerScan } from "@/hooks/useCustomerScan";
import { sellerRedemptionsApi } from '@/services';
import { useAuthStore } from "@/store/authStore";

import { OrderAmountInput } from "@/components/scan/order-amount-input";
import { ScanSuccess } from "@/components/scan/scan-success";
import { LoadingView } from "@/components/shared/loading-view";
import { PermissionView } from "@/components/shared/permission-view";
import { ScannerOverlay } from "@/components/shared/scan-overlay";

type ScreenState = "scanning" | "amount_input" | "processing" | "success";

export default function ScanCustomer() {
  const theme = useTheme();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const fetchUserDetails = useAuthStore((state) => state.fetchUserDetails);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [screenState, setScreenState] = useState<
    "scanning" | "amount_input" | "processing" | "success"
  >("scanning");

  const [cameraActive, setCameraActive] = useState(true);
  const [scanned, setScanned] = useState(false);
  // Award result for success screen
  const [awardResult, setAwardResult] = useState<{
    customerName?: string;
    pointsAwarded: number;
  } | null>(null);

  // Debounce ref to prevent duplicate scans (iOS camera fires twice)
  const scanProcessingRef = useRef(false);

  const {
    processScan,
    awardPoints,
    scanResult,
    resetScan,
    needsOrderAmount,
    processing,
    rewardConfig,
  } = useCustomerScan({
    onError: (err) => Alert.alert("Error", err),
  });

  // -----------------------------
  // Focus reset
  // -----------------------------
  useFocusEffect(
    useCallback(() => {
      handleReset();
      return () => setCameraActive(false);
    }, [])
  );

  // -----------------------------
  // MAIN UNIFIED SCAN HANDLER (with debounce for iOS double-scan)
  // -----------------------------
  const handleBarcodeScanned = async ({
    data,
    type,
  }: {
    data: string;
    type: string;
  }) => {
    // Prevent duplicate processing (iOS camera fires twice)
    if (scanProcessingRef.current || scanned || !cameraActive || type !== "qr" || screenState !== "scanning") {
      return;
    }

    // Immediately mark as processing to prevent concurrent scans
    scanProcessingRef.current = true;
    setScanned(true);
    setCameraActive(false);

    try {
      const parsed = JSON.parse(data);

      // =========================
      // REDEEM FLOW
      // =========================
      if (parsed?.redemption_id) {
        setScreenState("processing");

        const res = await sellerRedemptionsApi.processRedemption({ redemption_id: parsed.redemption_id });

        if (!res?.success) throw new Error(res?.error || 'Redemption failed');

        router.replace({
          pathname: "/(drawer)/redeem-success",
          params: {
            redemption_id: parsed.redemption_id,
            points: res.points_redeemed,
            user_name: res.user_name,
          },
        });

        return;
      }

      // =========================
      // AWARD FLOW
      // =========================
      if (parsed?.token) {
        const result = await processScan(data);

        if (!result.success) {
          handleReset();
          setCameraActive(false);
          return;
        }

        if (needsOrderAmount) {
          setScreenState("amount_input");
        } else {
          await handleAwardPoints(result.qr_id!);
        }

        return;
      }

      throw new Error("Invalid QR code");
    } catch (e: any) {
      Alert.alert("Scan Failed", e.message, [
        { text: "Scan Again", onPress: handleReset },
      ]);
    } finally {
      // Reset debounce flag
      scanProcessingRef.current = false;
    }
  };

  // -----------------------------
  // Award points
  // -----------------------------
  const handleAwardPoints = async (qrId: string, amount?: number) => {
    setScreenState("processing");

    const result = await awardPoints(qrId, amount);

    if (!result.success) {

      Alert.alert("Error", result.error || "Failed to award points", [
        { text: "Try Again", onPress: handleReset },
      ]);
      return;
    }

    setAwardResult({
      customerName: result.customer_name,
      pointsAwarded: result.points_awarded || 0,
    });

    fetchUserDetails(user?.user.uid ?? "", "seller");

    setScreenState("success");
  };

  // -----------------------------
  const handleReset = () => {
    scanProcessingRef.current = false;
    setCameraActive(true);
    setScanned(false);
    setScreenState("scanning");
    setAwardResult(null);
    resetScan();
  };

  // -----------------------------
  // Permissions
  // -----------------------------
  if (!cameraPermission) return <LoadingView color={theme.colors.primary} />;

  if (!cameraPermission.granted) {
    return (
      <PermissionView
        onRequestPermission={requestCameraPermission}
        primary={theme.colors.primary}
        onPrimary={theme.colors.accent}
        isDenied={!cameraPermission.canAskAgain}
      />
    );
  }

  // -----------------------------
  // States UI
  // -----------------------------
  if (screenState === "processing") {
    return <LoadingView color={theme.colors.primary} message="Processing..." />;
  }

  if (screenState === "amount_input" && scanResult) {
    return (
      <OrderAmountInput
        customerName={scanResult.customer_name}
        rewardType={rewardConfig.type as "percentage" | "slab"}
        percentageValue={rewardConfig.percentageValue}
        slabRules={rewardConfig.slabRules}
        onSubmit={(amt) => handleAwardPoints(scanResult.qr_id!, amt)}
        onCancel={handleReset}
        calculating={processing}
      />
    );
  }

  if (screenState === "success" && awardResult) {
    return (
      <ScanSuccess
        {...awardResult}
        onDone={() => router.replace("/(drawer)/(tabs)/dashboard")}
        onScanAnother={handleReset}
      />
    );
  }

  // -----------------------------
  // Camera screen
  // -----------------------------
  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      {cameraActive && !scanned && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      )}

      <ScannerOverlay title="Scan QR" subtitle="Scan customer or redemption QR" />
    </View>
  );
}

