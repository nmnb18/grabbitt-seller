/**
 * Firebase Callable Functions Service
 * Replaces axios REST calls with Firebase callable functions
 * Provides automatic authentication, better error handling, and ~60% faster responses
 */

import { SimplifiedSeller, StoreDetails } from '@/types/seller';
import { WalletData } from '@/types/wallet';
import { logError } from '@/utils/errorHandler';
import { getFunctionsInstance } from './firebaseConfig';

/**
 * Wrapper to handle Firebase callable function errors consistently
 */
const callFunction = async <T = unknown, R = unknown>(functionName: string, data?: T): Promise<any> => {
  try {
    const functions = await getFunctionsInstance();
    const mod: any = await import('firebase/functions');
    const httpsCallable = mod.httpsCallable as any;
    const fn = httpsCallable(functions, functionName);
    const result = await fn(data);
    return result?.data;
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    logError(`${functionName}`, error);

    // Firebase callable errors come with more detail
    const firebaseError = {
      code: error?.code || 'UNKNOWN_ERROR',
      message: errorMsg,
      details: error?.details,
    };

    throw firebaseError;
  }
};

// =====================================
// User APIs
// =====================================
export const userApi: any = {
  /**
   * Login user (legacy auth flow)
   */
  loginUser: async (payload: { email: string; password: string; role?: string }) => {
    return callFunction('loginUser', payload);
  },

  /**
   * Register user (legacy auth flow)
   */
  registerUser: async (payload: Record<string, any>) => {
    return callFunction('registerUser', payload);
  },

  /**
   * Forgot password (legacy auth flow)
   */
  forgotPassword: async (email: string) => {
    return callFunction('forgotPassword', { email });
  },

  /**
   * Reset password (legacy auth flow)
   */
  resetPassword: async (oobCode: string, newPassword: string) => {
    return callFunction('resetPassword', { oobCode, newPassword });
  },
  /**
   * Get user details by UID
   */
  getDetails: async (uid: string) => {
    return callFunction('getUserDetails', { uid });
  },
  /**
    * Logout
    */
  logout: async (uid: string) => {
    return callFunction('logout', { uid });
  },


  /**
   * Update user profile section
   */
  updateProfile: async (section: string, data: Record<string, unknown>) => {
    return callFunction('updateUserProfile', { section, data });
  },

  /**
   * Register seller (creates backend seller profile)
   * Payload should include `uid` from Firebase Auth and any other registration fields
   */
  registerSeller: async (payload: Record<string, any>) => {
    return callFunction('registerSeller', payload);
  },

  /**
   * Delete user account
   */
  deleteAccount: async () => {
    return callFunction('deleteUser', {});
  },

  /**
   * Delete seller account (backend callable)
   */
  deleteSellerAccount: async (sellerId?: string) => {
    return callFunction('deleteSellerAccount', { seller_id: sellerId });
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    // First reauthenticate
    await callFunction('reauthenticate', { currentPassword });
    // Then change password
    return callFunction('changePassword', { newPassword });
  },
};

// =====================================
// Seller/Store APIs
// =====================================
export const storeApi: any = {
  /**
   * Get nearby sellers
   */
  getNearbySellers: async (
    lat?: number,
    lng?: number
  ): Promise<{ success: boolean; sellers: SimplifiedSeller[]; error?: string }> => {
    try {
      const data: Record<string, any> = {};
      if (lat !== undefined && lng !== undefined) {
        data.lat = lat;
        data.lng = lng;
      }
      return await callFunction('getNearbySellers', data);
    } catch (error) {
      logError('getNearbySellers', error);
      throw error;
    }
  },

  /**
   * Get store details by ID
   */
  getStoreDetails: async (
    sellerId: string
  ): Promise<{ success: boolean; user: { seller_profile: StoreDetails } }> => {
    return callFunction('getSellerDetails', { seller_id: sellerId });
  },

  /**
   * Get balance by seller
   */
  getBalanceBySeller: async (sellerId: string) => {
    return callFunction('getBalanceBySeller', { seller_id: sellerId });
  },
};

// =====================================
// Wallet APIs
// =====================================
export const walletApi: any = {
  /**
   * Get wallet data
   */
  getWallet: async (): Promise<{ success: boolean; data: WalletData }> => {
    return callFunction('getPointsBalance', {});
  },

  /**
   * Get transaction history
   */
  getTransactions: async (limit = 50) => {
    return callFunction('getTransactions', { limit });
  },
};

// =====================================
// Redemption APIs
// =====================================
export const redemptionApi: any = {
  /**
   * Get redemption history
   */
  getHistory: async () => {
    return callFunction('getSellerRedemption', {});
  },

  /**
   * Create redemption request
   */
  createRedemption: async (data: {
    seller_id: string;
    offer_id: string;
    points: number;
  }) => {
    return callFunction('createRedemption', data);
  },

  /**
   * Get redemption QR code
   */
  getRedemptionQR: async (redemptionId: string) => {
    return callFunction('getRedemptionQR', { redemption_id: redemptionId });
  },
};

