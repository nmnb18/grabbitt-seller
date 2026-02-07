/**
 * FormCard Component
 * Reusable form card with consistent styling and theme
 * Used for login, registration, and other form screens
 */

import { useTheme, useThemeColor } from "@/hooks/use-theme-color";
import { AppStyles } from "@/utils/theme";
import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { Surface } from "react-native-paper";

interface FormCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    elevation?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function FormCard({
    children,
    style,
    elevation = 2,
}: FormCardProps) {
    const theme = useTheme();
    const outlineColor = useThemeColor({}, 'outline');

    return (
        <Surface
            style={[
                styles.formCard,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: outlineColor,
                },
                style,
            ]}
            elevation={elevation}
        >
            {children}
        </Surface>
    );
}

const styles = StyleSheet.create({
    formCard: {
        borderRadius: 12,
        padding: AppStyles.spacing.lg,
        borderWidth: 1,
    },
});
