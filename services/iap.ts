// services/iap.ts
import api from "@/services/axiosInstance";
import { Platform } from "react-native";
import * as RNIap from "react-native-iap";
import { notifyIAPError, notifyIAPSuccess, notifyIAPVerifying } from "./iapState";

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
    if (Platform.OS !== "ios") return;

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
                    const res = await api.post("/verifyIAPPurchase", {
                        purchaseToken,
                        productId,
                        transactionId,
                    });

                    // MUST finish transaction after backend success
                    await RNIap.finishTransaction({
                        purchase,
                        isConsumable: false,
                    });

                    notifyIAPSuccess(res.data);
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
    if (Platform.OS !== "ios") return;

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
    if (Platform.OS !== "ios") return;

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
    if (Platform.OS !== "ios") return;

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

