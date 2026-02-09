/**
 * FeatureList Component
 * Reusable component for displaying feature lists (like in subscription/plan cards)
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "react-native-paper";

interface FeatureListProps {
    features: string[];
    style?: ViewStyle;
    iconColor?: string;
}

export function FeatureList({
    features,
    style,
    iconColor,
}: FeatureListProps) {
    const theme = useTheme();
    const color = iconColor || theme.colors.primary;

    return (
        <View style={[styles.container, style]}>
            {features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                    <Text
                        style={[styles.bullet, { color }]}
                    >
                        •
                    </Text>
                    <Text
                        variant="bodySmall"
                        style={[styles.featureText, { color: theme.colors.onSurface }]}
                    >
                        {feature}
                    </Text>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 8,
        marginVertical: 12,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
    },
    bullet: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: -2,
    },
    featureText: {
        flex: 1,
        lineHeight: 20,
    },
});
