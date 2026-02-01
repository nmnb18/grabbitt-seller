/**
 * useCustomerScan Hook
 * Handles scanning customer QR codes and awarding points
 */

import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import { useCallback, useState } from "react";

export type RewardType = "default" | "percentage" | "slab" | "flat";

export interface ScanResult {
  success: boolean;
  customer_id?: string;
  customer_name?: string;
  qr_id?: string;
  error?: string;
}

export interface AwardResult {
  success: boolean;
  points_awarded?: number;
  customer_name?: string;
  error?: string;
}

export interface SlabRule {
  min: number;
  max: number;
  points: number;
}

interface UseCustomerScanOptions {
  onScanSuccess?: (result: ScanResult) => void;
  onAwardSuccess?: (result: AwardResult) => void;
  onError?: (error: string) => void;
}

export function useCustomerScan(options?: UseCustomerScanOptions) {
  const { user } = useAuthStore();
  const sellerProfile = user?.user?.seller_profile;

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  // Get reward configuration from seller profile
  const rewardType: RewardType = (sellerProfile?.rewards?.reward_type as RewardType) || "default";
  const defaultPoints = sellerProfile?.rewards?.default_points_value || 10;
  const percentageValue = parseFloat(sellerProfile?.rewards?.percentage_value || "0");
  const slabRules: SlabRule[] = sellerProfile?.rewards?.slab_rules || [];
  const flatPoints = parseInt(sellerProfile?.rewards?.flat_points || "0", 10);

  /**
   * Check if we need order amount input
   */
  const needsOrderAmount = useCallback((): boolean => {
    return rewardType === "percentage" || rewardType === "slab";
  }, [rewardType]);


  /**
   * Validate scanned QR data
   */
  const validateQRData = useCallback((data: string) => {
    try {
      // If your QR is now JSON with token
      const parsed = JSON.parse(data);
      if (parsed.token) {
        return { valid: true, parsed: { token: parsed.token } };
      }

      return { valid: false, error: "Invalid QR code format" };
    } catch {
      return { valid: false, error: "Could not parse QR code" };
    }
  }, []);


  /**
   * Process scanned customer QR
   */
  const processScan = useCallback(
    async (qrData: string): Promise<ScanResult> => {
      setScanning(true);

      try {
        const validation = validateQRData(qrData);

        if (!validation.valid) {
          const error = validation.error || "Invalid QR code";
          options?.onError?.(error);
          return { success: false, error };
        }
        const result: ScanResult = {
          success: true,
          qr_id: validation.parsed?.token,
        };

        setScanResult(result);
        options?.onScanSuccess?.(result);

        return result;
      } catch (error: any) {
        const errorMsg = error?.response?.data?.error || error.message || "Scan failed";
        options?.onError?.(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setScanning(false);
      }
    },
    [validateQRData, options]
  );

  /**
   * Award points to customer
   */
  const awardPoints = useCallback(
    async (token: string, orderAmount?: number): Promise<AwardResult> => {
      setProcessing(true);

      try {

        const response = await api.post("/scanUserQRCode", {
          token,
          amount: orderAmount,
        });

        if (!response.data.success) {
          const error = response.data.error || "Failed to award points";
          options?.onError?.(error);
          return { success: false, error };
        }

        const result: AwardResult = {
          success: true,
          points_awarded: response.data.data.points_earned,
          customer_name: response.data.data.customer_name,
        };

        options?.onAwardSuccess?.(result);
        return result;
      } catch (error: any) {
        const errorMsg = error?.response?.data?.error || error.message || "Award failed";
        options?.onError?.(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setProcessing(false);
      }
    },
    [rewardType, defaultPoints, options]
  );

  /**
   * Reset scan state
   */
  const resetScan = useCallback(() => {
    setScanResult(null);
    setScanning(false);
    setProcessing(false);
  }, []);

  return {
    // State
    scanning,
    processing,
    scanResult,
    rewardType,
    defaultPoints,

    // Computed
    needsOrderAmount: needsOrderAmount(),

    // Actions
    processScan,
    awardPoints,
    validateQRData,
    resetScan,

    // Config (for display)
    rewardConfig: {
      type: rewardType,
      defaultPoints,
      percentageValue,
      slabRules,
      flatPoints,
    },
  };
}
