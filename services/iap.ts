// src/services/iap.ts
import api from "@/services/axiosInstance";
import { useAuthStore } from "@/store/authStore";
import * as InAppPurchases from "expo-in-app-purchases";
import { Platform } from "react-native";

export const IOS_PRODUCT_IDS = [
    "seller_pro_30d",
    "seller_premium_1yr",
];

// Init connection & prefetch products
export async function initIAP() {
    if (Platform.OS !== "ios") return;

    try {
        await InAppPurchases.connectAsync();
        await InAppPurchases.getProductsAsync(IOS_PRODUCT_IDS);

    } catch (e) {
        console.log("IAP init error:", e);
    }
}

export async function endIAP() {
    if (Platform.OS !== "ios") return;
    try {
        await InAppPurchases.disconnectAsync();
    } catch (e) {
        console.log("IAP disconnect error", e);
    }
}

// Called from purchase listener when a purchase completes
export async function handleIOSPurchase(
    purchase: InAppPurchases.InAppPurchase
) {
    try {
        if (!purchase.transactionReceipt) {
            throw new Error("Missing transaction receipt");
        }

        // Backend will use Firebase auth token from axiosInstance automatically
        const res = await api.post("/verifyIAPPurchase", {
            platform: "ios",
            productId: purchase.productId,
            receipt: purchase.transactionReceipt, // base64
        });

        if (!res.data.success) {
            throw new Error(res.data.error || "IAP verification failed");
        }

        // Refresh seller details so subscription is up to date in app
        const { user, fetchUserDetails } = useAuthStore.getState();
        if (user?.user?.uid) {
            await fetchUserDetails(user.user.uid, "seller");
        }

        return res.data.subscription;
    } catch (err) {
        console.error("handleIOSPurchase error:", err);
        throw err;
    }
}
