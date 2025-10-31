import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppStyles } from '@/utils/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export type ButtonProps = {
    children: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'contained' | 'outlined' | 'text';
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
}: ButtonProps) {
    const backgroundColor = useThemeColor({}, 'background');
    const textColor = useThemeColor({}, 'text');
    const primaryColor = useThemeColor({}, 'primary');

    const isContained = variant === 'contained';
    const isOutlined = variant === 'outlined';
    const isText = variant === 'text';
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

    if (isOutlined) {
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

    // Text variant - simple text button with primary color
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.textButtonContainer,
                fullWidth && styles.fullWidth,
                (disabled || loading) && styles.disabledButton,
            ]}
        >
            {loading ? (
                <ActivityIndicator size="small" color={primaryColor} />
            ) : (
                <ThemedText
                    style={[
                        styles.textButtonText,
                        { color: primaryColor },
                        isLarge && styles.largeButtonText,
                    ]}
                >
                    {children}
                </ThemedText>
            )}
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
    textButtonContainer: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 40,
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
    textButtonText: {
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