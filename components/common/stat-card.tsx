/**
 * StatCard Component
 * Reusable card for displaying stats and metrics
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Card, Text } from "react-native-paper";

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    onPress,
    style,
}: StatCardProps) {
    const theme = useTheme();

    return (
        <Card
            style={[
                styles.card,
                { backgroundColor: theme.colors.surface },
                onPress && styles.pressable,
                style,
            ]}
            onPress={onPress}
        >
            <Card.Content style={styles.content}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}

                <View style={styles.textContainer}>
                    <Text
                        variant="bodySmall"
                        style={[styles.title, { color: theme.colors.onSurfaceVariant }]}
                    >
                        {title}
                    </Text>
                    <Text
                        variant="headlineSmall"
                        style={[styles.value, { color: theme.colors.onSurface }]}
                    >
                        {value}
                    </Text>
                    {subtitle && (
                        <Text
                            variant="labelSmall"
                            style={[styles.subtitle, { color: theme.colors.outline }]}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 12,
    },
    pressable: {
        elevation: 2,
    },
    content: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    iconContainer: {
        marginTop: 4,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        marginBottom: 4,
    },
    value: {
        marginBottom: 4,
    },
    subtitle: {
        marginTop: 4,
    },
});
