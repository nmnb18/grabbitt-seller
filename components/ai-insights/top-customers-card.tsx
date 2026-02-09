/**
 * TopCustomersCard Component
 * Displays top customers with avatar and statistics
 */

import { useTheme } from '@/hooks/use-theme-color';
import { TopCustomer } from '@/hooks/useProAnalytics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface TopCustomersCardProps {
    customers?: TopCustomer[];
}

export function TopCustomersCard({ customers }: TopCustomersCardProps) {
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
                        Top Customers
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

                {customers && customers.length > 0 ? (
                    customers.slice(0, 5).map((c) => (
                        <View
                            key={c.user_id}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 8,
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderBottomColor: theme.colors.outline,
                            }}
                        >
                            <View
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 999,
                                    backgroundColor: theme.colors.surfaceVariant,
                                    marginRight: 10,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 12,
                                        fontWeight: '700',
                                        color: theme.colors.primary,
                                    }}
                                >
                                    {c.customer_name?.slice(0, 2).toUpperCase()}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        fontWeight: '600',
                                        color: theme.colors.onSurface,
                                    }}
                                >
                                    Customer {c.customer_name}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 11,
                                        color: theme.colors.accent,
                                    }}
                                >
                                    {c.total_scans} scans • {c.total_points} pts
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text
                        style={{
                            fontSize: 13,
                            color: theme.colors.accent,
                        }}
                    >
                        Not enough data yet.
                    </Text>
                )}
            </Card.Content>
        </Card>
    );
}
