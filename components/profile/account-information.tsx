import { EditableSection, FormRow, InfoRow } from "@/components/common";
import { FormTextInput } from "@/components/form/form-text-input";
import { userApi as fbUserApi } from '@/services';
import { useAuthStore } from "@/store/authStore";
import React, { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

export default function AccountInformation({
  onOpenChangePassword,
}: {
  onOpenChangePassword: () => void;
}) {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const fetchUserDetails = useAuthStore((state) => state.fetchUserDetails);

  const uid = user?.uid;

  const profile = user?.user?.seller_profile?.account;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(profile?.name || "");
  const [email] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [establishedYear, setEstablishedYear] = useState(
    profile?.established_year ? String(profile.established_year) : ""
  );

  const [initial, setInitial] = useState({ name, phone, establishedYear });

  const isDirty = useMemo(
    () =>
      name !== initial.name ||
      phone !== initial.phone ||
      establishedYear !== initial.establishedYear,
    [name, phone, establishedYear, initial]
  );

  const handleCancel = () => {
    setName(initial.name);
    setPhone(initial.phone);
    setEstablishedYear(initial.establishedYear);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!name) return Alert.alert("Validation", "Full name is required");
    //if (!phone) return Alert.alert("Validation", "Phone number is required");

    try {
      setSaving(true);

      await fbUserApi.updateSellerProfile('account', {
        name,
        phone,
        established_year: establishedYear ? Number(establishedYear) : null,
      } as any);

      if (uid) await fetchUserDetails(uid, "seller");
      setInitial({ name, phone, establishedYear });
      setIsEditing(false);

      Alert.alert("Success", "Account information updated.");
    } catch (err: any) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
      <EditableSection
        title="👤 Account Information"
        isEditing={isEditing}
        onEditToggle={setIsEditing}
        isDirty={isDirty}
        isSaving={saving}
        onSave={handleSave}
        onCancel={handleCancel}
      >
        {!isEditing ? (
          <>
            <InfoRow label="Full Name" value={name || "—"} />
            <InfoRow label="Email" value={email || "—"} />
            <InfoRow label="Phone" value={phone || "—"} />
            <InfoRow label="Established Year" value={establishedYear || "—"} />
            <View style={{ marginTop: 20 }}>
              <Button
                mode="text"
                icon="lock-reset"
                onPress={onOpenChangePassword}
              >
                Change Password
              </Button>
            </View>
          </>
        ) : (
          <>
            <FormRow>
              <FormTextInput
                label="Full Name *"
                value={name}
                onChangeText={setName}
                leftIcon="account"
              />
            </FormRow>
            <FormRow>
              <FormTextInput
                label="Email (read only)"
                value={email}
                editable={false}
                leftIcon="email"
              />
            </FormRow>
            <FormRow>
              <FormTextInput
                label="Phone *"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon="phone"
              />
            </FormRow>
            <FormRow>
              <FormTextInput
                label="Established Year"
                value={establishedYear}
                onChangeText={setEstablishedYear}
                keyboardType="numeric"
                leftIcon="calendar"
              />
            </FormRow>
          </>
        )}
      </EditableSection>
    </View>
  );
}

