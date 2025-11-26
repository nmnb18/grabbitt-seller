import { FormField, SellerFormData } from '@/hooks/use-seller-registration';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AppStyles } from '@/utils/theme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, HelperText, Text } from 'react-native-paper';
import { FormTextInput } from '../form/form-text-input';
import { LocationAutoFillBanner } from '../form/location-autofill-banner';
import { Button } from '../ui/paper-button';

interface LocationStepProps {
    formData: Pick<SellerFormData,
        'street' | 'city' | 'state' | 'pincode' | 'country' |
        'enableLocation' | 'locationRadius' | 'latitude' | 'longitude'
    >;
    isAutoFilled: boolean;
    locationLoading: boolean;
    onFormDataChange: (field: FormField, value: any) => void;
    getCurrentLocation: () => Promise<{ latitude: number; longitude: number } | null>;
    handleEnableLocationToggle: () => void;
}

export const LocationStep: React.FC<LocationStepProps> = ({
    formData,
    isAutoFilled,
    locationLoading,
    onFormDataChange,
    getCurrentLocation,
    handleEnableLocationToggle,
}) => {
    const accentColor = useThemeColor({}, 'accent');

    return (
        <View style={styles.container}>
            <Text variant="titleMedium" style={styles.stepTitle}>Location Details</Text>

            <LocationAutoFillBanner
                isVisible={isAutoFilled}
                onRefresh={getCurrentLocation}
            />

            <FormTextInput
                label="Street Address *"
                value={formData.street}
                onChangeText={(value) => onFormDataChange('street', value)}
                leftIcon="map-marker"
                placeholder="Enter your street address"
            />

            <View style={styles.row}>
                <FormTextInput
                    label="City *"
                    value={formData.city}
                    onChangeText={(value) => onFormDataChange('city', value)}
                    style={styles.halfInput}
                    placeholder="Enter your city"
                />
                <FormTextInput
                    label="State *"
                    value={formData.state}
                    onChangeText={(value) => onFormDataChange('state', value)}
                    style={styles.halfInput}
                    placeholder="Enter your state"
                />
            </View>

            <View style={styles.row}>
                <FormTextInput
                    label="Pincode *"
                    value={formData.pincode}
                    onChangeText={(value) => onFormDataChange('pincode', value)}
                    keyboardType="numeric"
                    style={styles.halfInput}
                    placeholder="Enter pincode"
                />
                <FormTextInput
                    label="Country"
                    value={formData.country}
                    onChangeText={(value) => onFormDataChange('country', value)}
                    style={styles.halfInput}
                    editable={false}
                />
            </View>

            {!formData.enableLocation && (
                <View style={styles.manualLocationSection}>
                    <Button
                        onPress={async () => {
                            const location = await getCurrentLocation();
                            if (location) {
                                onFormDataChange('enableLocation', true);
                            }
                        }}
                        variant="outlined"
                        size="medium"
                        loading={locationLoading}
                        fullWidth
                    >
                        Auto-fill Address from My Location
                    </Button>
                    <HelperText type="info" style={[styles.manualLocationHelper, { color: accentColor }]}>
                        We'll use your current location to auto-fill your address and enable location-based QR scanning
                    </HelperText>
                </View>
            )}

            {formData.enableLocation && (
                <View style={styles.locationSection}>
                    <View style={styles.checkboxContainer}>
                        <Checkbox.Android
                            status={formData.enableLocation ? 'checked' : 'unchecked'}
                            onPress={handleEnableLocationToggle}
                            color={accentColor}
                            disabled={locationLoading}
                        />
                        <View style={styles.locationLabelContainer}>
                            <Text variant="bodyMedium" style={styles.checkboxLabel}>
                                Enable Location-based QR scanning
                            </Text>
                            <Text variant="bodySmall" style={styles.locationDescription}>
                                Allow customers to find and scan your QR codes when they are nearby
                            </Text>
                        </View>
                    </View>

                    <View style={styles.locationDetails}>
                        {formData.latitude && formData.longitude ? (
                            <View style={styles.locationSaved}>
                                <Text variant="bodySmall" style={styles.locationSuccessText}>
                                    ✓ Location saved successfully
                                </Text>
                                <Text variant="bodySmall" style={styles.coordinatesText}>
                                    Lat: {formData.latitude.toFixed(6)}, Lng: {formData.longitude.toFixed(6)}
                                </Text>
                                <Button
                                    onPress={getCurrentLocation}
                                    variant="outlined"
                                    loading={locationLoading}
                                >
                                    Update Location
                                </Button>
                            </View>
                        ) : null}

                        <FormTextInput
                            label="Location Radius (meters)"
                            value={formData.locationRadius}
                            onChangeText={(value) => onFormDataChange('locationRadius', value)}
                            keyboardType="numeric"
                        />
                        <HelperText type='info' style={{ color: accentColor }}>
                            Customers must be within this distance to scan your QR codes (Recommended: 50-200 meters)
                        </HelperText>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: AppStyles.spacing.lg,
    },
    stepTitle: {
        marginBottom: AppStyles.spacing.md,
        fontWeight: '600',
    },
    row: {
        flexDirection: 'row',
        marginHorizontal: -4,
    },
    halfInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    manualLocationSection: {
        marginTop: AppStyles.spacing.lg,
        paddingTop: AppStyles.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    manualLocationHelper: {
        marginTop: AppStyles.spacing.sm,
        textAlign: 'center',
    },
    locationSection: {
        marginTop: AppStyles.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: AppStyles.spacing.md,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: AppStyles.spacing.md,
    },
    locationLabelContainer: {
        flex: 1,
        marginLeft: 8,
    },
    checkboxLabel: {
        marginLeft: 8,
        flex: 1,
    },
    locationDescription: {
        color: '#666',
        marginTop: 2,
    },
    locationDetails: {
        marginTop: AppStyles.spacing.md,
        paddingLeft: 32,
    },
    locationSaved: {
        backgroundColor: '#E8F5E8',
        padding: AppStyles.spacing.md,
        borderRadius: 8,
        marginBottom: AppStyles.spacing.md,
    },
    locationSuccessText: {
        color: '#2E7D32',
        fontWeight: '600',
        marginBottom: 4,
    },
    coordinatesText: {
        color: '#666',
        fontFamily: 'monospace',
        marginBottom: AppStyles.spacing.sm,
    },
});