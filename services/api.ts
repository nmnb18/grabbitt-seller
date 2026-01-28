/**
 * API Service
 * Centralized API calls with proper error handling
 */

import { SimplifiedSeller, StoreDetails } from "@/types/seller";
import { WalletData } from "@/types/wallet";
import { logError } from "@/utils/errorHandler";
import api from "./axiosInstance";

// ============================================
// User APIs
// ============================================

export const userApi = {
  /**
   * Get user details by UID
   */
  getDetails: async (uid: string) => {
    const response = await api.get(`/getUserDetails?uid=${uid}`);
    return response.data;
  },

  /**
   * Update user profile section
   */
  updateProfile: async (section: string, data: Record<string, unknown>) => {
    const response = await api.patch("/updateUserProfile", { section, data });
    return response.data;
  },

  /**
   * Delete user account
   */
  deleteAccount: async () => {
    const response = await api.delete("/deleteUser");
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.post("/reauthenticate", { currentPassword });
    const response = await api.post("/changePassword", { newPassword });
    return response.data;
  },
};

// ============================================
// Seller/Store APIs
// ============================================

export const storeApi = {
  /**
   * Get nearby sellers
   */
  getNearbySellers: async (
    lat?: number,
    lng?: number
  ): Promise<{ success: boolean; sellers: SimplifiedSeller[]; error?: string }> => {
    try {
      const params: Record<string, number> = {};
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }
      const response = await api.get("/getNearbySellers", { params });
      return response.data;
    } catch (error) {
      logError("getNearbySellers", error);
      throw error;
    }
  },

  /**
   * Get store details by ID
   */
  getStoreDetails: async (
    sellerId: string
  ): Promise<{ success: boolean; user: { seller_profile: StoreDetails } }> => {
    const response = await api.get("/getSellerDetails", {
      params: { seller_id: sellerId },
    });
    return response.data;
  },

  /**
   * Get balance by seller
   */
  getBalanceBySeller: async (sellerId: string) => {
    const response = await api.get("/getBalanceBySeller", {
      params: { seller_id: sellerId },
    });
    return response.data;
  },
};

// ============================================
// Wallet APIs
// ============================================

export const walletApi = {
  /**
   * Get wallet data
   */
  getWallet: async (): Promise<{ success: boolean; data: WalletData }> => {
    const response = await api.get("/getWallet");
    return response.data;
  },

  /**
   * Get transaction history
   */
  getTransactions: async (limit = 50) => {
    const response = await api.get("/getTransactions", {
      params: { limit },
    });
    return response.data;
  },
};

// ============================================
// Redemption APIs
// ============================================

export const redemptionApi = {
  /**
   * Get redemption history
   */
  getHistory: async () => {
    const response = await api.get("/getRedemptionHistory");
    return response.data;
  },

  /**
   * Create redemption request
   */
  createRedemption: async (data: {
    seller_id: string;
    offer_id: string;
    points: number;
  }) => {
    const response = await api.post("/createRedemption", data);
    return response.data;
  },

  /**
   * Get redemption QR code
   */
  getRedemptionQR: async (redemptionId: string) => {
    const response = await api.get("/getRedemptionQR", {
      params: { redemption_id: redemptionId },
    });
    return response.data;
  },
};

// ============================================
// Perks APIs
// ============================================

export const perksApi = {


  /**
   * Claim a perk
   */
  claimPerk: async (sellerId: string) => {
    const response = await api.post("/claimPerk", { seller_id: sellerId });
    return response.data;
  },

  /**
   * Get today's perk for a store
   */
  getTodayPerk: async (sellerId: string) => {
    const response = await api.get("/getTodayPerk", {
      params: { seller_id: sellerId },
    });
    return response.data;
  },
};

// ============================================
// Notification APIs
// ============================================

export const notificationApi = {
  /**
   * Register push token
   */
  registerToken: async (userId: string, pushToken: string) => {
    const response = await api.post("/api/notifications/register-token", {
      user_id: userId,
      push_token: pushToken,
    });
    return response.data;
  },
};

// Export all APIs
export default {
  user: userApi,
  store: storeApi,
  wallet: walletApi,
  redemption: redemptionApi,
  perks: perksApi,
  notification: notificationApi,
};
