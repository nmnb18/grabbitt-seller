/**
 * CustomersCard Component
 * Displays customer segments and new vs returning
 */

import { useTheme } from '@/hooks/use-theme-color';
import { Segments } from '@/hooks/useProAnalytics';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { SegmentPill } from './segment-pill';

interface CustomersCardProps {
    newVsReturning?: { new: number; returning: number };
    segments?: Segments;
}

export function CustomersCard({ newVsReturning, segments }: CustomersCardProps) {
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
                        Customers (last 30 days)
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    {/* New vs Returning */}
                    <View style={{ flex: 1, paddingRight: 4 }}>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: theme.colors.onSurface,
                                marginBottom: 4,
                            }}
                        >
                            New vs Returning
                        </Text>
                        <View
                            style={{
                                flexDirection: 'row',
                                borderRadius: 999,
                                overflow: 'hidden',
                                height: 12,
                                backgroundColor: theme.colors.surfaceVariant,
                            }}
                        >
                            {newVsReturning && (
                                <>
                                    <View
                                        style={{
                                            flex: newVsReturning.new,
                                            backgroundColor: theme.colors.primary,
                                        }}
                                    />
                                    <View
                                        style={{
                                            flex: newVsReturning.returning,
                                            backgroundColor: theme.colors.success,
                                        }}
                                    />
                                </>
                            )}
                        </View>
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginTop: 6,
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 999,
                                        marginRight: 4,
                                        backgroundColor: theme.colors.primary,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: theme.colors.accent,
                                    }}
                                >
                                    New: {newVsReturning?.new ?? 0}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: 999,
                                        marginRight: 4,
                                        backgroundColor: theme.colors.success,
                                    }}
                                />
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: theme.colors.accent,
                                    }}
                                >
                                    Returning: {newVsReturning?.returning ?? 0}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Segments */}
                    <View style={{ flex: 1, paddingLeft: 4 }}>
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: theme.colors.onSurface,
                                marginBottom: 4,
                            }}
                        >
                            Segments
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 6 }}>
                            <SegmentPill
                                label="New"
                                value={segments?.new ?? 0}
                                color={theme.colors.primary}
                            />
                            <SegmentPill
                                label="Loyal"
                                value={segments?.loyal ?? 0}
                                color={theme.colors.secondary}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <SegmentPill
                                label="Redeemer"
                                value={segments?.redeemer ?? 0}
                                color={theme.colors.warning}
                            />
                            <SegmentPill
                                label="Dormant"
                                value={segments?.dormant ?? 0}
                                color={theme.colors.accent}
                            />
                        </View>
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
}
