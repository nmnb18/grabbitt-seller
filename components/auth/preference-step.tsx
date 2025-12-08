import { FormField, SellerFormData } from '@/hooks/use-seller-registration';
import { QR_CODE_TYPES } from '@/utils/constant';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, RadioButton, Text } from 'react-native-paper';
import { RewardTypeSection } from '../form/reward-type-section';

interface PreferencesStepProps {
    formData: Pick<SellerFormData,
        'qrCodeType' | 'defaultPoints' | 'subscriptionTier' | 'acceptTerms' |
        'rewardType' | 'percentageValue' | 'slabRules' | 'upiIds' | 'newUpiId'
    >;
    slabRules: { min: number; max: string; points: string }[];
    onFormDataChange: (field: FormField, value: any) => void;
    onSlabRulesChange: (rules: { min: number; max: string; points: string }[]) => void;
    accentColor: string;
}

export const PreferencesStep: React.FC<PreferencesStepProps> = ({
    formData,
    slabRules,
    onFormDataChange,
    onSlabRulesChange,
    accentColor,
}) => {
    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.stepTitle}>QR Code Preferences</Text>

            <Text variant="bodyMedium" style={styles.sectionLabel}>QR Code Type</Text>
            <RadioButton.Group
                value={formData.qrCodeType}
                onValueChange={(value) => onFormDataChange('qrCodeType', value)}
            >
                {QR_CODE_TYPES.map(type => (
                    <View key={type.value} style={styles.radioOption}>
                        <RadioButton.Android value={type.value} color={accentColor} disabled={type.disabled} />
                        <View style={styles.radioText}>
                            <Text variant="bodyLarge">{type.label}</Text>
                            <Text variant="bodySmall" style={[styles.helperText, { color: accentColor }]}>
                                {type.description}
                            </Text>
                        </View>
                    </View>
                ))}
            </RadioButton.Group>

            <RewardTypeSection
                rewardType={formData.rewardType}
                defaultPoints={formData.defaultPoints}
                percentageValue={formData.percentageValue}
                slabRules={slabRules}
                upiIds={formData.upiIds}
                newUpiId={formData.newUpiId}
                onRewardTypeChange={(value) => onFormDataChange('rewardType', value)}
                onDefaultPointsChange={(value) => onFormDataChange('defaultPoints', value)}
                onPercentageValueChange={(value) => onFormDataChange('percentageValue', value)}
                onSlabRulesChange={onSlabRulesChange}
                onUpiIdsChange={(value) => onFormDataChange('upiIds', value)}
                onNewUpiIdChange={(value) => onFormDataChange('newUpiId', value)}
            />

            <View style={styles.checkboxContainer}>
                <Checkbox.Android
                    status={formData.acceptTerms ? 'checked' : 'unchecked'}
                    onPress={() => onFormDataChange('acceptTerms', !formData.acceptTerms)}
                    color={accentColor}
                />
                <Text variant="bodyMedium" style={styles.checkboxLabel}>
                    I agree to the Terms of Service and Privacy Policy *
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: AppStyles.spacing.lg,
    },
    stepTitle: {
        marginBottom: AppStyles.spacing.md,
        fontWeight: '600',
    },
    sectionLabel: {
        marginBottom: AppStyles.spacing.sm,
        fontWeight: '500',
        marginTop: AppStyles.spacing.md,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.sm,
    },
    radioText: {
        flex: 1,
        marginLeft: 8,
    },
    helperText: {
        marginTop: 2,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.md,
        marginTop: AppStyles.spacing.sm,
    },
    checkboxLabel: {
        marginLeft: 8,
        flex: 1,
    },
});