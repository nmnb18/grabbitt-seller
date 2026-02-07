/**
 * SegmentPill Component
 * Displays individual customer segment with colored border
 */

import { useTheme } from '@/hooks/use-theme-color';
import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

interface SegmentPillProps {
    label: string;
    value: number;
    color: string;
}

export function SegmentPill({ label, value, color }: SegmentPillProps) {
    const theme = useTheme();

    return (
        <View
            style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderRadius: 999,
                borderWidth: 1,
                borderColor: color,
                paddingHorizontal: 8,
                paddingVertical: 4,
            }}
        >
            <Text
                style={{
                    fontSize: 11,
                    fontWeight: '600',
                    marginRight: 4,
                    color: color,
                }}
            >
                {label}
            </Text>
            <Text
                style={{
                    fontSize: 11,
                    color: color,
                }}
            >
                {value}
            </Text>
        </View>
    );
}
