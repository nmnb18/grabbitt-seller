/**
 * Reward Type Selector Component
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import { REWARD_TYPES } from "./types";

interface RewardTypeSelectorProps {
    rewardType: string;
    onSelectType: (typeId: string) => void;
}

export const RewardTypeSelector = React.memo(function RewardTypeSelector({
    rewardType,
    onSelectType,
}: RewardTypeSelectorProps) {
    const theme = useTheme();

    return (
        <>
            <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Reward Type</Text>
            <View style={styles.typeSelector}>
                {REWARD_TYPES.map((type) => {
                    const isSelected = rewardType === type.id;
                    return (
                        <TouchableOpacity
                            key={type.id}
                            onPress={() => onSelectType(type.id)}
                            style={[
                                styles.typePill,
                                {
                                    backgroundColor: isSelected ? type.color : theme.colors.surfaceVariant,
                                    borderColor: isSelected ? type.color : theme.colors.outline,
                                },
                            ]}
                            testID={`reward-type-${type.id}`}
                        >
                            <MaterialCommunityIcons
                                name={type.icon as any}
                                size={20}
                                color={isSelected ? "#fff" : theme.colors.onSurfaceDisabled}
                            />
                            <Text
                                style={[
                                    styles.typePillText,
                                    { color: isSelected ? "#fff" : theme.colors.onSurface },
                                ]}
                            >
                                {type.title}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </>
    );
});

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 14,
        fontWeight: "600",
        marginBottom: 10,
    },
    typeSelector: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    typePill: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 1,
    },
    typePillText: {
        fontSize: 12,
        fontWeight: "600",
    },
});
