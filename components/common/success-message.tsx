/**
 * SuccessMessage Component
 * Reusable component for success states with icon
 */

import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";

interface SuccessMessageProps {
    title: string;
    message?: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: ViewStyle;
}

export function SuccessMessage({
    title,
    message,
    icon = "check-circle",
    actionLabel,
    onAction,
    style,
}: SuccessMessageProps) {
    const theme = useTheme();

    return (
        <View style={[styles.container, style]}>
            <MaterialCommunityIcons
                name={icon as any}
                size={80}
                color={theme.colors.success}
                style={styles.icon}
            />

            <Text
                variant="headlineSmall"
                style={[styles.title, { color: theme.colors.onBackground }]}
            >
                {title}
            </Text>

            {message && (
                <Text
                    variant="bodyMedium"
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
        marginBottom: 24,
    },
    title: {
        marginBottom: 12,
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
        width: "100%",
    },
});
