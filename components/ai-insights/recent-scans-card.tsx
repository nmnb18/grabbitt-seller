/**
 * RecentScansCard Component
 * Displays recent scan activity
 */

import { useTheme } from '@/hooks/use-theme-color';
import { LastScan } from '@/hooks/useAnalytics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface RecentScansCardProps {
    scans?: LastScan[];
}

export function RecentScansCard({ scans }: RecentScansCardProps) {
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
                        Recent Scans
                    </Text>
                </View>

                {scans && scans.length > 0 ? (
                    scans.map((scan, idx) => (
                        <View
                            key={scan.id || idx}
                            style={{
                                paddingVertical: 10,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: theme.colors.outline,
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: '500',
                                    color: theme.colors.onSurface,
                                }}
                            >
                                {scan.description || 'QR Scan'}
                            </Text>
                            <Text
                                style={{
                                    fontSize: 12,
                                    marginTop: 2,
                                    color: theme.colors.onSurfaceDisabled,
                                }}
                            >
                                {scan.points ?? 0} pts • {scan.qr_type || 'QR'}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text
                        style={{
                            fontSize: 13,
                            marginTop: 4,
                            color: theme.colors.onSurfaceDisabled,
                        }}
                    >
                        No recent scans yet.
                    </Text>
                )}
            </Card.Content>
        </Card>
    );
}
