/**
 * DateSelector Component
 * Reusable date selection for offer screens
 * Used by: offer-add.tsx
 */

import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { Card, HelperText, Text } from "react-native-paper";
import DatePicker from "react-native-ui-datepicker";

interface DateSelectorProps {
    dateMode: "single" | "range";
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    onDateModeChange: (mode: "single" | "range") => void;
    onDateChange: (params: any) => void;
    error?: string;
    isEditMode?: boolean;
    readOnly?: boolean;
}

export function DateSelector({
    dateMode,
    startDate,
    endDate,
    onDateModeChange,
    onDateChange,
    error,
    isEditMode = false,
    readOnly = false,
}: DateSelectorProps) {
    const theme = useTheme();
    const [showDatePicker, setShowDatePicker] = useState(!isEditMode);

    const getDateDisplayText = () => {
        if (dateMode === "range" && !startDate.isSame(endDate, "day")) {
            return `${startDate.format("DD MMM")} - ${endDate.format("DD MMM YYYY")}`;
        }
        return startDate.format("ddd, DD MMM YYYY");
    };

    const getDateCount = () => {
        if (dateMode !== "range" || startDate.isSame(endDate, "day")) return 1;
        return endDate.diff(startDate, "day") + 1;
    };

    return (
        <Card style={{ borderRadius: 16, marginBottom: 16, backgroundColor: theme.colors.surface }}>
            <Card.Content>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <MaterialCommunityIcons name="calendar" size={22} color={theme.colors.primary} />
                    <Text style={{ fontSize: 17, fontWeight: "600", color: theme.colors.onSurface }}>
                        Select Date
                    </Text>
                </View>

                {!readOnly && !isEditMode && (
                    <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                        <TouchableOpacity
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                paddingVertical: 12,
                                borderRadius: 10,
                                backgroundColor:
                                    dateMode === "single" ? theme.colors.primary : theme.colors.surfaceVariant,
                            }}
                            onPress={() => onDateModeChange("single")}
                        >
                            <MaterialCommunityIcons
                                name="calendar"
                                size={18}
                                color={dateMode === "single" ? "#fff" : theme.colors.onSurface}
                            />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: dateMode === "single" ? "#fff" : theme.colors.onSurface,
                                }}
                            >
                                Single Day
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{
                                flex: 1,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 8,
                                paddingVertical: 12,
                                borderRadius: 10,
                                backgroundColor:
                                    dateMode === "range" ? theme.colors.primary : theme.colors.surfaceVariant,
                            }}
                            onPress={() => onDateModeChange("range")}
                        >
                            <MaterialCommunityIcons
                                name="calendar-range"
                                size={18}
                                color={dateMode === "range" ? "#fff" : theme.colors.onSurface}
                            />
                            <Text
                                style={{
                                    fontSize: 14,
                                    fontWeight: "600",
                                    color: dateMode === "range" ? "#fff" : theme.colors.onSurface,
                                }}
                            >
                                Date Range
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={{
                        borderWidth: 2,
                        borderRadius: 12,
                        padding: 14,
                        marginBottom: 8,
                        borderColor: error ? theme.colors.error : theme.colors.primary,
                    }}
                    onPress={() => !readOnly && !isEditMode && setShowDatePicker(!showDatePicker)}
                    disabled={readOnly || isEditMode}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <MaterialCommunityIcons
                            name="calendar-check"
                            size={22}
                            color={error ? theme.colors.error : theme.colors.primary}
                        />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontSize: 16, fontWeight: "600", color: theme.colors.onSurface }}>
                                {getDateDisplayText()}
                            </Text>
                            {dateMode === "range" && getDateCount() > 1 && (
                                <Text style={{ fontSize: 12, marginTop: 2, color: theme.colors.primary }}>
                                    {getDateCount()} days selected
                                </Text>
                            )}
                        </View>
                        {!readOnly && !isEditMode && (
                            <MaterialCommunityIcons
                                name={showDatePicker ? "chevron-up" : "chevron-down"}
                                size={24}
                                color={theme.colors.onSurfaceDisabled}
                            />
                        )}
                    </View>
                </TouchableOpacity>

                {error && <HelperText type="error" visible>{error}</HelperText>}

                {isEditMode && (
                    <HelperText type="info" visible style={{ color: theme.colors.onSurfaceDisabled }}>
                        Date cannot be changed in edit mode
                    </HelperText>
                )}

                {showDatePicker && !readOnly && !isEditMode && (
                    <DatePicker
                        mode={dateMode}
                        date={dateMode === "single" ? startDate : undefined}
                        startDate={dateMode === "range" ? startDate : undefined}
                        endDate={dateMode === "range" ? endDate : undefined}
                        onChange={onDateChange}
                        minDate={dayjs().add(1, "day")}
                        style={{
                            borderRadius: 12,
                            marginVertical: 12,
                            backgroundColor: theme.colors.surfaceVariant,
                        }}
                        styles={{
                            day_label: { color: theme.colors.onSurface },
                            weekday_label: { color: theme.colors.onSurface, fontWeight: "600" },
                            year_selector_label: { color: theme.colors.onSurface },
                            month_selector_label: { color: theme.colors.onSurface },
                            disabled_label: { color: theme.colors.onSurfaceDisabled },
                            selected: { backgroundColor: theme.colors.primary, borderRadius: 8 },
                            selected_label: { color: "#fff" },
                            range_fill: { backgroundColor: theme.colors.primary + "25" },
                        }}
                    />
                )}

                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        padding: 12,
                        borderRadius: 10,
                        marginTop: 8,
                        backgroundColor: theme.colors.primaryContainer + "40",
                    }}
                >
                    <MaterialCommunityIcons name="information" size={18} color={theme.colors.primary} />
                    <Text style={{ fontSize: 12, flex: 1, color: theme.colors.primary }}>
                        You can only create offers for future dates (tomorrow onwards)
                    </Text>
                </View>
            </Card.Content>
        </Card>
    );
}
