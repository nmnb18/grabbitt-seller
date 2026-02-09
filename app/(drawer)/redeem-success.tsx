import { SuccessMessage } from "@/components/common";
import { AppHeader } from "@/components/shared/app-header";
import { useTheme } from "@/hooks/use-theme-color";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function RedeemSuccess() {
  const router = useRouter();
  const theme = useTheme();
  const { redemption_id, points, user_name } = useLocalSearchParams();

  const message = `Redemption ID: ${redemption_id}\n\n${points} points redeemed for ${user_name}`;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <AppHeader />
      <SuccessMessage
        title="🎉 Redemption Successful!!!"
        message={message}
        onAction={() => router.replace("/(drawer)")}
        actionLabel="Go to Dashboard"
      />
    </View>
  );
}
