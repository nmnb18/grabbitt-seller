import { FormField, SellerFormData } from '@/hooks/use-seller-registration';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { BusinessInfoForm } from '../form/business-info-form';

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

            <BusinessInfoForm
                mode="step"
                shopName={formData.shopName}
                businessType={formData.businessType}
                category={formData.category}
                description={formData.description}
                establishedYear={formData.establishedYear}
                showTitle={false}
                showEstablishedYear={true}
                onShopNameChange={(val) => onFormDataChange('shopName', val)}
                onBusinessTypeChange={(val) => onFormDataChange('businessType', val)}
                onCategoryChange={(val) => onFormDataChange('category', val)}
                onDescriptionChange={(val) => onFormDataChange('description', val)}
                onEstablishedYearChange={(val) => onFormDataChange('establishedYear', val)}
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