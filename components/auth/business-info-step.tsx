import { FormField, SellerFormData } from '@/hooks/use-seller-registration';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BusinessTypeSelector } from '../form/business-type-selector';
import { FormTextInput } from '../form/form-text-input';

interface BusinessInfoStepProps {
    formData: Pick<SellerFormData,
        'shopName' | 'businessType' | 'category' | 'description' | 'establishedYear'
    >;
    onFormDataChange: (field: FormField, value: string) => void;
}

export const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
    formData,
    onFormDataChange,
}) => {
    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.stepTitle}>Business Information</Text>

            <FormTextInput
                label="Shop/Business Name *"
                value={formData.shopName}
                onChangeText={(value) => onFormDataChange('shopName', value)}
                autoCapitalize="words"
                leftIcon="store"
            />

            <BusinessTypeSelector
                businessType={formData.businessType}
                category={formData.category}
                onBusinessTypeChange={(value) => onFormDataChange('businessType', value)}
                onCategoryChange={(value) => onFormDataChange('category', value)}
            />

            <FormTextInput
                label="Business Description *"
                value={formData.description}
                onChangeText={(value) => onFormDataChange('description', value)}
                multiline
                numberOfLines={3}
            />

            <FormTextInput
                label="Established Year (Optional)"
                value={formData.establishedYear}
                onChangeText={(value) => onFormDataChange('establishedYear', value)}
                keyboardType="numeric"
                leftIcon="calendar"
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
});