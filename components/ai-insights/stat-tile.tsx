/**
 * StatTile Component
 * Displays individual statistic with icon and trend
 */

import { useTheme } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface StatTileProps {
    label: string;
    value: number;
    icon: string;
}

export function StatTile({ label, value, icon }: StatTileProps) {
    const theme = useTheme();

    return (
        <Card style={{ width: '48%', marginBottom: 12, backgroundColor: 'transparent' }} elevation={0}>
            <Card.Content
                style={{
                    backgroundColor: theme.colors.surface,
                    borderRadius: 14,
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                }}
            >
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 4,
                    }}
                >
                    <MaterialCommunityIcons
                        name={icon as any}
                        size={22}
                        color={theme.colors.accent}
                    />
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderRadius: 999,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            backgroundColor: theme.colors.success + '22',
                        }}
                    >
                        <MaterialCommunityIcons
                            name="trending-up"
                            size={14}
                            color={theme.colors.success}
                        />
                        <Text
                            style={{
                                marginLeft: 4,
                                fontSize: 10,
                                color: theme.colors.success,
                            }}
                        >
                            —
                        </Text>
                    </View>
                </View>

                <Text
                    style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: theme.colors.onSurface,
                        marginBottom: 4,
                    }}
                >
                    {value}
                </Text>
                <Text
                    style={{
                        fontSize: 12,
                        color: theme.colors.onSurfaceDisabled,
                    }}
                >
                    {label}
                </Text>
            </Card.Content>
        </Card>
    );
}
