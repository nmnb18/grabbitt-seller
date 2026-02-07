/**
 * EmptyState Component
 * Reusable component for empty states with icon, message, and action
 */

import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";

interface EmptyStateProps {
    icon?: string;
    title: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export function EmptyState({
    icon = "inbox-multiple-outline",
    title,
    message,
    actionLabel,
    onAction,
    style,
}: EmptyStateProps) {
    const theme = useTheme();

    return (
        <View style={[styles.container, style]}>
            <MaterialCommunityIcons
                name={icon as any}
                size={64}
                color={theme.colors.outline}
                style={styles.icon}
            />

            <Text
                variant="titleMedium"
                style={[styles.title, { color: theme.colors.onSurface }]}
            >
                {title}
            </Text>

            {message && (
                <Text
                    variant="bodySmall"
                    style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
                >
                    {message}
                </Text>
            )}

            {actionLabel && onAction && (
                <Button
                    variant="contained"
                    onPress={onAction}
                    style={styles.button}
                >
                    {actionLabel}
                </Button>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    icon: {
        marginBottom: 16,
        opacity: 0.5,
    },
    title: {
        marginBottom: 8,
        textAlign: "center",
        fontWeight: "600",
    },
    message: {
        marginBottom: 24,
        textAlign: "center",
        lineHeight: 20,
    },
    button: {
        marginTop: 16,
    },
});