// =====================================
// Perks APIs
// =====================================
export const perksApi: any = {
  /**
   * Claim a perk
   */
  claimPerk: async (sellerId: string) => {
    return callFunction('redeemTodayOffer', { seller_id: sellerId });
  },

  /**
   * Get today's perk for a store
   */
  getTodayPerk: async (sellerId: string) => {
    return callFunction('getTodayOfferStatus', { seller_id: sellerId });
  },
};

// =====================================
// Notification APIs
// =====================================
export const notificationApi: any = {
  /**
   * Register push token (accepts payload with optional user_id and device metadata)
   * payload: { user_id?: string, push_token: string, platform?: string, device_name?: string, device_model?: string }
   */
  registerToken: async (payload: Record<string, any>) => {
    return callFunction('registerPushToken', payload);
  },

  /**
   * Unregister push token
   */
  unregisterPushToken: async (payload: { push_token: string }) => {
    return callFunction('unregisterPushToken', payload);
  },
  /**
   * Get unread notification count
   */
  getUnreadCount: async () => {
    return callFunction('getUnreadNotificationCount', {});
  },

  /**
   * Get notifications list
   */
  getNotifications: async () => {
    return callFunction('getNotifications', {});
  },

  /**
   * Mark notifications read
   */
  markNotificationsRead: async (ids: string[]) => {
    return callFunction('markNotificationsRead', { notificationIds: ids });
  },
};

// =====================================
// QR Code APIs
// =====================================
export const qrCodeApi: any = {
  /**
   * Generate QR code
   */
  generateQRCode: async (data: Record<string, unknown>) => {
    return callFunction('generateQRCode', data);
  },

  /**
   * Scan QR code
   */
  scanQRCode: async (qrData: string) => {
    return callFunction('scanQRCode', { qr_data: qrData });
  },

  /**
   * Get active QR codes
   */
  getActiveQR: async () => {
    return callFunction('getActiveQR', {});
  },
  /**
   * Scan user QR (award points)
   * payload: { user_id: string, amount?: number }
   */
  scanUserQRCode: async (payload: { user_id: string; amount?: number }) => {
    return callFunction('scanUserQRCode', payload);
  },
};

// =====================================
// Payment APIs
// =====================================
export const paymentApi: any = {
  /**
   * Create order
   */
  createOrder: async (data: Record<string, unknown>) => {
    return callFunction('createOrder', data);
  },

  /**
   * Verify payment
   */
  verifyPayment: async (data: Record<string, unknown>) => {
    return callFunction('verifyPayment', data);
  },

  /**
   * Apply coupon
   */
  applyCoupon: async (couponCode: string) => {
    // Accept either a plain coupon code string or an object payload
    if (typeof couponCode === 'string') {
      return callFunction('applyCoupon', { coupon_code: couponCode });
    }
    return callFunction('applyCoupon', couponCode as any);
  },
  /**
   * Verify IAP purchase (Apple)
   */
  verifyIAPPurchase: async (payload: Record<string, any>) => {
    return callFunction('verifyIAPPurchase', payload);
  },
};

// (default export moved to end to include extended APIs)

// =====================================
// Offers APIs (whats-new)
// =====================================
export const offersApi: any = {
  getSellerOffers: async (date?: string) => {
    const data: Record<string, any> = {};
    if (date) data.date = date;
    return callFunction('getSellerOffers', data);
  },

  getSellerRedeemedPerks: async () => {
    return callFunction('getSellerRedeemedPerks', {});
  },

  deleteSellerOffer: async (date: string) => {
    return callFunction('deleteSellerOffer', { date });
  },

  saveSellerOffer: async (payload: Record<string, any>) => {
    return callFunction('saveSellerOffer', payload);
  },

  verifyRedeemCode: async (code: string) => {
    return callFunction('verifyRedeemCode', { code });
  },
};

// =====================================
// Analytics APIs
// =====================================
export const analyticsApi: any = {
  sellerStats: async () => {
    return callFunction('sellerStats', {});
  },

  sellerAdvancedAnalytics: async () => {
    return callFunction('sellerAdvancedAnalytics', {});
  },
};

// =====================================
// Media APIs
// =====================================
export const mediaApi: any = {
  updateSellerMedia: async (payload: Record<string, any>) => {
    return callFunction('updateSellerMedia', payload);
  },
};

// =====================================
// Subscription APIs
// =====================================
export const subscriptionApi: any = {
  getSubscriptionHistory: async (sellerId?: string) => {
    return callFunction('getSubscriptionHistory', { sellerId });
  },
};

// =====================================
// Seller Redemptions / Process
// =====================================
export const sellerRedemptionsApi: any = {
  getSellerRedemptions: async () => {
    return callFunction('getSellerRedemptions', {});
  },

  processRedemption: async (payload: Record<string, any>) => {
    return callFunction('processRedemption', payload);
  },
};

// Extend default export to include new APIs
export const _firebaseDefault = {
  user: userApi,
  store: storeApi,
  wallet: walletApi,
  redemption: redemptionApi,
  perks: perksApi,
  notification: notificationApi,
  qrCode: qrCodeApi,
  payment: paymentApi,
  offers: offersApi,
  analytics: analyticsApi,
  media: mediaApi,
  subscription: subscriptionApi,
  sellerRedemptions: sellerRedemptionsApi,
};

export default _firebaseDefault;
