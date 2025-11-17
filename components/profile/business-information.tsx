import { useTheme } from '@/hooks/use-theme-color';
import api from '@/services/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { BUSINESS_TYPES, CATEGORIES } from '@/utils/constant';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import {
    Button,
    Card,
    Chip,
    Divider,
    Text,
    TextInput,
} from 'react-native-paper';
import { LockedOverlay } from '../shared/locked-overlay';

export default function BusinessInformation() {
    const theme = useTheme();
    const { user, fetchUserDetails } = useAuthStore();

    const uid = user?.uid;
    const idToken = user?.idToken;

    const profile = user?.user?.seller_profile?.business;
    const subscriptionTier = user?.user?.seller_profile?.subscription.tier || "free";
    const isFree = subscriptionTier === "free";

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [shopName, setShopName] = useState(profile?.shop_name || "");
    const [businessType, setBusinessType] = useState(profile?.business_type || "");
    const [category, setCategory] = useState(profile?.category || "");
    const [description, setDescription] = useState(profile?.description || "");

    const [initialState, setInitialState] = useState({
        shopName,
        businessType,
        category,
        description,
    });

    const isDirty = useMemo(() => {
        return (
            shopName !== initialState.shopName ||
            businessType !== initialState.businessType ||
            category !== initialState.category ||
            description !== initialState.description
        );
    }, [shopName, businessType, category, description, initialState]);

    const handleCancel = () => {
        setShopName(initialState.shopName);
        setBusinessType(initialState.businessType);
        setCategory(initialState.category);
        setDescription(initialState.description);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!shopName) return Alert.alert("Validation", "Shop name is required");
        if (!businessType) return Alert.alert("Validation", "Business type is required");
        if (!category) return Alert.alert("Validation", "Category is required");

        try {
            setSaving(true);

            await api.patch(
                "/updateSellerProfile",
                {
                    section: "business",
                    data: {
                        shop_name: shopName,
                        business_type: businessType,
                        category,
                        description,
                    },
                },
                { headers: { Authorization: `Bearer ${idToken}` } }
            );

            if (uid) await fetchUserDetails(uid, "seller");

            setInitialState({ shopName, businessType, category, description });
            setIsEditing(false);

            Alert.alert("Success", "Business information updated.");
        } catch (err: any) {
            Alert.alert("Error", err.response?.data?.message || "Failed to update business info.");
        } finally {
            setSaving(false);
        }
    };

    const availableCategories =
        businessType ? CATEGORIES[businessType as keyof typeof CATEGORIES] || [] : [];

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={{ position: "relative" }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text
                            variant="titleMedium"
                            style={[styles.cardTitle, { color: theme.colors.onSurface }]}
                        >
                            🏪 Business Information
                        </Text>

                        {!isEditing ? (
                            <Button
                                mode="text"
                                onPress={() => !isFree && setIsEditing(true)}
                                icon="pencil"
                                compact
                            >
                                Edit
                            </Button>
                        ) : (
                            <View style={styles.editButtons}>
                                <Button
                                    mode="text"
                                    onPress={handleCancel}
                                    icon="close"
                                    disabled={saving}
                                    compact
                                >
                                    Cancel
                                </Button>

                                <Button
                                    mode="text"
                                    onPress={handleSave}
                                    icon="content-save-outline"
                                    disabled={!isDirty || saving}
                                    loading={saving}
                                    compact
                                >
                                    Save
                                </Button>
                            </View>
                        )}
                    </View>

                    <Divider
                        style={[
                            styles.divider,
                            { backgroundColor: theme.colors.outline },
                        ]}
                    />

                    {/* VIEW MODE */}
                    {!isEditing ? (
                        <View>
                            {[
                                { label: "Shop Name", value: shopName },
                                { label: "Business Type", value: businessType },
                                { label: "Category", value: category },
                                { label: "Description", value: description },
                            ].map((row) => (
                                <View
                                    key={row.label}
                                    style={[
                                        styles.infoRow,
                                        { borderBottomColor: theme.colors.outline },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.infoLabel,
                                            { color: theme.colors.onSurfaceDisabled },
                                        ]}
                                    >
                                        {row.label}
                                    </Text>
                                    <Text
                                        style={[
                                            styles.infoValue,
                                            { color: theme.colors.onSurface },
                                        ]}
                                    >
                                        {row.value || "—"}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    ) : (
                        /* EDIT MODE */
                        <View>
                            {/* Shop Name */}
                            <TextInput
                                label="Shop Name *"
                                value={shopName}
                                onChangeText={setShopName}
                                mode="outlined"
                                style={styles.input}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.onSurface}
                                left={<TextInput.Icon icon="store" color={theme.colors.onSurface} />}
                                theme={{
                                    colors: {
                                        primary: theme.colors.primary,      // focused label color
                                        onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                    },
                                }}
                            />

                            {/* Business Type */}
                            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                                Business Type *
                            </Text>
                            <View style={styles.wrapRow}>
                                {BUSINESS_TYPES.map((bt) => {
                                    const selected = businessType === bt.value;
                                    return (
                                        <Chip
                                            key={bt.value}
                                            selected={selected}
                                            onPress={() => {
                                                setBusinessType(bt.value);
                                                setCategory("");
                                            }}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: selected
                                                        ? theme.colors.primary
                                                        : theme.colors.surfaceVariant,
                                                },
                                            ]}
                                            textStyle={{
                                                color: selected
                                                    ? theme.colors.onPrimary
                                                    : theme.colors.onSurface,
                                            }}
                                        >
                                            {bt.label}
                                        </Chip>
                                    );
                                })}
                            </View>

                            {/* Category */}
                            <Text style={[styles.label, { color: theme.colors.onSurface }]}>
                                Category *
                            </Text>
                            <View style={styles.wrapRow}>
                                {availableCategories.map((cat) => {
                                    const selected =
                                        category.toLowerCase() === cat.toLowerCase();
                                    return (
                                        <Chip
                                            key={cat}
                                            selected={selected}
                                            onPress={() => setCategory(cat)}
                                            style={[
                                                styles.chip,
                                                {
                                                    backgroundColor: selected
                                                        ? theme.colors.primary
                                                        : theme.colors.surfaceVariant,
                                                },
                                            ]}
                                            textStyle={{
                                                color: selected
                                                    ? theme.colors.onPrimary
                                                    : theme.colors.onSurface,
                                            }}
                                        >
                                            {cat}
                                        </Chip>
                                    );
                                })}
                            </View>

                            {/* Description */}
                            <TextInput
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                mode="outlined"
                                multiline
                                numberOfLines={3}
                                style={styles.input}
                                outlineColor={theme.colors.outline}
                                activeOutlineColor={theme.colors.onSurface}
                                left={<TextInput.Icon icon="text" color={theme.colors.onSurface} />}
                                theme={{
                                    colors: {
                                        primary: theme.colors.primary,      // focused label color
                                        onSurfaceVariant: theme.colors.onSurface, // unfocused label color
                                    },
                                }}
                            />
                        </View>
                    )}
                </Card.Content>

                {/* Saving Overlay */}
                {saving && (
                    <View
                        style={[
                            styles.overlay,
                            {
                                backgroundColor: theme.dark
                                    ? "rgba(0,0,0,0.5)"
                                    : "rgba(255,255,255,0.7)",
                            },
                        ]}
                    >
                        <ActivityIndicator
                            size="large"
                            color={theme.colors.primary}
                        />
                        <Text
                            style={[
                                styles.overlayText,
                                { color: theme.colors.onSurface },
                            ]}
                        >
                            Saving…
                        </Text>
                    </View>
                )}

                {/* FREE PLAN LOCK */}
                {isFree && (
                    <LockedOverlay message="Business Information cannot be edited on the Free plan." />
                )}
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginBottom: 16,
        borderRadius: 16,
        paddingVertical: 12,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
    },
    editButtons: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    cardTitle: {
        fontWeight: "600",
        marginBottom: 12,
    },
    divider: {
        marginBottom: 16,
        height: 1,
    },
    infoRow: {
        paddingVertical: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        borderBottomWidth: 0.5,
    },
    infoLabel: {
        fontSize: 14,
    },
    infoValue: {
        fontWeight: "600",
        textTransform: "capitalize",
    },
    input: {
        marginBottom: 12,
    },
    label: {
        marginBottom: 6,
        fontWeight: "500",
    },
    wrapRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        borderRadius: 12,
    },
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
    overlayText: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: "500",
    },
});
