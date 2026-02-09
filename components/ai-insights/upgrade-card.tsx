/**
 * UpgradeCard Component
 * Prompts free tier users to upgrade
 */

import { useTheme } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Button } from '../ui/paper-button';

export function UpgradeCard() {
    const theme = useTheme();
    const router = useRouter();

    return (
        <Card
            style={{
                borderRadius: 16,
                backgroundColor: theme.colors.surfaceVariant,
            }}
        >
            <Card.Content>
                <Text
                    style={{
                        fontSize: 16,
                        fontWeight: '700',
                        marginBottom: 4,
                        color: theme.colors.secondary,
                    }}
                >
                    Unlock full analytics
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        marginBottom: 8,
                        color: theme.colors.onSurface,
                    }}
                >
                    Get detailed trends, charts, customer segments, and more with Pro or Premium.
                </Text>

                <View style={{ marginBottom: 8 }}>
                    <Text
                        style={{
                            fontSize: 12,
                            color: theme.colors.onSurfaceDisabled,
                            marginBottom: 2,
                        }}
                    >
                        • Scan trends & charts
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: theme.colors.onSurfaceDisabled,
                            marginBottom: 2,
                        }}
                    >
                        • Top customers insights
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: theme.colors.onSurfaceDisabled,
                        }}
                    >
                        • Export reports
                    </Text>
                </View>

                <Button
                    variant="text"
                    onPress={() => router.push('/(drawer)/subscription')}
                    icon="arrow-right-bold-circle"
                >
                    Go to Plans
                </Button>
            </Card.Content>
        </Card>
    );
}
