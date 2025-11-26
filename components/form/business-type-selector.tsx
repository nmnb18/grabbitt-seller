import { BUSINESS_TYPES, CATEGORIES } from '@/utils/constant';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';

interface BusinessTypeSelectorProps {
    businessType: string;
    category: string;
    onBusinessTypeChange: (type: string) => void;
    onCategoryChange: (category: string) => void;
}

export const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({
    businessType,
    category,
    onBusinessTypeChange,
    onCategoryChange,
}) => {
    return (
        <View>
            <Text variant="bodyMedium" style={styles.sectionLabel}>Business Type *</Text>
            <View style={styles.multiLineContainer}>
                {BUSINESS_TYPES.map((button) => (
                    <Chip
                        key={button.value}
                        selected={businessType === button.value}
                        onPress={() => {
                            onBusinessTypeChange(button.value);
                            onCategoryChange('');
                        }}
                        style={[
                            styles.businessChip,
                            businessType === button.value && styles.selectedChip
                        ]}
                        textStyle={[
                            styles.chipText,
                            businessType === button.value && styles.selectedChipText
                        ]}
                    >
                        {button.label}
                    </Chip>
                ))}
            </View>

            {businessType && (
                <>
                    <Text variant="bodyMedium" style={styles.sectionLabel}>Category *</Text>
                    <View style={styles.multiLineContainer}>
                        {CATEGORIES[businessType as keyof typeof CATEGORIES]?.map((categoryItem) => {
                            const categoryValue = categoryItem.toLowerCase();
                            const isSelected = category === categoryValue;

                            return (
                                <Chip
                                    key={categoryValue}
                                    selected={isSelected}
                                    onPress={() => onCategoryChange(categoryValue)}
                                    style={[
                                        styles.businessChip,
                                        isSelected && styles.selectedChip
                                    ]}
                                    textStyle={[
                                        styles.chipText,
                                        isSelected && styles.selectedChipText
                                    ]}
                                    showSelectedCheck={false}
                                >
                                    {categoryItem}
                                </Chip>
                            );
                        }) || []}
                    </View>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionLabel: {
        marginBottom: AppStyles.spacing.sm,
        fontWeight: '500',
        marginTop: AppStyles.spacing.md,
    },
    multiLineContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginVertical: 8,
    },
    businessChip: {
        marginBottom: 8,
        backgroundColor: '#f5f5f5',
    },
    selectedChip: {
        backgroundColor: AppStyles.colors.light.primary,
    },
    chipText: {
        fontSize: 12,
    },
    selectedChipText: {
        color: AppStyles.colors.light.onPrimary,
    },
});