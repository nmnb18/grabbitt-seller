/**
 * REST API Service
 * Production-ready REST endpoints with axios
 * Replaces Firebase callable functions with REST calls
 * Handles authentication via Bearer token (stored in authStore)
 */

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
    loginSeller: async (payload: { email: string; password: string; role?: string }) => {
        try {
            const response = await api.post('/loginSeller', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'loginUser');
        }
    },

    /**
     * Forgot password
     * POST /api/auth/forgot-password
     */
    requestPasswordReset: async (email: string) => {
        try {
            const response = await api.post('/requestPasswordReset', { email });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'requestPasswordReset');
        }
    },

    /**
     * Reset password
     * POST /api/auth/reset-password
     */
    confirmPasswordReset: async (oobCode: string, newPassword: string) => {
        try {
            const response = await api.post('/confirmPasswordReset', {
                oob_code: oobCode,
                new_password: newPassword,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'confirmPasswordReset');
        }
    },

    /**
     * Get user details by UID
     * GET /api/users/:uid
     */
    getDetails: async (uid: string) => {
        try {
            const response = await api.get(`/getSellerDetails?uid=${uid}`);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSellerDetails');
        }
    },

    /**
     * Logout
     * POST /api/auth/logout
     */
    logout: async (uid: string) => {
        try {
            const response = await api.post('/logout', { uid });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'logout');
        }
    },

    /**
     * Update user profile section
     * PATCH /api/users/profile/:section
     */
    updateSellerProfile: async (section: string, data: Record<string, unknown>) => {
        try {
            const response = await api.patch(`/updateSellerProfile`, { section, data });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'updateSellerProfile');
        }
    },

    /**
     * Register seller (creates backend seller profile)
     * POST /api/sellers/register
     */
    registerSeller: async (payload: Record<string, any>) => {
        try {
            const response = await api.post('/registerSeller', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'registerSeller');
        }
    },

    /**
     * Delete user account
     * DELETE /api/users/account
     */
    deleteSellerAccount: async () => {
        try {
            const response = await api.delete('/deleteSellerAccount');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'deleteAccount');
        }
    },

    /**
     * Change password
     * POST /api/auth/change-password
     */
    changePassword: async (newPassword: string) => {
        try {
            const response = await api.post('/changePassword', {
                newPassword: newPassword,
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'changePassword');
        }
    },

    /**
     * Change password
     * POST /api/auth/change-password
     */
    reauthenticate: async (currentPassword: string) => {
        try {
            const response = await api.post('/reauthenticate', {
                currentPassword: currentPassword
            });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'reauthenticate');
        }
    },

    /**
     * Refresh token
     * POST /api/auth/refresh
     */
    refreshToken: async (refreshToken: string) => {
        try {
            const response = await api.post('/refreshToken', { refreshToken: refreshToken });
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'refreshToken');
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
            const response = await api.post('/registerPushToken', payload);
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'registerPushToken');
        }
    },

    /**
     * Unregister push token
     * POST /api/notifications/unregister
     */
    unregisterPushToken: async (payload: { push_token: string }) => {
        try {
            const response = await api.post('/unregisterPushToken', payload);
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
            const response = await api.get('/unreadCount');
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
            const response = await api.get('/getNotifications');
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
            const response = await api.patch('/markNotificationsRead', {
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
            const response = await api.post('/scanUserQRCode', payload);
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
            const response = await api.post('/createOrder', data);
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
            const response = await api.post('/verifyPayment', data);
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
            const response = await api.post('/applyCoupon', payload);
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
            const response = await api.post('/verifyIAPPurchase', payload);
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
            const response = await api.get('/getSellerOffers', { params });
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
            const response = await api.get('/getSellerRedeemedPerks');
            return response.data;
        } catch (error) {
            throw handleApiError(error, 'getSellerRedeemedPerks');
        }
    },

    /**
     * Delete seller offer
     * DELETE /api/sellers/offers/:date
     */

    deleteSellerOffer: async (date?: string) => {
        try {
            const params: Record<string, any> = {};
            if (date) params.date = date;
            const response = await api.delete('/deleteSellerOffer', { params });
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
            const response = await api.post('/saveSellerOffer', payload);
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
            const response = await api.post('/verifyRedeemCode', { code });
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
            const response = await api.post('/updateSellerMedia', payload);
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
            if (sellerId) params.sellerId = sellerId;
            const response = await api.get('/getSubscriptionHistory', { params });
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
            const response = await api.get('/getSellerRedemptions');
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
            const response = await api.post('/processRedemption', payload);
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
    notification: notificationApi,
    qrCode: qrCodeApi,
    payment: paymentApi,
    offers: offersApi,
    analytics: analyticsApi,
    media: mediaApi,
    subscription: subscriptionApi,
    sellerRedemptions: sellerRedemptionsApi,
};
