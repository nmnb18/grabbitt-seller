/**
 * AnalyticsHeader Component
 * Header section for analytics screens
 */

import { useTheme } from '@/hooks/use-theme-color';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface AnalyticsHeaderProps {
    title: string;
    subtitle: string;
}

export function AnalyticsHeader({ title, subtitle }: AnalyticsHeaderProps) {
    const theme = useTheme();

    return (
        <View style={{ marginBottom: 16 }}>
            <Text
                style={{
                    fontSize: 22,
                    fontWeight: '700',
                    color: theme.colors.onSurface,
                    marginBottom: 2,
                }}
            >
                {title}
            </Text>
            <Text
                style={{
                    fontSize: 13,
                    color: theme.colors.onSurfaceDisabled,
                }}
            >
                {subtitle}
            </Text>
        </View>
    );
}
