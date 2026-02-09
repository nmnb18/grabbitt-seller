/**
 * ProAnalyticsHeader Component
 * Header with tier badge for pro analytics
 */

import { useTheme } from '@/hooks/use-theme-color';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface ProAnalyticsHeaderProps {
    sellerName?: string | null;
    tier: 'free' | 'pro' | 'premium';
}

export function ProAnalyticsHeader({ sellerName, tier }: ProAnalyticsHeaderProps) {
    const theme = useTheme();

    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
            }}
        >
            <View>
                <Text
                    style={{
                        fontSize: 22,
                        fontWeight: '700',
                        color: theme.colors.onBackground,
                    }}
                >
                    Advanced Analytics
                </Text>
                <Text
                    style={{
                        fontSize: 13,
                        color: theme.colors.accent,
                        marginTop: 2,
                    }}
                >
                    {sellerName || 'Your shop'} • Pro insights
                </Text>
            </View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.colors.surfaceVariant,
                    borderRadius: 999,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                }}
            >
                <MaterialCommunityIcons
                    name="crown-outline"
                    size={14}
                    color={theme.colors.warning}
                />
                <Text
                    style={{
                        fontSize: 11,
                        color: theme.colors.warning,
                        marginLeft: 4,
                        fontWeight: '600',
                    }}
                >
                    {tier.toUpperCase()}
                </Text>
            </View>
        </View>
    );
}
