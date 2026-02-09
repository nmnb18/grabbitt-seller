import { AppStyles } from "@/utils/theme";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { BusinessTypeSelector } from "../form/business-type-selector";
import { FormTextInput } from "../form/form-text-input";

interface BusinessInfoFormProps {
    // Form data
    shopName: string;
    businessType: string;
    category: string;
    description: string;
    establishedYear?: string;

    // Handlers
    onShopNameChange: (value: string) => void;
    onBusinessTypeChange: (value: string) => void;
    onCategoryChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onEstablishedYearChange?: (value: string) => void;

    // UI Options
    mode?: "step" | "edit"; // 'step' for registration, 'edit' for profile
    showTitle?: boolean;
    showEstablishedYear?: boolean;
    isDirty?: boolean;
    isSaving?: boolean;

    // Edit mode handlers
    onSave?: () => Promise<void>;
    onCancel?: () => void;
}

export const BusinessInfoForm: React.FC<BusinessInfoFormProps> = ({
    shopName,
    businessType,
    category,
    description,
    establishedYear = "",
    onShopNameChange,
    onBusinessTypeChange,
    onCategoryChange,
    onDescriptionChange,
    onEstablishedYearChange,
    mode = "step",
    showTitle = true,
    showEstablishedYear = true,
    isDirty = false,
    isSaving = false,
    onSave,
    onCancel,
}) => {
    const isEditMode = mode === "edit";

    const handleSaveClick = async () => {
        if (!shopName || !businessType || !category) {
            Alert.alert("Validation", "Please fill all required fields");
            return;
        }
        await onSave?.();
    };

    return (
        <View style={styles.container}>
            {showTitle && (
                <Text
                    variant="titleMedium"
                    style={[
                        styles.title,
                        isEditMode && { marginBottom: AppStyles.spacing.md },
                    ]}
                >
                    {isEditMode ? "Business Information" : "Business Information"}
                </Text>
            )}

            <FormTextInput
                label="Shop/Business Name *"
                value={shopName}
                onChangeText={onShopNameChange}
                autoCapitalize="words"
                leftIcon="store"
            />

            <BusinessTypeSelector
                businessType={businessType}
                category={category}
                onBusinessTypeChange={(value) => {
                    onBusinessTypeChange(value);
                    onCategoryChange("");
                }}
                onCategoryChange={onCategoryChange}
            />

            <FormTextInput
                label="Business Description *"
                value={description}
                onChangeText={onDescriptionChange}
                multiline
                numberOfLines={3}
            />

            {showEstablishedYear && (
                <FormTextInput
                    label="Established Year (Optional)"
                    value={establishedYear}
                    onChangeText={(value) => onEstablishedYearChange?.(value)}
                    keyboardType="numeric"
                    leftIcon="calendar"
                />
            )}

            {isEditMode && (
                <View style={styles.actionButtonsContainer}>
                    <Button
                        mode="outlined"
                        style={styles.cancelButton}
                        onPress={onCancel}
                        disabled={isSaving}
                    >
                        Cancel
                    </Button>
                    <Button
                        mode="contained"
                        style={styles.saveButton}
                        onPress={handleSaveClick}
                        loading={isSaving}
                        disabled={!isDirty || isSaving}
                    >
                        Save Changes
                    </Button>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: AppStyles.spacing.lg,
    },
    title: {
        marginBottom: AppStyles.spacing.md,
        fontWeight: "600",
    },
    actionButtonsContainer: {
        flexDirection: "row",
        gap: 12,
        marginTop: AppStyles.spacing.lg,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});

export default BusinessInfoForm;
