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
  Transaction,
  WalletStats,
  WalletData,
  Redemption as WalletRedemption 
} from "./wallet";

// Seller types - only export unique types
export type { 
  BusinessType,
  SubscriptionTier,
  QRCodeType,
  RewardType,
  SubscriptionInfo,
  UPIInfo,
  SimplifiedSeller,
  SellersResponse,
  SellerQr,
  StoreDetails,
  ApiResponse,
  Seller
} from "./seller";

// Perks types
export * from "./perks";

// Redemptions types - rename Redemption to avoid conflict
export type {
  Redemption as RedemptionRecord,
  RedemptionRequest,
  RedemptionResponse,
  UserRedemptionsResponse,
  RedemptionHistoryItem,
  RedemptionHistoryResponse
} from "./redemptions";

// Scan QR types
export * from "./scan-qr";
