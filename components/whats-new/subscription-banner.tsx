import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

interface SubscriptionBannerProps {
    visible: boolean;
}

export const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ visible }) => {
    const theme = useTheme();
    const router = useRouter();

    if (!visible) return null;

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
                <MaterialCommunityIcons name="crown" size={64} color={theme.colors.warning} />
                <Text style={{ fontSize: 20, fontWeight: "700", color: theme.colors.onSurface }}>
                    Upgrade to Pro or Premium
                </Text>
                <Text style={{ fontSize: 14, textAlign: "center", color: theme.colors.onSurfaceDisabled, paddingHorizontal: 40 }}>
                    Create special offers to attract more customers
                </Text>
                <Button
                    variant="contained"
                    icon="arrow-right"
                    onPress={() => router.push("/(drawer)/subscription")}
                    style={{ marginTop: 20 }}
                >
                    View Plans
                </Button>
            </View>
        </View>
    );
};
