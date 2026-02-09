import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";

type TabType = "active" | "upcoming" | "expired";

interface OfferEmptyStateProps {
    state: TabType;
    onCreateOffer?: () => void;
}

export function OfferEmptyState({
    state,
    onCreateOffer,
}: OfferEmptyStateProps) {
    const theme = useTheme();

    const messages = {
        active: "No active offers today",
        upcoming: "No upcoming offers scheduled",
        expired: "No expired offers yet",
    };

    const icons = {
        active: "calendar-today",
        upcoming: "calendar-plus",
        expired: "calendar-remove",
    };

    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 80,
            }}
        >
            <MaterialCommunityIcons
                name={icons[state] as any}
                size={64}
                color={theme.colors.onSurfaceDisabled}
            />
            <Text
                style={{
                    fontSize: 16,
                    marginTop: 12,
                    color: theme.colors.onSurfaceDisabled,
                }}
            >
                {messages[state]}
            </Text>
            {state === "upcoming" && onCreateOffer && (
                <Button
                    variant="outlined"
                    icon="plus"
                    onPress={onCreateOffer}
                    style={{ marginTop: 16 }}
                >
                    Create Offer
                </Button>
            )}
        </View>
    );
}
