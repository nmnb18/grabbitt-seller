/**
 * CardSection Component
 * Reusable section for profile/detail screens
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Card, Divider } from "react-native-paper";
import { SectionHeader } from "./section-header";

interface CardSectionProps {
    title: string;
    headerAction?: React.ReactNode;
    children: React.ReactNode;
    style?: ViewStyle;
    showDivider?: boolean;
}

export function CardSection({
    title,
    headerAction,
    children,
    style,
    showDivider = true,
}: CardSectionProps) {
    const theme = useTheme();

    return (
        <Card
            style={[
                styles.card,
                { backgroundColor: theme.colors.surface },
                style,
            ]}
        >
            <Card.Content>
                <SectionHeader
                    title={title}
                    actions={headerAction}
                    style={styles.header}
                />

                {showDivider && (
                    <Divider
                        style={[
                            styles.divider,
                            { backgroundColor: theme.colors.outline },
                        ]}
                    />
                )}

                <View style={styles.content}>{children}</View>
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
        marginBottom: 12,
    },
    divider: {
        marginBottom: 16,
    },
    content: {
        gap: 12,
    },
});
