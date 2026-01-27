import { FormField, SellerFormData } from '@/hooks/use-seller-registration';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text } from 'react-native-paper';
import { FormTextInput } from '../form/form-text-input';

interface VerificationStepProps {
    formData: Pick<SellerFormData,
        'gstNumber' | 'panNumber' | 'businessRegistrationNumber'
    >;
    onFormDataChange: (field: FormField, value: string) => void;
}

// Validation helpers
const isValidGST = (gst: string): boolean => {
    if (!gst) return true; // Optional field
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gst.toUpperCase());
};

const isValidPAN = (pan: string): boolean => {
    if (!pan) return true; // Optional field
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
};

export const VerificationStep: React.FC<VerificationStepProps> = ({
    formData,
    onFormDataChange,
}) => {
    const accentColor = useThemeColor({}, 'accent');
    const errorColor = useThemeColor({}, 'error');
    
    const gstError = formData.gstNumber && !isValidGST(formData.gstNumber);
    const panError = formData.panNumber && !isValidPAN(formData.panNumber);

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.stepTitle}>Business Verification</Text>
            <Text variant="bodySmall" style={styles.optionalText}>(Optional - Can be completed later)</Text>

            <FormTextInput
                label="GST Number"
                value={formData.gstNumber}
                onChangeText={(value) => onFormDataChange('gstNumber', value.toUpperCase())}
                leftIcon="card-account-details"
                autoCapitalize="characters"
                maxLength={15}
                error={gstError}
            />
            {gstError && (
                <HelperText type="error" visible={true} style={{ color: errorColor }}>
                    Invalid GST format (e.g., 22AAAAA0000A1Z5)
                </HelperText>
            )}

            <FormTextInput
                label="PAN Number"
                value={formData.panNumber}
                onChangeText={(value) => onFormDataChange('panNumber', value.toUpperCase())}
                leftIcon="card-bulleted"
                autoCapitalize="characters"
                maxLength={10}
                error={panError}
            />
            {panError && (
                <HelperText type="error" visible={true} style={{ color: errorColor }}>
                    Invalid PAN format (e.g., ABCDE1234F)
                </HelperText>
            )}

            <FormTextInput
                label="Business Registration Number"
                value={formData.businessRegistrationNumber}
                onChangeText={(value) => onFormDataChange('businessRegistrationNumber', value)}
                leftIcon="file-document"
            />
            <HelperText type="info" style={{ color: accentColor }}>
                Add your CIN, UDYAM, or other registration number
            </HelperText>
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