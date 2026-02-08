/**
 * API Service - REST API Layer
 * Centralized API calls with proper error handling and authentication
 * Uses axios for all REST calls with Bearer token authentication
 */

export {
  analyticsApi,
  default,
  mediaApi,
  notificationApi,
  offersApi,
  paymentApi,
  perksApi,
  qrCodeApi,
  redemptionApi,
  sellerRedemptionsApi,
  storeApi,
  subscriptionApi,
  userApi,
  walletApi
} from './restApi';

