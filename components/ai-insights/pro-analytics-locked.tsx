/**
 * ProAnalyticsLocked Component
 * Displays locked message for free tier users
 */

import { useTheme } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../ui/paper-button';

export function ProAnalyticsLocked() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 32,
            }}
        >
            <Text
                style={{
                    fontSize: 42,
                    marginBottom: 8,
                }}
            >
                🔒
            </Text>
            <Text
                style={{
                    fontSize: 18,
                    fontWeight: '700',
                    marginBottom: 6,
                    color: theme.colors.onBackground,
                }}
            >
                Advanced analytics locked
            </Text>
            <Text
                style={{
                    fontSize: 14,
                    color: theme.colors.onSurface,
                    textAlign: 'center',
                    marginBottom: 14,
                }}
            >
                Upgrade to Pro or Premium to unlock trends, peak hours, QR performance, and
                customer insights.
            </Text>
            <Button
                variant="text"
                icon="arrow-right-bold-circle"
                onPress={() => router.push('/(drawer)/subscription')}
            >
                Go to Plans
            </Button>
        </View>
    );
}
