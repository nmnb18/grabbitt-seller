/**
 * PeakTimesCard Component
 * Displays peak hours and peak days analytics
 */

import { useTheme } from '@/hooks/use-theme-color';
import { PeakDay, PeakHour } from '@/hooks/useProAnalytics';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface PeakTimesCardProps {
    topHours: PeakHour[];
    topDays: PeakDay[];
}

function weekdayLabel(idx: number) {
    const map = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return map[idx] || '-';
}

export function PeakTimesCard({ topHours, topDays }: PeakTimesCardProps) {
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
                        Peak times
                    </Text>
                    <Text
                        style={{
                            fontSize: 12,
                            color: theme.colors.accent,
                        }}
                    >
                        Last 30 days
                    </Text>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    {/* Top Hours */}
                    <View style={{ flex: 1, paddingRight: 4 }}>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: theme.colors.onSurface,
                                marginBottom: 4,
                            }}
                        >
                            Top Hours
                        </Text>
                        {topHours?.length ? (
                            topHours.map((h) => (
                                <View
                                    key={h.hour}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        paddingVertical: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: theme.colors.onSurface,
                                        }}
                                    >
                                        {h.hour}:00
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: theme.colors.accent,
                                        }}
                                    >
                                        {h.scans} scans
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: theme.colors.accent,
                                }}
                            >
                                No hour data.
                            </Text>
                        )}
                    </View>

                    {/* Top Days */}
                    <View style={{ flex: 1, paddingLeft: 4 }}>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: theme.colors.onSurface,
                                marginBottom: 4,
                            }}
                        >
                            Top Days
                        </Text>
                        {topDays?.length ? (
                            topDays.map((d) => (
                                <View
                                    key={d.weekday}
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        paddingVertical: 4,
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: theme.colors.onSurface,
                                        }}
                                    >
                                        {weekdayLabel(d.weekday)}
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: theme.colors.accent,
                                        }}
                                    >
                                        {d.scans} scans
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text
                                style={{
                                    fontSize: 12,
                                    color: theme.colors.accent,
                                }}
                            >
                                No day data.
                            </Text>
                        )}
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
}
