/**
 * TodayCard Component
 * Displays today's statistics summary
 */

import { useTheme } from '@/hooks/use-theme-color';
import { TodayStats } from '@/hooks/useAnalytics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface TodayCardProps {
    today?: TodayStats;
}

export function TodayCard({ today }: TodayCardProps) {
    const theme = useTheme();

    return (
        <Card
            style={{
                borderRadius: 16,
                marginBottom: 16,
                backgroundColor: theme.colors.surface,
            }}
            elevation={2}
        >
            <Card.Content>
                {/* Header with icon */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <View>
                        <Text
                            style={{
                                fontSize: 14,
                                textTransform: 'uppercase',
                                letterSpacing: 0.8,
                                marginBottom: 4,
                                fontWeight: '600',
                                color: theme.colors.primary,
                            }}
                        >
                            Today
                        </Text>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '700',
                                color: theme.colors.onSurface,
                            }}
                        >
                            {today?.scans ?? 0} scans
                        </Text>
                    </View>
                    <MaterialCommunityIcons
                        name="calendar-today"
                        size={32}
                        color={theme.colors.accent}
                    />
                </View>

                {/* Stats row */}
                <View style={{ marginTop: 12 }}>
                    <Text
                        style={{
                            fontSize: 13,
                            color: theme.colors.onSurfaceDisabled,
                            marginBottom: 4,
                        }}
                    >
                        {today?.points_issued ?? 0} Points Issued
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: theme.colors.onSurfaceDisabled,
                            marginBottom: 4,
                        }}
                    >
                        {today?.points_redeemed ?? 0} Points Redeemed
                    </Text>
                    <Text
                        style={{
                            fontSize: 13,
                            color: theme.colors.onSurfaceDisabled,
                        }}
                    >
                        {today?.redemptions ?? 0} Redemptions
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );
}
