/**
 * PlanCard Component
 * Reusable component for displaying subscription/plan options
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Card, Chip, Text } from "react-native-paper";
import { FeatureList } from "./feature-list";

interface PlanCardProps {
    name: string;
    price: string;
    features: string[];
    color?: string;
    isActive?: boolean;
    isCurrent?: boolean;
    isLocked?: boolean;
    expiryDate?: Date | null;
    onBuy?: () => void;
    children?: React.ReactNode; // For custom actions
    style?: ViewStyle;
}

export function PlanCard({
    name,
    price,
    features,
    color,
    isActive = false,
    isCurrent = false,
    isLocked = false,
    expiryDate,
    onBuy,
    children,
    style,
}: PlanCardProps) {
    const theme = useTheme();
    const planColor = color || theme.colors.primary;

    return (
        <Card
            style={[
                styles.card,
                {
                    backgroundColor: theme.colors.surface,
                    borderColor: isCurrent ? planColor : theme.colors.outline,
                    borderWidth: isCurrent ? 2 : 1,
                },
                style,
            ]}
            elevation={isCurrent ? 4 : 1}
        >
            <Card.Content>
                {/* Header */}
                <View style={styles.header}>
                    <Text
                        variant="titleLarge"
                        style={[styles.planName, { color: planColor }]}
                    >
                        {name}
                    </Text>
                    <Text variant="bodyMedium" style={styles.price}>
                        {price}
                    </Text>
                </View>

                {/* Current Badge */}
                {isCurrent && (
                    <View style={styles.badgeContainer}>
                        <Chip
                            mode="flat"
                            style={[styles.badge, { backgroundColor: planColor + "20" }]}
                            textStyle={[styles.badgeText, { color: planColor }]}
                        >
                            Current Active Plan
                        </Chip>
                    </View>
                )}

                {/* Expiry Date */}
                {isCurrent && expiryDate && (
                    <Text style={[styles.expiryText, { color: theme.colors.onSurfaceVariant }]}>
                        Expires on: {expiryDate.toLocaleDateString()}
                    </Text>
                )}

                {/* Features */}
                <FeatureList features={features} iconColor={planColor} />

                {/* Buy Button - Only shown if not current and not locked */}
                {!isCurrent && !isLocked && onBuy && (
                    <View style={styles.actionsContainer}>
                        {children}
                    </View>
                )}

                {/* Locked Message */}
                {isLocked && (
                    <Text style={[styles.lockedText, { color: theme.colors.warning }]}>
                        You can purchase another plan after your current plan expires.
                    </Text>
                )}

                {/* Custom Actions */}
                {children && <View style={styles.actionsContainer}>{children}</View>}
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    planName: {
        flex: 1,
        fontWeight: "600",
    },
    price: {
        fontWeight: "600",
    },
    badgeContainer: {
        marginBottom: 12,
        alignItems: "center",
    },
    badge: {
        alignSelf: "center",
    },
    badgeText: {
        fontWeight: "500",
    },
    expiryText: {
        marginBottom: 12,
        fontSize: 12,
    },
    lockedText: {
        marginTop: 12,
        fontSize: 12,
        textAlign: 'center',
    },
    actionsContainer: {
        marginTop: 16,
        gap: 8,
    },
});
