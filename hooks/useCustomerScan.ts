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
  const validateQRData = useCallback((data: string): { valid: boolean; parsed?: any; error?: string } => {
    try {
      // Check if it's a Grabbitt customer QR
      if (data.startsWith("grabbitt://")) {
        const customerId = data.replace("grabbitt://", "");
        return { valid: true, parsed: { customer_id: customerId, type: "grabbitt" } };
      }

      // Try parsing as JSON (for QR codes with more data)
      const parsed = JSON.parse(data);

      if (parsed.customer_id || parsed.qr_id) {
        return { valid: true, parsed: { ...parsed, type: "json" } };
      }

      return { valid: false, error: "Invalid QR code format" };
    } catch {
      // Not JSON, check if it's a simple customer ID
      if (data.length > 10 && data.length < 50) {
        return { valid: true, parsed: { customer_id: data, type: "simple" } };
      }
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

        // Call API to validate customer QR
        // const response = await api.post("/validateCustomerQR", {
        //   qr_data: qrData,
        //   customer_id: validation.parsed?.customer_id,
        // });

        // if (!response.data.success) {
        //   const error = response.data.error || "Invalid customer QR";
        //   options?.onError?.(error);
        //   return { success: false, error };
        // }

        const result: ScanResult = {
          success: true,
          customer_id: validation.parsed?.user_id,
          customer_name: validation.parsed?.name,
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
    async (customerId: string, orderAmount?: number): Promise<AwardResult> => {
      setProcessing(true);

      try {

        const response = await api.post("/scanUserQRCode", {
          user_id: customerId,
          amount: orderAmount,
        });

        if (!response.data.success) {
          const error = response.data.error || "Failed to award points";
          options?.onError?.(error);
          return { success: false, error };
        }

        const result: AwardResult = {
          success: true,
          points_awarded: response.data.points_earned,
          customer_name: response.data.customer_name,
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
