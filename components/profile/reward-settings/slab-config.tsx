/**
 * Slab/Tiered Configuration Component
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text, TextInput } from "react-native-paper";
import { SlabRuleUI } from "./types";

interface SlabConfigProps {
    slabRules: SlabRuleUI[];
    onUpdateSlab: (index: number, field: "max" | "points", value: string) => void;
    onAddSlab: () => void;
    onRemoveSlab: (index: number) => void;
}

export const SlabConfig = React.memo(function SlabConfig({
    slabRules,
    onUpdateSlab,
    onAddSlab,
    onRemoveSlab,
}: SlabConfigProps) {
    const theme = useTheme();

    const renderSlabRow = useCallback((rule: SlabRuleUI, index: number) => {
        const prevMax = Number(slabRules[index - 1]?.max || -1);
        const min = index === 0 ? 0 : prevMax + 1;

        return (
            <View key={`slab-${min}-${rule.max}`} style={styles.slabRow}>
                <View style={styles.slabRangeCol}>
                    <Text style={[styles.slabFieldLabel, { color: theme.colors.onSurfaceDisabled }]}>
                        ₹{min} to
                    </Text>
                    <TextInput
                        value={rule.max}
                        onChangeText={(value) => onUpdateSlab(index, "max", value)}
                        keyboardType="numeric"
                        mode="outlined"
                        dense
                        placeholder="Max"
                        style={[styles.slabInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                    />
                </View>
                <View style={styles.slabPointsCol}>
                    <Text style={[styles.slabFieldLabel, { color: theme.colors.onSurfaceDisabled }]}>
                        Points
                    </Text>
                    <TextInput
                        value={rule.points}
                        onChangeText={(value) => onUpdateSlab(index, "points", value)}
                        keyboardType="numeric"
                        mode="outlined"
                        dense
                        placeholder="Pts"
                        style={[styles.slabInput, { backgroundColor: theme.colors.surface }]}
                        outlineColor={theme.colors.outline}
                    />
                </View>
                {slabRules.length > 1 && (
                    <TouchableOpacity onPress={() => onRemoveSlab(index)} style={styles.removeBtn}>
                        <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.error} />
                    </TouchableOpacity>
                )}
            </View>
        );
    }, [slabRules, onUpdateSlab, onRemoveSlab, theme]);

    return (
        <View>
            <Text style={[styles.configLabel, { color: theme.colors.onSurfaceDisabled }]}>
                Set spending tiers
            </Text>
            {slabRules.length === 0 && (
                <Text style={[styles.sectionHint, { color: theme.colors.onSurfaceDisabled }]}>
                    No tiers added yet. Add your first spending tier.
                </Text>
            )}
            {slabRules.map((rule, index) => renderSlabRow(rule, index))}

            <TouchableOpacity
                onPress={onAddSlab}
                style={[styles.addTierBtn, { borderColor: theme.colors.primary }]}
            >
                <MaterialCommunityIcons name="plus" size={18} color={theme.colors.primary} />
                <Text style={{ color: theme.colors.primary, fontWeight: "500" }}>Add Tier</Text>
            </TouchableOpacity>
        </View>
    );
});

const styles = StyleSheet.create({
    configLabel: {
        fontSize: 13,
        marginBottom: 10,
    },
    sectionHint: {
        fontSize: 12,
        marginBottom: 12,
        marginTop: 6,
    },
    slabRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
        marginBottom: 12,
    },
    slabRangeCol: {
        flex: 2,
    },
    slabPointsCol: {
        flex: 1,
    },
    slabFieldLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    slabInput: {
        fontSize: 14,
    },
    removeBtn: {
        paddingBottom: 8,
    },
    addTierBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: "dashed",
        marginTop: 4,
    },
});
