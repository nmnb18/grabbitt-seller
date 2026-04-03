// services/iap.ts
import { Platform } from "react-native";
import { paymentApi } from './api';
import { notifyIAPError, notifyIAPSuccess, notifyIAPVerifying } from "./iapState";

// react-native-iap requires TurboModules (native build) — not available in Expo Go.
// Lazy-require with fallback so the app doesn't crash in dev/Expo Go.
let RNIap: typeof import("react-native-iap") | null = null;
try {
    RNIap = require("react-native-iap");
} catch {
    console.warn("[IAP] react-native-iap unavailable (Expo Go / non-native build) — IAP disabled");
}

/**
 * iOS subscription product IDs
 * Must match App Store Connect exactly
 */
export const IOS_PRODUCTS = [
    "seller_pro_30d",
    "seller_premium_1yr",
];

// Listener unsubscribe functions (no typing — v14 does not export them)
let purchaseUpdateSub: any = null;
let purchaseErrorSub: any = null;

/**
 * Initialize IAP (call once, e.g. in RootLayout)
 */
export async function initIAP() {
    if (Platform.OS !== "ios" || !RNIap) return;

    try {
        await RNIap.initConnection();

        // Helps avoid stuck sandbox transactions
        await RNIap.clearTransactionIOS();

        /**
         * Purchase success listener
         */
        purchaseUpdateSub = RNIap.purchaseUpdatedListener(
            async (purchase) => {
                try {
                    // RN-IAP v14: receipt exists at runtime but is not typed
                    const purchaseToken = purchase.purchaseToken;
                    const productId = purchase.productId;
                    const transactionId = purchase.transactionId;

                    if (!purchaseToken || !productId || !transactionId) {
                        console.warn("IAP missing receipt fields", purchase);
                        return;
                    }

                    notifyIAPVerifying();

                    // Send to backend for Apple verification
                    const res = await paymentApi.verifyIAPPurchase({
                        purchaseToken,
                        productId,
                        transactionId,
                    });

                    // MUST finish transaction after backend success
                    await RNIap.finishTransaction({
                        purchase,
                        isConsumable: false,
                    });

                    notifyIAPSuccess((res as any)?.data ?? res);
                } catch (err) {
                    console.error("IAP purchase handling failed:", err);
                    notifyIAPError(err);
                    // Do NOT finish transaction if backend verification fails
                }
            }
        );

        /**
         * Purchase error listener
         */
        purchaseErrorSub = RNIap.purchaseErrorListener((error) => {
            console.error("IAP purchase error:", error);
            notifyIAPError(error);
        });
    } catch (err) {
        console.error("IAP init failed:", err);
    }
}

/**
 * Cleanup (call on unmount / logout)
 */
export async function endIAP() {
    if (Platform.OS !== "ios" || !RNIap) return;

    try {
        purchaseUpdateSub?.remove();
        purchaseUpdateSub = null;

        purchaseErrorSub?.remove();
        purchaseErrorSub = null;

        await RNIap.endConnection();
    } catch (err) {
        console.warn("IAP cleanup error:", err);
    }
}


/**
 * Start Apple subscription purchase
 */
export async function requestIOSPurchase(productId: string) {
    if (Platform.OS !== "ios" || !RNIap) return;

    try {
        await RNIap.requestPurchase({
            request: {
                ios: {
                    sku: productId
                }
            },
            type: "subs"
        });
    } catch (err) {
        console.error("Failed to start iOS purchase:", err);
        throw err;
    }
}


/**
 * REQUIRED by Apple — Restore purchases
 */
export async function restoreIOSPurchases() {
    if (Platform.OS !== "ios" || !RNIap) return;

    try {
        /**
         * This triggers Apple restore flow.
         * Restored purchases will come through
         * purchaseUpdatedListener automatically.
         */
        await RNIap.restorePurchases();
    } catch (err) {
        console.error("Restore purchases failed:", err);
        throw err;
    }
}

