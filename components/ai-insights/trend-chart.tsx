/**
 * TrendChart Component
 * Displays 7-day trend mini chart with bar visualization
 */

import { useTheme } from '@/hooks/use-theme-color';
import { DayBucket } from '@/hooks/useProAnalytics';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface TrendChartProps {
    trends: DayBucket[];
    maxScans: number;
}

export function TrendChart({ trends, maxScans }: TrendChartProps) {
    const theme = useTheme();

    return (
        <Card
            style={{
                borderRadius: 16,
                backgroundColor: theme.colors.surface,
                marginBottom: 16,
            }}
        >
            <Card.Content>
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        marginBottom: 8,
                    }}
                >
                    <Text
                        style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: theme.colors.onSurface,
                        }}
                    >
                        Last 7 days
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: theme.colors.accent,
                        }}
                    >
                        Scans per day
                    </Text>
                </View>

                {trends?.length ? (
                    <View>
                        {trends.map((day) => {
                            const widthPercent = maxScans ? (day.scans / maxScans) * 100 : 0;
                            return (
                                <View
                                    key={day.date}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginBottom: 6,
                                    }}
                                >
                                    <Text
                                        style={{
                                            width: 52,
                                            fontSize: 11,
                                            color: theme.colors.accent,
                                        }}
                                    >
                                        {day.date.slice(5)}
                                    </Text>
                                    <View
                                        style={{
                                            flex: 1,
                                            height: 8,
                                            borderRadius: 999,
                                            backgroundColor: theme.colors.surfaceVariant,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <View
                                            style={{
                                                height: 8,
                                                borderRadius: 999,
                                                backgroundColor: theme.colors.accent,
                                                width: `${widthPercent || 4}%`,
                                            }}
                                        />
                                    </View>
                                    <Text
                                        style={{
                                            width: 32,
                                            fontSize: 11,
                                            textAlign: 'right',
                                            color: theme.colors.onSurface,
                                            marginLeft: 6,
                                        }}
                                    >
                                        {day.scans}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <Text
                        style={{
                            fontSize: 12,
                            color: theme.colors.accent,
                        }}
                    >
                        No scans in the last 7 days.
                    </Text>
                )}
            </Card.Content>
        </Card>
    );
}
