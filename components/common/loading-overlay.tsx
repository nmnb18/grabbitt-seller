/**
 * LoadingOverlay Component
 * Reusable overlay for loading states
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
    const theme = useTheme();

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.container}>
                <View

                >
                    <ActivityIndicator
                        size="large"
                        color={theme.colors.primary}
                        style={styles.spinner}
                    />
                    {message && (
                        <Text
                            variant="bodyMedium"
                            style={[styles.message, { color: theme.colors.onBackground }]}
                        >
                            {message}
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        borderRadius: 12,
        padding: 32,
        alignItems: "center",
        gap: 16,
    },
    spinner: {
        marginBottom: 8,
    },
    message: {
        textAlign: "center",
    },
});
