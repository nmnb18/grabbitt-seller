/**
 * REST API Service
 * Production-ready REST endpoints with axios
 * Replaces Firebase callable functions with REST calls
 * Handles authentication via Bearer token (stored in authStore)
 */

import { SimplifiedSeller, StoreDetails } from '@/types/seller';
import { WalletData } from '@/types/wallet';
import { logError } from '@/utils/errorHandler';
import api from './axiosInstance';

/**
 * Error handling wrapper for REST API calls
 */
const handleApiError = (error: any, context: string) => {
    const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        String(error);

    logError(context, error);

    return {
        success: false,
        error: errorMsg,
        code: error?.response?.status || 'UNKNOWN_ERROR',
    };
};

// =====================================
// User APIs
// =====================================
export const userApi = {
    /**
     * Login user
     * POST /api/auth/login
     */
    loginUser: async (payload: { email: string; password: string; role?: string }) => {
        try {
            const response = await api.post('/api/auth/login', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'loginUser');
        }
    },

    /**
     * Register user
     * POST /api/auth/register
     */
    registerUser: async (payload: Record<string, any>) => {
        try {
            const response = await api.post('/api/auth/register', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'registerUser');
        }
    },

    /**
     * Forgot password
     * POST /api/auth/forgot-password
     */
    forgotPassword: async (email: string) => {
        try {
            const response = await api.post('/api/auth/forgot-password', { email });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'forgotPassword');
        }
    },

    /**
     * Reset password
     * POST /api/auth/reset-password
     */
    resetPassword: async (oobCode: string, newPassword: string) => {
        try {
            const response = await api.post('/api/auth/reset-password', {
                oob_code: oobCode,
                new_password: newPassword,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'resetPassword');
        }
    },

    /**
     * Get user details by UID
     * GET /api/users/:uid
     */
    getDetails: async (uid: string) => {
        try {
            const response = await api.get(`/api/users/${uid}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getDetails');
        }
    },

    /**
     * Logout
     * POST /api/auth/logout
     */
    logout: async (uid: string) => {
        try {
            const response = await api.post('/api/auth/logout', { uid });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'logout');
        }
    },

    /**
     * Update user profile section
     * PATCH /api/users/profile/:section
     */
    updateProfile: async (section: string, data: Record<string, unknown>) => {
        try {
            const response = await api.patch(`/api/users/profile/${section}`, data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updateProfile');
        }
    },

    /**
     * Register seller (creates backend seller profile)
     * POST /api/sellers/register
     */
    registerSeller: async (payload: Record<string, any>) => {
        try {
            const response = await api.post('/api/sellers/register', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'registerSeller');
        }
    },

    /**
     * Delete user account
     * DELETE /api/users/account
     */
    deleteAccount: async () => {
        try {
            const response = await api.delete('/api/users/account');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'deleteAccount');
        }
    },

    /**
     * Delete seller account
     * DELETE /api/sellers/:sellerId
     */
    deleteSellerAccount: async (sellerId?: string) => {
        try {
            const url = sellerId ? `/api/sellers/${sellerId}` : '/api/sellers/account';
            const response = await api.delete(url);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'deleteSellerAccount');
        }
    },

    /**
     * Change password
     * POST /api/auth/change-password
     */
    changePassword: async (currentPassword: string, newPassword: string) => {
        try {
            const response = await api.post('/api/auth/change-password', {
                current_password: currentPassword,
                new_password: newPassword,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'changePassword');
        }
    },

    /**
     * Refresh token
     * POST /api/auth/refresh
     */
    refreshToken: async (refreshToken: string) => {
        try {
            const response = await api.post('/api/auth/refresh', { refresh_token: refreshToken });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'refreshToken');
        }
    },
};

// =====================================
// Seller/Store APIs
// =====================================
export const storeApi = {
    /**
     * Get nearby sellers
     * GET /api/sellers/nearby
     */
    getNearbySellers: async (
        lat?: number,
        lng?: number
    ): Promise<{ success: boolean; sellers: SimplifiedSeller[]; error?: string }> => {
        try {
            const params: Record<string, any> = {};
            if (lat !== undefined && lng !== undefined) {
                params.lat = lat;
                params.lng = lng;
            }
            const response = await api.get('/api/sellers/nearby', { params });
            return response.data;
        } catch (error) {
            logError('getNearbySellers', error);
            throw handleApiError(error, 'getNearbySellers');
        }
    },

    /**
     * Get store details by ID
     * GET /api/sellers/:sellerId
     */
    getStoreDetails: async (
        sellerId: string
    ): Promise<{ success: boolean; user: { seller_profile: StoreDetails } }> => {
        try {
            const response = await api.get(`/api/sellers/${sellerId}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getStoreDetails');
        }
    },

    /**
     * Get balance by seller
     * GET /api/sellers/:sellerId/balance
     */
    getBalanceBySeller: async (sellerId: string) => {
        try {
            const response = await api.get(`/api/sellers/${sellerId}/balance`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getBalanceBySeller');
        }
    },
};

// =====================================
// Wallet APIs
// =====================================
export const walletApi = {
    /**
     * Get wallet data
     * GET /api/wallet
     */
    getWallet: async (): Promise<{ success: boolean; data: WalletData }> => {
        try {
            const response = await api.get('/api/wallet');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getWallet');
        }
    },

    /**
     * Get transaction history
     * GET /api/wallet/transactions
     */
    getTransactions: async (limit = 50) => {
        try {
            const response = await api.get('/api/wallet/transactions', {
                params: { limit },
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getTransactions');
        }
    },
};

// =====================================
// Redemption APIs
// =====================================
export const redemptionApi = {
    /**
     * Get redemption history
     * GET /api/redemptions/history
     */
    getHistory: async () => {
        try {
            const response = await api.get('/api/redemptions/history');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getHistory');
        }
    },

    /**
     * Create redemption request
     * POST /api/redemptions
     */
    createRedemption: async (data: {
        seller_id: string;
        offer_id: string;
        points: number;
    }) => {
        try {
            const response = await api.post('/api/redemptions', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'createRedemption');
        }
    },

    /**
     * Get redemption QR code
     * GET /api/redemptions/:redemptionId/qr
     */
    getRedemptionQR: async (redemptionId: string) => {
        try {
            const response = await api.get(`/api/redemptions/${redemptionId}/qr`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getRedemptionQR');
        }
    },
};

// =====================================
// Perks APIs
// =====================================
export const perksApi = {
    /**
     * Claim a perk
     * POST /api/perks/claim
     */
    claimPerk: async (sellerId: string) => {
        try {
            const response = await api.post('/api/perks/claim', { seller_id: sellerId });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'claimPerk');
        }
    },

    /**
     * Get today's perk for a store
     * GET /api/sellers/:sellerId/perk
     */
    getTodayPerk: async (sellerId: string) => {
        try {
            const response = await api.get(`/api/sellers/${sellerId}/perk`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getTodayPerk');
        }
    },
};

// =====================================
// Notification APIs
// =====================================
export const notificationApi = {
    /**
     * Register push token
     * POST /api/notifications/register
     */
    registerToken: async (payload: Record<string, any>) => {
        try {
            const response = await api.post('/api/notifications/register', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'registerToken');
        }
    },

    /**
     * Unregister push token
     * POST /api/notifications/unregister
     */
    unregisterPushToken: async (payload: { push_token: string }) => {
        try {
            const response = await api.post('/api/notifications/unregister', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'unregisterPushToken');
        }
    },

    /**
     * Get unread notification count
     * GET /api/notifications/unread-count
     */
    getUnreadCount: async () => {
        try {
            const response = await api.get('/api/notifications/unread-count');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getUnreadCount');
        }
    },

    /**
     * Get notifications list
     * GET /api/notifications
     */
    getNotifications: async () => {
        try {
            const response = await api.get('/api/notifications');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getNotifications');
        }
    },

    /**
     * Mark notifications read
     * PATCH /api/notifications/mark-read
     */
    markNotificationsRead: async (ids: string[]) => {
        try {
            const response = await api.patch('/api/notifications/mark-read', {
                notification_ids: ids,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'markNotificationsRead');
        }
    },
};

// =====================================
// QR Code APIs
// =====================================
export const qrCodeApi = {
    /**
     * Scan user QR (award points)
     * POST /api/qr/scan-user
     */
    scanUserQRCode: async (payload: { user_id: string; amount?: number }) => {
        try {
            const response = await api.post('/api/qr/scan-user', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'scanUserQRCode');
        }
    },
};

// =====================================
// Payment APIs
// =====================================
export const paymentApi = {
    /**
     * Create order
     * POST /api/payments/orders
     */
    createOrder: async (data: Record<string, unknown>) => {
        try {
            const response = await api.post('/api/payments/orders', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'createOrder');
        }
    },

    /**
     * Verify payment
     * POST /api/payments/verify
     */
    verifyPayment: async (data: Record<string, unknown>) => {
        try {
            const response = await api.post('/api/payments/verify', data);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'verifyPayment');
        }
    },

    /**
     * Apply coupon
     * POST /api/coupons/apply
     */
    applyCoupon: async (couponCode: string | Record<string, any>) => {
        try {
            const payload = typeof couponCode === 'string'
                ? { coupon_code: couponCode }
                : couponCode;
            const response = await api.post('/api/coupons/apply', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'applyCoupon');
        }
    },

    /**
     * Verify IAP purchase (Apple)
     * POST /api/payments/verify-iap
     */
    verifyIAPPurchase: async (payload: Record<string, any>) => {
        try {
            const response = await api.post('/api/payments/verify-iap', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'verifyIAPPurchase');
        }
    },
};

// =====================================
// Offers APIs (whats-new)
// =====================================
export const offersApi = {
    /**
     * Get seller offers
     * GET /api/sellers/offers
     */
    getSellerOffers: async (date?: string) => {
        try {
            const params: Record<string, any> = {};
            if (date) params.date = date;
            const response = await api.get('/api/sellers/offers', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSellerOffers');
        }
    },

    /**
     * Get seller redeemed perks
     * GET /api/sellers/redeemed-perks
     */
    getSellerRedeemedPerks: async () => {
        try {
            const response = await api.get('/api/sellers/redeemed-perks');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSellerRedeemedPerks');
        }
    },

    /**
     * Delete seller offer
     * DELETE /api/sellers/offers/:date
     */
    deleteSellerOffer: async (date: string) => {
        try {
            const response = await api.delete(`/api/sellers/offers/${date}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'deleteSellerOffer');
        }
    },

    /**
     * Save seller offer
     * POST /api/sellers/offers
     */
    saveSellerOffer: async (payload: Record<string, any>) => {
        try {
            const response = await api.post('/api/sellers/offers', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'saveSellerOffer');
        }
    },

    /**
     * Verify redeem code
     * POST /api/offers/verify-code
     */
    verifyRedeemCode: async (code: string) => {
        try {
            const response = await api.post('/api/offers/verify-code', { code });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'verifyRedeemCode');
        }
    },
};

// =====================================
// Analytics APIs
// =====================================
export const analyticsApi = {
    /**
     * Get seller stats
     * GET /api/analytics/stats
     */
    sellerStats: async () => {
        try {
            const response = await api.get('/sellerStats');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'sellerStats');
        }
    },

    /**
     * Get seller advanced analytics
     * GET /api/analytics/advanced
     */
    sellerAdvancedAnalytics: async () => {
        try {
            const response = await api.get('/sellerAdvancedAnalytics');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'sellerAdvancedAnalytics');
        }
    },
};

// =====================================
// Media APIs
// =====================================
export const mediaApi = {
    /**
     * Update seller media
     * PATCH /api/sellers/media
     */
    updateSellerMedia: async (payload: Record<string, any>) => {
        try {
            const response = await api.patch('/api/sellers/media', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updateSellerMedia');
        }
    },
};

// =====================================
// Subscription APIs
// =====================================
export const subscriptionApi = {
    /**
     * Get subscription history
     * GET /api/subscriptions/history
     */
    getSubscriptionHistory: async (sellerId?: string) => {
        try {
            const params: Record<string, any> = {};
            if (sellerId) params.seller_id = sellerId;
            const response = await api.get('/api/subscriptions/history', { params });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSubscriptionHistory');
        }
    },
};

// =====================================
// Seller Redemptions / Process
// =====================================
export const sellerRedemptionsApi = {
    /**
     * Get seller redemptions
     * GET /api/sellers/redemptions
     */
    getSellerRedemptions: async () => {
        try {
            const response = await api.get('/api/sellers/redemptions');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSellerRedemptions');
        }
    },

    /**
     * Process redemption
     * POST /api/sellers/redemptions/process
     */
    processRedemption: async (payload: Record<string, any>) => {
        try {
            const response = await api.post('/api/sellers/redemptions/process', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'processRedemption');
        }
    },
};

// =====================================
// Default Export
// =====================================
export default {
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
