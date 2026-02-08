import { EditableSection, FormRow, InfoRow } from '@/components/common';
import { FormTextInput } from '@/components/form/form-text-input';
import { useTheme } from '@/hooks/use-theme-color';
import { userApi as fbUserApi } from '@/services';
import { useAuthStore } from '@/store/authStore';
import React, { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { Chip } from 'react-native-paper';

export default function VerificationInformation() {
    const theme = useTheme();
    const user = useAuthStore((state) => state.user);
    const fetchUserDetails = useAuthStore((state) => state.fetchUserDetails);

    const uid = user?.uid;

    const profile = user?.user?.seller_profile?.verification;

    const [gst, setGst] = useState(profile?.gst_number || '');
    const [pan, setPan] = useState(profile?.pan_number || '');
    const [regNum, setRegNum] = useState(profile?.business_registration_number || '');

    const verificationStatus = profile?.status || 'pending';

    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const [initialState, setInitialState] = useState({
        gst,
        pan,
        regNum,
    });

    const isDirty = useMemo(() => {
        return (
            gst !== initialState.gst ||
            pan !== initialState.pan ||
            regNum !== initialState.regNum
        );
    }, [gst, pan, regNum, initialState]);

    const handleCancel = () => {
        setGst(initialState.gst);
        setPan(initialState.pan);
        setRegNum(initialState.regNum);
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            await fbUserApi.updateSellerProfile('verification', {
                gst_number: gst || null,
                pan_number: pan || null,
                business_registration_number: regNum || null,
            } as any);

            if (uid) await fetchUserDetails(uid, 'seller');

            setInitialState({ gst, pan, regNum });
            setIsEditing(false);

            Alert.alert('Success', 'Verification details updated.');
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update verification info.');
        } finally {
            setSaving(false);
        }
    };

    // THEME-BASED STATUS COLORS
    const statusColor =
        verificationStatus === "approved"
            ? theme.colors.success
            : verificationStatus === "rejected"
                ? theme.colors.error
                : theme.colors.warning;

    return (
        <EditableSection
            title="✅ Verification Details"
            isEditing={isEditing}
            onEditToggle={setIsEditing}
            isDirty={isDirty}
            isSaving={saving}
            onSave={handleSave}
            onCancel={handleCancel}
        >
            {/* STATUS CHIP */}
            <View style={{ marginBottom: 16 }}>
                <Chip
                    style={{
                        alignSelf: "flex-start",
                        backgroundColor: statusColor + "22"
                    }}
                    textStyle={{
                        color: statusColor,
                        fontWeight: "600"
                    }}
                    icon={
                        verificationStatus === "approved"
                            ? "check-decagram"
                            : "shield-alert"
                    }
                >
                    {verificationStatus === "approved"
                        ? "Verified"
                        : verificationStatus === "rejected"
                            ? "Rejected"
                            : "Pending Verification"}
                </Chip>
            </View>

            {!isEditing ? (
                <>
                    <InfoRow label="GST Number" value={gst || "—"} />
                    <InfoRow label="PAN Number" value={pan || "—"} />
                    <InfoRow label="Business Registration No." value={regNum || "—"} />
                </>
            ) : (
                <>
                    <FormRow>
                        <FormTextInput
                            label="GST Number"
                            value={gst}
                            onChangeText={setGst}
                            leftIcon="card-account-details-outline"
                        />
                    </FormRow>
                    <FormRow>
                        <FormTextInput
                            label="PAN Number"
                            value={pan}
                            onChangeText={setPan}
                            leftIcon="card-bulleted"
                        />
                    </FormRow>
                    <FormRow>
                        <FormTextInput
                            label="Business Registration Number"
                            value={regNum}
                            onChangeText={setRegNum}
                            leftIcon="file-document-outline"
                        />
                    </FormRow>
                </>
            )}
        </EditableSection>
    );
}
