/**
 * Scan Customer QR Screen
 * Main screen for sellers to scan customer QR codes and award points
 */

import React, { useState, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

import { useTheme } from "@/hooks/use-theme-color";
import { useCustomerScan } from "@/hooks/useCustomerScan";
import { useAuthStore } from "@/store/authStore";

import { LoadingView } from "@/components/shared/loading-view";
import { PermissionView } from "@/components/shared/permission-view";
import { ScannerOverlay } from "@/components/shared/scan-overlay";
import { OrderAmountInput } from "@/components/scan/OrderAmountInput";
import { ScanSuccess } from "@/components/scan/ScanSuccess";

type ScreenState = "scanning" | "amount_input" | "processing" | "success";

export default function ScanCustomerQR() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const sellerProfile = user?.user?.seller_profile;

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [screenState, setScreenState] = useState<ScreenState>("scanning");
  const [cameraActive, setCameraActive] = useState(true);
  const [scanned, setScanned] = useState(false);

  // Award result for success screen
  const [awardResult, setAwardResult] = useState<{
    customerName?: string;
    pointsAwarded: number;
    transactionId?: string;
  } | null>(null);

  // Use our custom scan hook
  const {
    processScan,
    awardPoints,
    scanResult,
    resetScan,
    needsOrderAmount,
    processing,
    rewardConfig,
  } = useCustomerScan({
    onError: (error) => {
      Alert.alert("Error", error, [
        { text: "Scan Again", onPress: handleReset },
      ]);
    },
  });

  // Reset when screen focuses
  useFocusEffect(
    useCallback(() => {
      setCameraActive(true);
      setScanned(false);
      setScreenState("scanning");
      resetScan();

      return () => {
        setCameraActive(false);
      };
    }, [])
  );

  // Handle QR code scanned
  const handleBarcodeScanned = async ({ data, type }: { data: string; type: string }) => {
    if (scanned || !cameraActive || screenState !== "scanning" || type !== "qr") return;

    setScanned(true);
    setCameraActive(false);

    try {
      const result = await processScan(data);

      if (!result.success) {
        setScanned(false);
        setCameraActive(true);
        return;
      }

      // Check if we need order amount
      if (needsOrderAmount) {
        setScreenState("amount_input");
      } else {
        // Default reward - award immediately
        await handleAwardPoints(result.customer_id!, undefined);
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      Alert.alert("Error", "Failed to process QR code", [
        { text: "Try Again", onPress: handleReset },
      ]);
    }
  };

  // Award points (called directly for default, or after amount input)
  const handleAwardPoints = async (customerId: string, orderAmount?: number) => {
    setScreenState("processing");

    const result = await awardPoints(customerId, orderAmount);

    if (result.success) {
      setAwardResult({
        customerName: result.customer_name,
        pointsAwarded: result.points_awarded || 0,
        transactionId: result.transaction_id,
      });
      setScreenState("success");
    } else {
      Alert.alert("Error", result.error || "Failed to award points", [
        { text: "Try Again", onPress: handleReset },
      ]);
    }
  };

  // Handle amount submission
  const handleAmountSubmit = async (amount: number) => {
    if (!scanResult?.customer_id) {
      Alert.alert("Error", "Customer data lost. Please scan again.");
      handleReset();
      return;
    }

    await handleAwardPoints(scanResult.customer_id, amount);
  };

  // Reset to scanning state
  const handleReset = () => {
    setScanned(false);
    setCameraActive(true);
    setScreenState("scanning");
    setAwardResult(null);
    resetScan();
  };

  // Handle done - go to dashboard
  const handleDone = () => {
    router.replace("/(drawer)/(tabs)/dashboard");
  };

  // Permission loading
  if (!cameraPermission) {
    return <LoadingView color={theme.colors.primary} />;
  }

  // Permission denied
  if (!cameraPermission.granted) {
    const isDenied = !cameraPermission.canAskAgain;
    return (
      <PermissionView
        onRequestPermission={requestCameraPermission}
        primary={theme.colors.primary}
        onPrimary={theme.colors.accent}
        isDenied={isDenied}
      />
    );
  }

  // Processing state
  if (screenState === "processing") {
    return <LoadingView color={theme.colors.primary} message="Awarding points..." />;
  }

  // Amount input screen
  if (screenState === "amount_input" && scanResult) {
    return (
      <OrderAmountInput
        customerName={scanResult.customer_name}
        rewardType={rewardConfig.type as "percentage" | "slab"}
        percentageValue={rewardConfig.percentageValue}
        slabRules={rewardConfig.slabRules}
        onSubmit={handleAmountSubmit}
        onCancel={handleReset}
        calculating={processing}
      />
    );
  }

  // Success screen
  if (screenState === "success" && awardResult) {
    return (
      <ScanSuccess
        customerName={awardResult.customerName}
        pointsAwarded={awardResult.pointsAwarded}
        transactionId={awardResult.transactionId}
        onDone={handleDone}
        onScanAnother={handleReset}
      />
    );
  }

  // Main scanning screen
  return (
    <View style={styles.container}>
      {cameraActive && !scanned && (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      )}

      {!processing && <ScannerOverlay title="Scan Customer QR" subtitle="Point camera at customer's QR code" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
});
