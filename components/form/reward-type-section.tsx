import { useThemeColor } from '@/hooks/use-theme-color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, IconButton, RadioButton, Text } from 'react-native-paper';
import { Button } from '../ui/paper-button';
import { FormTextInput } from './form-text-input';

interface SlabRule {
    min: number;
    max: string;
    points: string;
}

interface RewardTypeSectionProps {
    rewardType: string;
    defaultPoints: string;
    percentageValue: string;
    slabRules: SlabRule[];
    upiIds: string[];
    newUpiId: string;
    onRewardTypeChange: (type: string) => void;
    onDefaultPointsChange: (points: string) => void;
    onPercentageValueChange: (value: string) => void;
    onSlabRulesChange: (rules: SlabRule[]) => void;
    onUpiIdsChange: (upiIds: string[]) => void;
    onNewUpiIdChange: (upiId: string) => void;
}

export const RewardTypeSection: React.FC<RewardTypeSectionProps> = ({
    rewardType,
    defaultPoints,
    percentageValue,
    slabRules,
    upiIds,
    newUpiId,
    onRewardTypeChange,
    onDefaultPointsChange,
    onPercentageValueChange,
    onSlabRulesChange,
    onUpiIdsChange,
    onNewUpiIdChange,
}) => {
    const accentColor = useThemeColor({}, 'accent');

    const updateSlab = (index: number, field: "max" | "points", value: string) => {
        const updated = [...slabRules];
        updated[index][field] = value;
        onSlabRulesChange(updated);
    };

    const addSlab = () => {
        const last = slabRules[slabRules.length - 1];
        if (!last.max || !last.points) return;

        onSlabRulesChange([
            ...slabRules,
            { min: parseFloat(last.max), max: "", points: "" }
        ]);
    };

    const removeSlab = (index: number) => {
        onSlabRulesChange(slabRules.filter((_, i) => i !== index));
    };

    const addUpiId = () => {
        if (!newUpiId.trim()) return;
        onUpiIdsChange([...upiIds, newUpiId.trim().toLowerCase()]);
        onNewUpiIdChange("");
    };

    const removeUpiId = (index: number) => {
        onUpiIdsChange(upiIds.filter((_, i) => i !== index));
    };

    return (
        <View>
            <Text variant="bodyMedium" style={styles.sectionLabel}>Reward Type</Text>

            <RadioButton.Group value={rewardType} onValueChange={onRewardTypeChange}>
                <View style={styles.radioOption}>
                    <RadioButton.Android value="default" color={accentColor} />
                    <Text>Default (Fixed points per scan)</Text>
                </View>

                <View style={styles.radioOption}>
                    <RadioButton.Android value="percentage" color={accentColor} />
                    <Text>Percentage of payment</Text>
                </View>

                <View style={styles.radioOption}>
                    <RadioButton.Android value="slab" color={accentColor} />
                    <Text>Slab-based reward</Text>
                </View>
            </RadioButton.Group>

            {rewardType === 'default' && (
                <FormTextInput
                    label="Default (Flat) Points per Scan"
                    value={defaultPoints}
                    onChangeText={onDefaultPointsChange}
                    keyboardType="numeric"
                    leftIcon="star"
                />
            )}

            {rewardType === 'percentage' && (
                <FormTextInput
                    label="Percentage (%)"
                    value={percentageValue}
                    onChangeText={onPercentageValueChange}
                    keyboardType="numeric"
                    leftIcon="percent"
                />
            )}

            {rewardType === "slab" && (
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionLabel}>Slab Rules</Text>
                    {slabRules.map((rule, index) => (
                        <View key={index} style={styles.slabRuleContainer}>
                            <FormTextInput
                                label="Min Amount"
                                value={String(rule.min)}
                                disabled
                            />
                            <FormTextInput
                                label="Max Amount"
                                value={rule.max}
                                onChangeText={(v) => updateSlab(index, "max", v)}
                                keyboardType="numeric"
                            />
                            <FormTextInput
                                label="Points"
                                value={rule.points}
                                onChangeText={(v) => updateSlab(index, "points", v)}
                                keyboardType="numeric"
                            />
                            <View style={styles.slabActions}>
                                {slabRules.length > 1 && (
                                    <Button icon="delete" variant="outlined" onPress={() => removeSlab(index)}>
                                        Remove
                                    </Button>
                                )}
                                {index === slabRules.length - 1 && (
                                    <Button icon="plus" variant="contained" onPress={addSlab}>
                                        Add Slab
                                    </Button>
                                )}
                            </View>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.upiSection}>
                <Text variant="bodyMedium" style={styles.sectionLabel}>UPI IDs</Text>
                <View style={styles.upiInputRow}>
                    <FormTextInput
                        label="Enter UPI ID"
                        value={newUpiId}
                        onChangeText={onNewUpiIdChange}
                        autoCapitalize="none"
                        style={styles.flexInput}
                        leftIcon="bank"
                    />
                    <IconButton
                        icon="plus-circle"
                        iconColor={accentColor}
                        size={32}
                        onPress={addUpiId}
                    />
                </View>

                {upiIds.map((upi, idx) => (
                    <View key={idx} style={styles.upiChipContainer}>
                        <Chip style={styles.upiChip}>
                            {upi}
                        </Chip>
                        <IconButton
                            icon="delete"
                            iconColor="red"
                            size={20}
                            onPress={() => removeUpiId(idx)}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        marginBottom: 8,
        fontWeight: '500',
        marginTop: 16,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    slabRuleContainer: {
        marginBottom: 14,
        padding: 10,
        borderRadius: 10,
        borderWidth: 1,
    },
    slabActions: {
        flexDirection: 'row',
        marginTop: 8,
        gap: 8,
    },
    upiSection: {
        marginTop: 16,
    },
    upiInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flexInput: {
        flex: 1,
    },
    upiChipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    upiChip: {
        flex: 1,
    },
});