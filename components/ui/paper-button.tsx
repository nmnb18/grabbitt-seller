// components/ui/grabbitt-button.tsx
import { ThemedText } from '@/components/themed-text';
import { AppStyles } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export type GrabbittButtonProps = {
    children: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'contained' | 'outlined';
    size?: 'medium' | 'large';
    fullWidth?: boolean;
};

export function Button({
    children,
    onPress,
    loading = false,
    disabled = false,
    variant = 'contained',
    size = 'medium',
    fullWidth = false,
}: GrabbittButtonProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');

    const isContained = variant === 'contained';
    const isLarge = size === 'large';

    if (isContained) {
        return (
            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || loading}
                style={[
                    styles.buttonBase,
                    styles.containedButton,
                    fullWidth && styles.fullWidth,
                    isLarge && styles.largeButton,
                    (disabled || loading) && styles.disabledButton,
                ]}
            >
                <LinearGradient
                    colors={AppStyles.gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.gradientBackground,
                        isLarge && styles.largeGradient,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <ThemedText
                            style={[
                                styles.buttonText,
                                styles.containedButtonText,
                                isLarge && styles.largeButtonText,
                            ]}
                        >
                            {children}
                        </ThemedText>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    // Outline variant with exact website styling
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.outlineContainer,
                fullWidth && styles.fullWidth,
                (disabled || loading) && styles.disabledButton,
            ]}
        >
            <LinearGradient
                colors={AppStyles.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.outlineGradientBorder}
            >
                <View style={[
                    styles.outlineButtonInner,
                    { backgroundColor },
                    isLarge && styles.largeOutlineButton,
                ]}>
                    {loading ? (
                        <ActivityIndicator size="small" color={textColor} />
                    ) : (
                        <ThemedText
                            style={[
                                styles.outlineButtonText,
                                { color: textColor },
                                isLarge && styles.largeButtonText,
                            ]}
                        >
                            {children}
                        </ThemedText>
                    )}
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    buttonBase: {
        borderRadius: 12,
        overflow: 'hidden',
        ...AppStyles.shadows.medium,
    },
    containedButton: {
        // Additional contained button styles if needed
    },
    outlineContainer: {
        borderRadius: 12,
        ...AppStyles.shadows.medium,
    },
    outlineGradientBorder: {
        borderRadius: 12,
        padding: 2, // Creates the border
    },
    outlineButtonInner: {
        borderRadius: 10, // 12 - 2 = 10
        paddingVertical: 10, // h-10 (2.5rem)
        paddingHorizontal: 24, // px-6 (1.5rem)
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40, // 2.5rem = 40px
    },
    largeOutlineButton: {
        paddingVertical: 14,
        minHeight: 48,
    },
    gradientBackground: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    largeGradient: {
        paddingVertical: 16,
        minHeight: 56,
    },
    largeButton: {
        minHeight: 56,
    },
    buttonText: {
        fontFamily: 'Inter',
        fontWeight: '500',
        textAlign: 'center',
    },
    containedButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    outlineButtonText: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
    },
    largeButtonText: {
        fontSize: 18,
    },
    fullWidth: {
        width: '100%',
    },
    disabledButton: {
        opacity: 0.6,
    },
});