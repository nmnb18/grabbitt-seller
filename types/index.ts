/**
 * Types Barrel Export
 * Import all types from this single file
 */

// Auth types (base types)
export * from "./auth";

// Wallet types - rename Redemption to avoid conflict
export type {
  Offer,
  StoreBalance,
  Transaction, WalletData,
  Redemption as WalletRedemption, WalletStats
} from "./wallet";

// Seller types - only export unique types
export type {
  ApiResponse, BusinessType, QRCodeType,
  RewardType, SellerQr, SellersResponse, SimplifiedSeller, StoreDetails, SubscriptionInfo, SubscriptionTier, UPIInfo
} from "./seller";


// Redemptions types - rename Redemption to avoid conflict
export type {
  RedemptionHistoryItem,
  RedemptionHistoryResponse, Redemption as RedemptionRecord,
  RedemptionRequest,
  RedemptionResponse,
  UserRedemptionsResponse
} from "./redemptions";

// Scan QR types
export * from "./scan-qr";
