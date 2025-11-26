import { FormField, SellerFormData } from '@/hooks/use-seller-registration';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { FormTextInput } from '../form/form-text-input';

interface VerificationStepProps {
    formData: Pick<SellerFormData,
        'gstNumber' | 'panNumber' | 'businessRegistrationNumber'
    >;
    onFormDataChange: (field: FormField, value: string) => void;
}

export const VerificationStep: React.FC<VerificationStepProps> = ({
    formData,
    onFormDataChange,
}) => {
    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.stepTitle}>Business Verification</Text>
            <Text variant="bodySmall" style={styles.optionalText}>(Optional - Can be completed later)</Text>

            <FormTextInput
                label="GST Number"
                value={formData.gstNumber}
                onChangeText={(value) => onFormDataChange('gstNumber', value)}
                leftIcon="card-account-details"
            />

            <FormTextInput
                label="PAN Number"
                value={formData.panNumber}
                onChangeText={(value) => onFormDataChange('panNumber', value)}
                leftIcon="card-bulleted"
            />

            <FormTextInput
                label="Business Registration Number"
                value={formData.businessRegistrationNumber}
                onChangeText={(value) => onFormDataChange('businessRegistrationNumber', value)}
                leftIcon="file-document"
            />
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
    optionalText: {
        color: '#666',
        marginBottom: AppStyles.spacing.md,
        fontStyle: 'italic',
    },
});