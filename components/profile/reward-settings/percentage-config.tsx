/**
 * Percentage Configuration Component
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View } from "react-native";
import { Surface, Text, TextInput } from "react-native-paper";

interface PercentageConfigProps {
    percentageValue: string;
    onChangePercentage: (value: string) => void;
}

export const PercentageConfig = React.memo(function PercentageConfig({
    percentageValue,
    onChangePercentage,
}: PercentageConfigProps) {
    const theme = useTheme();

    return (
        <View>
            <Text style={[styles.configLabel, { color: theme.colors.onSurfaceDisabled }]}>
                Percentage of bill as points
            </Text>
            <View style={styles.inputRow}>
                <TextInput
                    value={percentageValue}
                    onChangeText={onChangePercentage}
                    keyboardType="numeric"
                    mode="outlined"
                    style={[styles.configInput, { backgroundColor: theme.colors.surface }]}
                    outlineColor={theme.colors.outline}
                    activeOutlineColor={theme.colors.onSurface}
                    testID="percentage-input"
                />
                <Text style={[styles.inputSuffix, { color: theme.colors.onSurfaceDisabled }]}>%</Text>
            </View>
            <Surface style={[styles.exampleBox, { backgroundColor: theme.colors.surface }]}>
                <Text style={[styles.exampleText, { color: theme.colors.onSurface }]}>
                    Example: ₹500 bill → {Math.floor(500 * (Number(percentageValue) || 0) / 100)} points
                </Text>
            </Surface>
        </View>
    );
});

const styles = StyleSheet.create({
    configLabel: {
        fontSize: 13,
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    configInput: {
        flex: 1,
        maxWidth: 120,
    },
    inputSuffix: {
        fontSize: 14,
    },
    exampleBox: {
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    exampleText: {
        fontSize: 13,
    },
});
