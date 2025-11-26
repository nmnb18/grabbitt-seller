import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Button } from '../ui/paper-button';

interface LocationAutoFillBannerProps {
    isVisible: boolean;
    onRefresh: () => void;
}

export const LocationAutoFillBanner: React.FC<LocationAutoFillBannerProps> = ({
    isVisible,
    onRefresh,
}) => {
    if (!isVisible) return null;

    return (
        <View style={styles.autoFillBanner}>
            <Text variant="bodySmall" style={styles.autoFillText}>
                ✓ Address auto-filled from your location
            </Text>
            <Button onPress={onRefresh} variant="text">
                Refresh
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    autoFillBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E8F5E8',
        padding: AppStyles.spacing.md,
        borderRadius: 8,
        marginBottom: AppStyles.spacing.md,
    },
    autoFillText: {
        color: '#2E7D32',
        fontWeight: '600',
        flex: 1,
    },
});