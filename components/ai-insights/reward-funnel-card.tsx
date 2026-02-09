/**
 * RewardFunnelCard Component
 * Displays reward funnel metrics
 */

import { useTheme } from '@/hooks/use-theme-color';
import { RewardFunnel } from '@/hooks/useProAnalytics';
import React from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface RewardFunnelCardProps {
    funnel?: RewardFunnel;
}

export function RewardFunnelCard({ funnel }: RewardFunnelCardProps) {
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
                        Reward Funnel
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

                <Text
                    style={{
                        fontSize: 13,
                        color: theme.colors.onSurface,
                        marginBottom: 3,
                    }}
                >
                    Customers earning points: {funnel?.earned_customers ?? 0}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: theme.colors.onSurface,
                        marginBottom: 3,
                    }}
                >
                    Customers who redeemed: {funnel?.redeemed_customers ?? 0}
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: theme.colors.onSurface,
                    }}
                >
                    Total redemptions: {funnel?.total_redemptions ?? 0}
                </Text>
            </Card.Content>
        </Card>
    );
}
