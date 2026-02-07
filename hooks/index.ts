/**
 * Custom Hooks Barrel Export
 */

export { useColorScheme } from "./use-color-scheme";
export { useSellerQR } from "./use-qr";
export { useTheme, useThemeColor } from "./use-theme-color";
export { useAnalytics } from "./useAnalytics";
export type { LastScan, SellerStats, TodayStats } from "./useAnalytics";
export { useCopyOfferModal } from "./useCopyOfferModal";
export { useCustomerScan } from "./useCustomerScan";
export type { AwardResult, RewardType, ScanResult, SlabRule } from "./useCustomerScan";
export { useFetchData } from "./useFetchData";
export { useForm } from "./useForm";
export { useMultiStepForm } from "./useMultiStepForm";
export { useOffers } from "./useOffers";
export type { Offer, OfferDoc } from "./useOffers";
export { useOfferState } from "./useOfferState";
export { useOfferValidation } from "./useOfferValidation";
export { useProAnalytics } from "./useProAnalytics";
export type {
    AdvancedAnalytics,
    DayBucket,
    PeakDay,
    PeakHour,
    RewardFunnel,
    Segments,
    TopCustomer
} from "./useProAnalytics";
export { usePushNotifications } from "./usePushNotifications";
export { useRedemptions, useSellerRedemptions } from "./useRedemptions";
export type { PerkItem, Redemption } from "./useRedemptions";
export { useRefresh } from "./useRefresh";
export { useSaveOffer } from "./useSaveOffer";
export { useSubscriptionHistory } from "./useSubscriptionHistory";
export type { SubscriptionHistory } from "./useSubscriptionHistory";

