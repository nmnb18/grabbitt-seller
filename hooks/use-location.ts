import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { FormField, SellerFormData } from './use-seller-registration';

interface LocationHookProps {
    formData: SellerFormData;
    updateFormData: (field: FormField, value: any) => void;
}

export const useLocation = ({ formData, updateFormData }: LocationHookProps) => {
    const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [isAutoFilled, setIsAutoFilled] = useState(false);

    useEffect(() => {
        checkLocationPermission();
    }, []);

    const checkLocationPermission = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            setLocationPermission(status);
        } catch (error) {
            console.error('Error checking location permission:', error);
        }
    };

    const requestLocationPermission = async (): Promise<boolean> => {
        try {
            setLocationLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(status);

            if (status !== 'granted') {
                Alert.alert(
                    'Location Permission Required',
                    'Location access is needed to enable location-based QR code scanning and auto-fill your address.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Open Settings', onPress: () => Location.getForegroundPermissionsAsync() }
                    ]
                );
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error requesting location permission:', error);
            Alert.alert('Error', 'Failed to request location permission');
            return false;
        } finally {
            setLocationLoading(false);
        }
    };

    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const geocodedAddress = await Location.reverseGeocodeAsync({
                latitude,
                longitude
            });

            if (geocodedAddress && geocodedAddress.length > 0) {
                const address = geocodedAddress[0];

                updateFormData('street', address.street || `${address.name || ''} ${address.streetNumber || ''}`.trim());
                updateFormData('city', address.city || address.subregion || '');
                updateFormData('state', address.region || '');
                updateFormData('pincode', address.postalCode || '');
                updateFormData('country', address.country || 'India');

                setIsAutoFilled(true);

                Alert.alert(
                    'Address Auto-filled',
                    'We\'ve auto-filled your address based on your location. Please review and edit if needed.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            Alert.alert(
                'Auto-fill Warning',
                'We got your location but could not auto-fill the address. Please enter your address manually.'
            );
        }
    };

    const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number } | null> => {
        try {
            setLocationLoading(true);

            if (locationPermission !== 'granted') {
                const hasPermission = await requestLocationPermission();
                if (!hasPermission) return null;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 15000,
            });

            const { latitude, longitude } = location.coords;

            updateFormData('latitude', latitude);
            updateFormData('longitude', longitude);

            await reverseGeocode(latitude, longitude);

            return { latitude, longitude };
        } catch (error: any) {
            console.error('Error getting location:', error);

            let errorMessage = 'Failed to get current location';
            if (error.code === 'CANCELLED') {
                errorMessage = 'Location request was cancelled';
            } else if (error.code === 'UNAVAILABLE') {
                errorMessage = 'Location services are not available';
            } else if (error.code === 'TIMEOUT') {
                errorMessage = 'Location request timed out. Please try again';
            }

            Alert.alert('Location Error', errorMessage);
            return null;
        } finally {
            setLocationLoading(false);
        }
    };

    const handleEnableLocationToggle = async () => {
        const newEnableLocation = !formData.enableLocation;

        if (newEnableLocation) {
            const location = await getCurrentLocation();
            if (location) {
                updateFormData('enableLocation', true);
            } else {
                updateFormData('enableLocation', false);
            }
        } else {
            updateFormData('enableLocation', false);
            updateFormData('latitude', null);
            updateFormData('longitude', null);
        }
    };

    return {
        locationPermission,
        locationLoading,
        isAutoFilled,
        getCurrentLocation,
        handleEnableLocationToggle,
        setIsAutoFilled
    };
};