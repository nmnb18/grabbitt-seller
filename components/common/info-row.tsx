/**
 * InfoRow Component
 * Reusable component for displaying label-value pairs
 * Used in profile, settings, and detail screens
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";

interface InfoRowProps {
    label: string;
    value: string | number | React.ReactNode;
    style?: ViewStyle;
    variant?: "default" | "inline";
}

export function InfoRow({
    label,
    value,
    style,
    variant = "default",
}: InfoRowProps) {
    const theme = useTheme();
    const isInline = variant === "inline";

    return (
        <View
            style={[
                styles.infoRow,
                isInline ? styles.inlineRow : styles.stackRow,
                style,
            ]}
        >
            <Text
                variant="labelMedium"
                style={[styles.label, { color: theme.colors.onSurfaceVariant }]}
            >
                {label}
            </Text>
            <View style={styles.valueContainer}>
                {typeof value === "string" || typeof value === "number" ? (
                    <Text
                        variant="bodyMedium"
                        style={[styles.value, { color: theme.colors.onSurface }]}
                    >
                        {value}
                    </Text>
                ) : (
                    value
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    infoRow: {
        marginBottom: 12,
    },
    inlineRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    stackRow: {
        flexDirection: "column",
    },
    label: {
        marginBottom: 4,
        fontWeight: "500",
    },
    valueContainer: {
        flex: 1,
    },
    value: {
        fontWeight: "400",
    },
});
