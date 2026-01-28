/**
 * User Service
 * User-related API calls and utilities
 */

import { storeApi } from "./api";
import { logError } from "@/utils/errorHandler";
import { SimplifiedSeller } from "@/types/seller";

/**
 * Fetch nearby sellers based on location
 */
export async function fetchNearbySellers(
  lat?: number,
  lng?: number
): Promise<{ success: boolean; sellers: SimplifiedSeller[]; error?: string }> {
  try {
    return await storeApi.getNearbySellers(lat, lng);
  } catch (error: any) {
    logError("fetchNearbySellers", error);
    return {
      success: false,
      sellers: [],
      error: error?.response?.data?.error || "Failed to load sellers",
    };
  }
}

// Re-export from api service for convenience
export { storeApi, userApi, walletApi, redemptionApi, perksApi } from "./api";
