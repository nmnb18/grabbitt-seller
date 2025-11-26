import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StepIndicatorProps {
    currentStep: number;
    totalSteps: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
    currentStep,
    totalSteps
}) => {
    return (
        <View style={styles.stepIndicator}>
            {Array.from({ length: totalSteps }, (_, index) => (
                <View key={index + 1} style={styles.stepDotContainer}>
                    <View
                        style={[
                            styles.stepDot,
                            index + 1 === currentStep && styles.stepDotActive,
                            index + 1 < currentStep && styles.stepDotCompleted
                        ]}
                    />
                    {index + 1 < totalSteps && <View style={styles.stepLine} />}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    stepIndicator: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.xl,
    },
    stepDotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#e0e0e0',
    },
    stepDotActive: {
        backgroundColor: '#e91e63',
        transform: [{ scale: 1.2 }],
    },
    stepDotCompleted: {
        backgroundColor: '#4caf50',
    },
    stepLine: {
        width: 40,
        height: 2,
        backgroundColor: '#e0e0e0',
        marginHorizontal: 4,
    },
});