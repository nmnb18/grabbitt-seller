import { FormField, SellerFormData } from '@/hooks/use-seller-registration';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { FormTextInput } from '../form/form-text-input';

interface AccountInfoStepProps {
    formData: Pick<SellerFormData,
        'name' | 'phone' | 'email' | 'password' | 'confirmPassword'
    >;
    showPassword: boolean;
    onFormDataChange: (field: FormField, value: string) => void;
    onTogglePassword: () => void;
}

export const AccountInfoStep: React.FC<AccountInfoStepProps> = ({
    formData,
    showPassword,
    onFormDataChange,
    onTogglePassword,
}) => {
    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.stepTitle}>Account Information</Text>

            <FormTextInput
                label="Full Name *"
                value={formData.name}
                onChangeText={(value) => onFormDataChange('name', value)}
                autoCapitalize="words"
                leftIcon="account"
            />

            <FormTextInput
                label="Phone Number"
                value={formData.phone}
                onChangeText={(value) => onFormDataChange('phone', value)}
                keyboardType="phone-pad"
                leftIcon="phone"
            />

            <FormTextInput
                label="Email *"
                value={formData.email}
                onChangeText={(value) => onFormDataChange('email', value)}
                keyboardType="email-address"
                leftIcon="email"
            />

            <FormTextInput
                label="Password *"
                value={formData.password}
                onChangeText={(value) => onFormDataChange('password', value)}
                secureTextEntry={!showPassword}
                leftIcon="lock"
                right={
                    <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={onTogglePassword}
                    />
                }
            />

            <FormTextInput
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChangeText={(value) => onFormDataChange('confirmPassword', value)}
                secureTextEntry={!showPassword}
                leftIcon="lock-check"
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