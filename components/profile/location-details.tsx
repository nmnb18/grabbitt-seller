import { EditableSection, FormRow, InfoRow } from '@/components/common';
import { FormTextInput } from '@/components/form/form-text-input';
import { useTheme } from '@/hooks/use-theme-color';
import { userApi as fbUserApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import * as Location from 'expo-location';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Button } from 'react-native-paper';
import { LockedOverlay } from '../shared/locked-overlay';

export default function LocationInformation() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const fetchUserDetails = useAuthStore((state) => state.fetchUserDetails);

    const uid = user?.uid;
    const profile = user?.user?.seller_profile?.location;

    const subscriptionTier = user?.user?.seller_profile?.subscription.tier || "free";
    const isFree = subscriptionTier === "free";

    // Address values
    const [street, setStreet] = useState(profile?.address?.street || "");
    const [city, setCity] = useState(profile?.address?.city || "");
    const [stateName, setStateName] = useState(profile?.address?.state || "");
    const [pincode, setPincode] = useState(profile?.address?.pincode || "");
    const [country] = useState(profile?.address?.country || "India");

    const [lat, setLat] = useState(profile?.lat ?? null);
    const [lng, setLng] = useState(profile?.lng ?? null);

    const [radius, setRadius] = useState(
        profile?.radius_meters ? String(profile.radius_meters) : "100"
    );

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [locBusy, setLocBusy] = useState(false);

    // Initial state for cancel
    const [initial, setInitial] = useState({
        street,
        city,
        stateName,
        pincode,
        radius,
        lat,
        lng,
    });

    const isDirty = useMemo(() => {
        return (
            street !== initial.street ||
            city !== initial.city ||
            stateName !== initial.stateName ||
            pincode !== initial.pincode ||
            radius !== initial.radius ||
            lat !== initial.lat ||
            lng !== initial.lng
        );
    }, [street, city, stateName, pincode, radius, lat, lng, initial]);

    const handleCancel = () => {
        setStreet(initial.street);
        setCity(initial.city);
        setStateName(initial.stateName);
        setPincode(initial.pincode);
        setRadius(initial.radius);
        setLat(initial.lat);
        setLng(initial.lng);
        setIsEditing(false);
    };

    // Reverse geocode helper
    const reverseGeocode = async (latitude: number, longitude: number) => {
        try {
            const res = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (res.length > 0) {
                const addr = res[0];
                setStreet(addr.street || addr.name || "");
                setCity(addr.city || addr.subregion || "");
                setStateName(addr.region || "");
                setPincode(addr.postalCode || "");
            }
        } catch (err) {
            console.error("Reverse geocode failed", err);
        }
    };

    // Fetch GPS location
    const fetchCurrentLocation = async () => {
        try {
            setLocBusy(true);

            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Required", "Location access must be enabled.");
                return;
            }

            const pos = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setLat(pos.coords.latitude);
            setLng(pos.coords.longitude);

            await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch current location.");
        } finally {
            setLocBusy(false);
        }
    };

    const handleSave = async () => {
        if (!street || !city || !stateName || !pincode) {
            return Alert.alert("Validation", "All address fields are required.");
        }

        try {
            setSaving(true);

            await fbUserApi.updateSellerProfile('location', {
                address: {
                    street,
                    city,
                    state: stateName,
                    pincode,
                    country,
                },
                lat,
                lng,
                radius_meters: Number(radius),
            } as any);

            if (uid) await fetchUserDetails(uid, "seller");

            setInitial({
                street,
                city,
                stateName,
                pincode,
                radius,
                lat,
                lng,
            });

            setIsEditing(false);
            Alert.alert("Success", "Location updated successfully.");
        } catch (err: any) {
            Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to update location."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <EditableSection
            title="📍 Location Information"
            isEditing={isEditing}
            onEditToggle={setIsEditing}
            isDirty={isDirty}
            isSaving={saving}
            onSave={handleSave}
            onCancel={handleCancel}
        >
            {!isEditing ? (
                <>
                    <InfoRow label="Address" value={`${street}, ${city}, ${stateName}, ${pincode}`} />
                    <InfoRow label="Latitude" value={lat ?? "—"} />
                    <InfoRow label="Longitude" value={lng ?? "—"} />
                    <InfoRow label="Radius (meters)" value={radius} />
                </>
            ) : (
                <>
                    <FormRow>
                        <FormTextInput
                            label="Street"
                            value={street}
                            onChangeText={setStreet}
                            leftIcon="map-marker"
                        />
                    </FormRow>

                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                        <View style={{ flex: 1 }}>
                            <FormTextInput
                                label="City"
                                value={city}
                                onChangeText={setCity}
                                leftIcon="city"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormTextInput
                                label="State"
                                value={stateName}
                                onChangeText={setStateName}
                                leftIcon="home-map-marker"
                            />
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                        <View style={{ flex: 1 }}>
                            <FormTextInput
                                label="Pincode"
                                value={pincode}
                                onChangeText={setPincode}
                                keyboardType="numeric"
                                leftIcon="mailbox"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <FormTextInput
                                label="Country"
                                value={country}
                                editable={false}
                                leftIcon="earth"
                            />
                        </View>
                    </View>

                    <Button
                        mode="outlined"
                        icon="crosshairs-gps"
                        onPress={fetchCurrentLocation}
                        loading={locBusy}
                        style={{ marginBottom: 12 }}
                    >
                        Use Current Location
                    </Button>

                    <FormRow>
                        <FormTextInput
                            label="Radius (meters)"
                            value={radius}
                            onChangeText={setRadius}
                            keyboardType="numeric"
                            leftIcon="radius"
                        />
                    </FormRow>
                </>
            )}
            {isFree && (
                <LockedOverlay message="Location Information cannot be edited on the Free plan." />
            )}
        </EditableSection>
    );
}
