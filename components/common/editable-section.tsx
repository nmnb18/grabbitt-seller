/**
 * EditableSection Component
 * Reusable section with edit/view mode toggle
 * Used in profile, settings, and data entry screens
 */

import { useTheme } from "@/hooks/use-theme-color";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { Card, Divider, Button as PaperButton } from "react-native-paper";

interface EditableSectionProps {
    title: string;
    isEditing: boolean;
    isSaving?: boolean;
    isDirty?: boolean;
    onEditToggle: (editing: boolean) => void;
    onSave?: () => void;
    onCancel?: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    isLocked?: boolean;
}

export function EditableSection({
    title,
    isEditing,
    isSaving = false,
    isDirty = false,
    onEditToggle,
    onSave,
    onCancel,
    children,
    style,
    isLocked = false,
}: EditableSectionProps) {
    const theme = useTheme();

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }, style]}>
            <View style={{ position: "relative" }}>
                <Card.Content>
                    {/* Header */}
                    <View style={styles.sectionHeader}>
                        <Text
                            variant="titleMedium"
                            style={[styles.cardTitle, { color: theme.colors.onSurface }]}
                        >
                            {title}
                        </Text>

                        {!isEditing ? (
                            <PaperButton
                                mode="text"
                                onPress={() => !isLocked && onEditToggle(true)}
                                icon="pencil"
                                compact
                            >
                                Edit
                            </PaperButton>
                        ) : (
                            <View style={styles.editButtons}>
                                <PaperButton
                                    mode="text"
                                    onPress={() => {
                                        onCancel?.();
                                        onEditToggle(false);
                                    }}
                                    icon="close"
                                    disabled={isSaving}
                                    compact
                                >
                                    Cancel
                                </PaperButton>

                                <PaperButton
                                    mode="text"
                                    onPress={onSave}
                                    icon="content-save-outline"
                                    disabled={!isDirty || isSaving}
                                    loading={isSaving}
                                    compact
                                >
                                    Save
                                </PaperButton>
                            </View>
                        )}
                    </View>

                    <Divider
                        style={[
                            styles.divider,
                            { backgroundColor: theme.colors.outline },
                        ]}
                    />

                    {children}
                </Card.Content>
            </View>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    cardTitle: {
        flex: 1,
        fontWeight: "600",
    },
    editButtons: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    divider: {
        marginBottom: 16,
    },
});

// Import Text from react-native-paper at the top
import { Text } from "react-native-paper";
