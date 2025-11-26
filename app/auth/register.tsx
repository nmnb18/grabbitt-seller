import { GradientText } from '@/components/ui/gradient-text';
import { Button } from '@/components/ui/paper-button';
import AuthScreenWrapper from '@/components/wrappers/authScreenWrapper';
import { useTheme, useThemeColor } from '@/hooks/use-theme-color';
import { AppStyles } from '@/utils/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';

// Import reusable components
import { AccountInfoStep } from '@/components/auth/account-info-step';
import { BusinessInfoStep } from '@/components/auth/business-info-step';
import { LocationStep } from '@/components/auth/location-step';
import { PreferencesStep } from '@/components/auth/preference-step';
import { StepIndicator } from '@/components/auth/step-indicator';
import { VerificationStep } from '@/components/auth/verification-step';

// Import hooks
import { useLocation } from '@/hooks/use-location';
import { useSellerRegistration } from '@/hooks/use-seller-registration';

export default function SellerRegister() {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const {
        formData,
        updateFormData,
        validateStep,
        handleRegister,
        loading,
        slabRules,
    } = useSellerRegistration();

    const {
        locationLoading,
        isAutoFilled,
        getCurrentLocation,
        handleEnableLocationToggle
    } = useLocation({ formData, updateFormData });

    const router = useRouter();
    const theme = useTheme();
    const outlineColor = useThemeColor({}, 'outline');
    const accentColor = useThemeColor({}, 'accent');

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const renderStep = () => {
        const commonProps = {
            formData,
            onFormDataChange: updateFormData,
        };

        switch (currentStep) {
            case 1:
                return (
                    <AccountInfoStep
                        {...commonProps}
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                    />
                );
            case 2:
                return <BusinessInfoStep {...commonProps} />;
            case 3:
                return (
                    <LocationStep
                        {...commonProps}
                        isAutoFilled={isAutoFilled}
                        locationLoading={locationLoading}
                        getCurrentLocation={getCurrentLocation}
                        handleEnableLocationToggle={handleEnableLocationToggle}
                    />
                );
            case 4:
                return <VerificationStep {...commonProps} />;
            case 5:
                return (
                    <PreferencesStep
                        {...commonProps}
                        slabRules={slabRules}
                        onSlabRulesChange={(rules) => {/* handle slab rules update */ }}
                        accentColor={accentColor}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <AuthScreenWrapper>
            <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface, borderColor: outlineColor }]} elevation={2}>
                <GradientText style={styles.gradientTitle}>Step {currentStep} of 5</GradientText>

                <StepIndicator currentStep={currentStep} totalSteps={5} />

                {renderStep()}

                <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                        <Button variant="outlined" fullWidth onPress={handlePrevious}>
                            Back
                        </Button>
                    )}

                    {currentStep < 5 ? (
                        <Button variant="contained" fullWidth onPress={handleNext}>
                            Next
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            fullWidth
                            loading={loading}
                            disabled={!formData.acceptTerms}
                            onPress={handleRegister}
                        >
                            Complete Registration
                        </Button>
                    )}

                    <Button variant="text" fullWidth onPress={() => router.push("/auth/login")}>
                        Already have an account? Login
                    </Button>
                </View>
            </Surface>
        </AuthScreenWrapper>
    );
}

const styles = StyleSheet.create({
    gradientTitle: {
        fontFamily: 'Poppins',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: AppStyles.spacing.lg,
    },
    formCard: {
        borderRadius: 12,
        padding: AppStyles.spacing.lg,
        borderWidth: 1,
    },
    buttonContainer: {
        marginTop: 24,
        gap: 14,
    },
});