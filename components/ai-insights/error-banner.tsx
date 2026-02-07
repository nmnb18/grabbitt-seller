/**
 * ErrorBanner Component
 * Displays error messages in analytics views
 */

import { useTheme } from '@/hooks/use-theme-color';
import React from 'react';
import { Card, Text } from 'react-native-paper';

interface ErrorBannerProps {
    error: string;
}

export function ErrorBanner({ error }: ErrorBannerProps) {
    const theme = useTheme();

    return (
        <Card
            style={{
                backgroundColor: theme.colors.error + '22',
                marginBottom: 12,
                borderRadius: 12,
            }}
        >
            <Card.Content>
                <Text
                    style={{
                        color: theme.colors.error,
                        fontSize: 13,
                    }}
                >
                    {error}
                </Text>
            </Card.Content>
        </Card>
    );
}
