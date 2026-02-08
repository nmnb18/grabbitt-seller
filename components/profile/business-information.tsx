import { EditableSection, InfoRow } from '@/components/common';
import { BusinessInfoForm } from '@/components/form/business-info-form';
import { userApi as fbUserApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import React, { useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { LockedOverlay } from '../shared/locked-overlay';

export default function BusinessInformation() {
    const user = useAuthStore((state) => state.user);
    const fetchUserDetails = useAuthStore((state) => state.fetchUserDetails);

    const uid = user?.uid;

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
        try {
            setSaving(true);

            await fbUserApi.updateSellerProfile('business', {
                shop_name: shopName,
                business_type: businessType,
                category,
                description,
            } as any);

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

    return (
        <EditableSection
            title="🏪 Business Information"
            isEditing={isEditing}
            onEditToggle={setIsEditing}
            isDirty={isDirty}
            isSaving={saving}
            onSave={handleSave}
            onCancel={handleCancel}
        >
            {isEditing ? (
                <BusinessInfoForm
                    mode="edit"
                    shopName={shopName}
                    businessType={businessType}
                    category={category}
                    description={description}
                    showTitle={false}
                    showEstablishedYear={false}
                    isDirty={isDirty}
                    isSaving={saving}
                    onShopNameChange={setShopName}
                    onBusinessTypeChange={setBusinessType}
                    onCategoryChange={setCategory}
                    onDescriptionChange={setDescription}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            ) : (
                <>
                    <InfoRow label="Shop Name" value={shopName} />
                    <InfoRow label="Business Type" value={businessType} />
                    <InfoRow label="Category" value={category} />
                    <InfoRow label="Description" value={description || "—"} />
                </>
            )}

            {isFree && (
                <LockedOverlay message="Business Information cannot be edited on the Free plan." />
            )}
        </EditableSection>
    );
}
