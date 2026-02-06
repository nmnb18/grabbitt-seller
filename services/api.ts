/**
 * API Service
 * Centralized API calls with proper error handling
 */

import { SimplifiedSeller, StoreDetails } from "@/types/seller";
import { WalletData } from "@/types/wallet";
import { logError } from "@/utils/errorHandler";
import {
  analyticsApi as fbAnalyticsApi,
  mediaApi as fbMediaApi,
  notificationApi as fbNotificationApi,
  offersApi as fbOffersApi,
  paymentApi as fbPaymentApi,
  perksApi as fbPerksApi,
  qrCodeApi as fbQrApi,
  redemptionApi as fbRedemptionApi,
  sellerRedemptionsApi as fbSellerRedemptionsApi,
  storeApi as fbStoreApi,
  subscriptionApi as fbSubscriptionApi,
  userApi as fbUserApi,
  walletApi as fbWalletApi,
} from "./firebaseFunctions";

// ============================================
// User APIs
// ============================================

export const userApi = {
  /**
   * Get user details by UID
   */
  getDetails: async (uid: string) => {
    return await fbUserApi.getDetails(uid);
  },

  /**
   * Update user profile section
   */
  updateProfile: async (section: string, data: Record<string, unknown>) => {
    return await fbUserApi.updateProfile(section, data as any);
  },

  /**
   * Delete user account
   */
  deleteAccount: async () => {
    return await fbUserApi.deleteAccount();
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    return await fbUserApi.changePassword(currentPassword, newPassword);
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
      return await fbStoreApi.getNearbySellers(params.lat, params.lng);
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
    return await fbStoreApi.getStoreDetails(sellerId as string);
  },

  /**
   * Get balance by seller
   */
  getBalanceBySeller: async (sellerId: string) => {
    return await fbStoreApi.getBalanceBySeller(sellerId);
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
    return await fbWalletApi.getWallet();
  },

  /**
   * Get transaction history
   */
  getTransactions: async (limit = 50) => {
    return await fbWalletApi.getTransactions(limit);
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
    return await fbRedemptionApi.getHistory();
  },

  /**
   * Create redemption request
   */
  createRedemption: async (data: {
    seller_id: string;
    offer_id: string;
    points: number;
  }) => {
    return await fbRedemptionApi.createRedemption(data as any);
  },

  /**
   * Get redemption QR code
   */
  getRedemptionQR: async (redemptionId: string) => {
    return await fbRedemptionApi.getRedemptionQR(redemptionId);
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
    return await fbPerksApi.claimPerk(sellerId);
  },

  /**
   * Get today's perk for a store
   */
  getTodayPerk: async (sellerId: string) => {
    return await fbPerksApi.getTodayPerk(sellerId);
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
    return await fbNotificationApi.registerToken({ user_id: userId, push_token: pushToken });
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
  // legacy mappings to firebase functions
  firebase: {
    user: fbUserApi,
    store: fbStoreApi,
    wallet: fbWalletApi,
    redemption: fbRedemptionApi,
    perks: fbPerksApi,
    notification: fbNotificationApi,
    qr: fbQrApi,
    payment: fbPaymentApi,
    offers: fbOffersApi,
    analytics: fbAnalyticsApi,
    media: fbMediaApi,
    subscription: fbSubscriptionApi,
    sellerRedemptions: fbSellerRedemptionsApi,
  },
};
