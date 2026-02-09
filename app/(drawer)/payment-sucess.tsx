import { SuccessMessage } from "@/components/common";
import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function PaymentSuccess() {
    const router = useRouter();
    const theme = useTheme();
    const { orderId, plan, expiresAt } = useLocalSearchParams();

    const expiresAtValue = Array.isArray(expiresAt) ? expiresAt[0] : expiresAt;

    const formattedDate = new Date(expiresAtValue).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const message = `Order ID: ${orderId}\nExpires: ${formattedDate}\n\nYour ${String(plan).toUpperCase()} plan is now active!\nEnjoy advanced analytics, unlimited QR codes and more 🚀`;

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <AppHeader />
            <SuccessMessage
                title="🎉 Hurray! Payment Successful"
                message={message}
                onAction={() => router.replace("/(drawer)")}
                actionLabel="Go to Dashboard"
            />
        </View>
    );
}
