/**
 * ButtonRow Component
 * Reusable button container with consistent spacing
 * Handles single or multiple buttons (horizontal or vertical)
 */

import { AppStyles } from "@/utils/theme";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface ButtonRowProps {
    children: React.ReactNode;
    style?: ViewStyle;
    gap?: number;
    vertical?: boolean;
}

export function ButtonRow({
    children,
    style,
    gap = AppStyles.spacing.md,
    vertical = false,
}: ButtonRowProps) {
    return (
        <View
            style={[
                styles.buttonRow,
                vertical ? styles.vertical : styles.horizontal,
                { gap },
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    buttonRow: {
        marginTop: AppStyles.spacing.lg,
    },
    horizontal: {
        flexDirection: "row",
        gap: AppStyles.spacing.md,
    },
    vertical: {
        flexDirection: "column",
        gap: AppStyles.spacing.md,
    },
});
