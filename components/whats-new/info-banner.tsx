import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Surface, Text } from "react-native-paper";

interface InfoBannerProps {
    message: string;
}

export function InfoBanner({ message }: InfoBannerProps) {
    const theme = useTheme();

    return (
        <Surface
            style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                padding: 12,
                borderRadius: 10,
                marginBottom: 14,
                backgroundColor: theme.colors.surfaceVariant,
            }}
            elevation={0}
        >
            <MaterialCommunityIcons
                name="information-outline"
                size={18}
                color={theme.colors.onSurfaceDisabled}
            />
            <Text
                style={{
                    fontSize: 13,
                    flex: 1,
                    color: theme.colors.onSurfaceDisabled,
                }}
            >
                {message}
            </Text>
        </Surface>
    );
}
