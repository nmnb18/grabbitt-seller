import { Button } from "@/components/ui/paper-button";
import { useTheme } from "@/hooks/use-theme-color";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import React from "react";
import { FlatList, Modal, TouchableOpacity, View } from "react-native";
import {
    Chip,
    Divider,
    IconButton,
    Portal,
    Surface,
    Text,
    TextInput,
} from "react-native-paper";
import DatePicker from "react-native-ui-datepicker";

type Offer = {
    id: string;
    title: string;
    min_spend: number;
    terms?: string;
};

interface CopyOfferModalProps {
    visible: boolean;
    originalDate: string;
    dateMode: "single" | "range";
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    offers: Offer[];
    saving: boolean;
    onDateModeChange: (mode: "single" | "range") => void;
    onDateChange: (params: any) => void;
    onOfferUpdate: (index: number, field: keyof Offer, value: string | number) => void;
    onAddOffer: () => void;
    onRemoveOffer: (index: number) => void;
    onSave: () => void;
    onClose: () => void;
}

export function CopyOfferModal({
    visible,
    originalDate,
    dateMode,
    startDate,
    endDate,
    offers,
    saving,
    onDateModeChange,
    onDateChange,
    onOfferUpdate,
    onAddOffer,
    onRemoveOffer,
    onSave,
    onClose,
}: CopyOfferModalProps) {
    const theme = useTheme();

    return (
        <Portal>
            <Modal
                visible={visible}
                animationType="slide"
                transparent
                onRequestClose={onClose}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: "flex-end",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                >
                    <View
                        style={{
                            maxHeight: "90%",
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            padding: 20,
                            backgroundColor: theme.colors.surface,
                        }}
                    >
                        <FlatList
                            data={offers}
                            keyExtractor={(offer) => offer.id}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                            ListHeaderComponent={
                                <>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 16,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 20,
                                                fontWeight: "700",
                                                color: theme.colors.onSurface,
                                            }}
                                        >
                                            Copy Offer
                                        </Text>
                                        <IconButton
                                            icon="close"
                                            size={24}
                                            onPress={onClose}
                                        />
                                    </View>

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 8,
                                            padding: 12,
                                            borderRadius: 8,
                                            backgroundColor: theme.colors.surfaceVariant,
                                            marginBottom: 16,
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name="calendar-check"
                                            size={18}
                                            color={theme.colors.onSurfaceDisabled}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 13,
                                                color: theme.colors.onSurfaceDisabled,
                                            }}
                                        >
                                            Original: {dayjs(originalDate).format("DD MMM YYYY")}
                                        </Text>
                                    </View>

                                    <Text
                                        style={{
                                            fontSize: 15,
                                            fontWeight: "600",
                                            marginBottom: 12,
                                            color: theme.colors.onSurface,
                                        }}
                                    >
                                        Select New Date
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            gap: 10,
                                            marginBottom: 12,
                                        }}
                                    >
                                        <Chip
                                            selected={dateMode === "single"}
                                            onPress={() => onDateModeChange("single")}
                                            style={{
                                                flex: 1,
                                                backgroundColor:
                                                    dateMode === "single"
                                                        ? theme.colors.primary
                                                        : theme.colors.surfaceVariant,
                                            }}
                                            textStyle={{
                                                color:
                                                    dateMode === "single"
                                                        ? "#fff"
                                                        : theme.colors.onSurface,
                                            }}
                                        >
                                            Single Day
                                        </Chip>
                                        <Chip
                                            selected={dateMode === "range"}
                                            onPress={() => onDateModeChange("range")}
                                            style={{
                                                flex: 1,
                                                backgroundColor:
                                                    dateMode === "range"
                                                        ? theme.colors.primary
                                                        : theme.colors.surfaceVariant,
                                            }}
                                            textStyle={{
                                                color:
                                                    dateMode === "range"
                                                        ? "#fff"
                                                        : theme.colors.onSurface,
                                            }}
                                        >
                                            Date Range
                                        </Chip>
                                    </View>

                                    <DatePicker
                                        mode={dateMode}
                                        date={dateMode === "single" ? startDate : undefined}
                                        startDate={
                                            dateMode === "range" ? startDate : undefined
                                        }
                                        endDate={dateMode === "range" ? endDate : undefined}
                                        onChange={onDateChange}
                                        minDate={dayjs().add(1, "day")}
                                        style={{
                                            borderRadius: 12,
                                            marginBottom: 12,
                                            backgroundColor: theme.colors.surfaceVariant,
                                        }}
                                        styles={{
                                            day_label: { color: theme.colors.onSurface },
                                            weekday_label: {
                                                color: theme.colors.onSurface,
                                                fontWeight: "600",
                                            },
                                            year_selector_label: {
                                                color: theme.colors.onSurface,
                                            },
                                            month_selector_label: {
                                                color: theme.colors.onSurface,
                                            },
                                            disabled_label: {
                                                color: theme.colors.onSurfaceDisabled,
                                            },
                                            selected: {
                                                backgroundColor: theme.colors.primary,
                                                borderRadius: 8,
                                            },
                                            selected_label: { color: "#fff" },
                                            range_fill: {
                                                backgroundColor:
                                                    theme.colors.primary + "25",
                                            },
                                        }}
                                    />

                                    {/* <Surface
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            gap: 10,
                                            padding: 14,
                                            borderRadius: 10,
                                            backgroundColor:
                                                theme.colors.primaryContainer,
                                        }}
                                    >
                                        <MaterialCommunityIcons
                                            name="calendar-arrow-right"
                                            size={20}
                                            color={theme.colors.onPrimary}
                                        />
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                fontWeight: "600",
                                                color: theme.colors.onPrimary,
                                            }}
                                        >
                                            {dateMode === "range" &&
                                                !startDate.isSame(endDate, "day")
                                                ? `${startDate.format("DD MMM")} - ${endDate.format("DD MMM YYYY")}`
                                                : startDate.format("DD MMM YYYY")}
                                        </Text>
                                    </Surface> */}

                                    <Divider style={{ marginVertical: 16 }} />

                                    <Text
                                        style={{
                                            fontSize: 15,
                                            fontWeight: "600",
                                            marginBottom: 12,
                                            color: theme.colors.onSurface,
                                        }}
                                    >
                                        Edit Offers (2-10)
                                    </Text>
                                </>
                            }
                            renderItem={({ item: offer, index }) => (
                                <Surface
                                    style={{
                                        padding: 12,
                                        borderRadius: 12,
                                        marginBottom: 12,
                                        backgroundColor: theme.colors.surfaceVariant,
                                    }}
                                >
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            marginBottom: 8,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                fontWeight: "600",
                                                color: theme.colors.primary,
                                            }}
                                        >
                                            Offer {index + 1}
                                        </Text>
                                        {offers.length > 2 && (
                                            <IconButton
                                                icon="close-circle"
                                                size={20}
                                                iconColor={theme.colors.error}
                                                onPress={() => onRemoveOffer(index)}
                                            />
                                        )}
                                    </View>
                                    <TextInput
                                        label="Offer Title *"
                                        value={offer.title}
                                        onChangeText={(v) =>
                                            onOfferUpdate(index, "title", v)
                                        }
                                        mode="outlined"
                                        style={{ marginBottom: 8 }}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={
                                            theme.colors.onSurface
                                        }
                                        left={
                                            <TextInput.Icon
                                                icon="gift"
                                                color={theme.colors.onSurface}
                                            />
                                        }
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,
                                                onSurfaceVariant:
                                                    theme.colors.onSurface,
                                            },
                                        }}
                                    />
                                    <TextInput
                                        label="Min Spend (₹) *"
                                        value={
                                            offer.min_spend
                                                ? String(offer.min_spend)
                                                : ""
                                        }
                                        onChangeText={(v) =>
                                            onOfferUpdate(
                                                index,
                                                "min_spend",
                                                Number(v) || 0
                                            )
                                        }
                                        mode="outlined"
                                        keyboardType="numeric"
                                        style={{ marginBottom: 8 }}
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={
                                            theme.colors.onSurface
                                        }
                                        left={
                                            <TextInput.Icon
                                                icon="gift"
                                                color={theme.colors.onSurface}
                                            />
                                        }
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,
                                                onSurfaceVariant:
                                                    theme.colors.onSurface,
                                            },
                                        }}
                                    />
                                    <TextInput
                                        label="Terms (Optional)"
                                        value={offer.terms || ""}
                                        onChangeText={(v) =>
                                            onOfferUpdate(index, "terms", v)
                                        }
                                        mode="outlined"
                                        outlineColor={theme.colors.outline}
                                        activeOutlineColor={
                                            theme.colors.onSurface
                                        }
                                        left={
                                            <TextInput.Icon
                                                icon="gift"
                                                color={theme.colors.onSurface}
                                            />
                                        }
                                        theme={{
                                            colors: {
                                                primary: theme.colors.primary,
                                                onSurfaceVariant:
                                                    theme.colors.onSurface,
                                            },
                                        }}
                                        multiline
                                    />
                                </Surface>
                            )}
                            ListFooterComponent={
                                <>
                                    {offers.length < 10 && (
                                        <TouchableOpacity
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 8,
                                                paddingVertical: 12,
                                                borderRadius: 10,
                                                borderWidth: 1,
                                                borderStyle: "dashed",
                                                borderColor: theme.colors.primary,
                                                marginBottom: 16,
                                            }}
                                            onPress={onAddOffer}
                                        >
                                            <MaterialCommunityIcons
                                                name="plus"
                                                size={20}
                                                color={theme.colors.primary}
                                            />
                                            <Text
                                                style={{
                                                    color: theme.colors.primary,
                                                    fontWeight: "500",
                                                }}
                                            >
                                                Add Offer
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    <View
                                        style={{
                                            flexDirection: "row",
                                            marginTop: 8,
                                            marginBottom: 20,
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onPress={onClose}
                                            style={{ flex: 1 }}
                                        >
                                            Cancel
                                        </Button>
                                        <View style={{ width: 12 }} />
                                        <Button
                                            variant="contained"
                                            onPress={onSave}
                                            loading={saving}
                                            disabled={saving}
                                            style={{ flex: 1 }}
                                        >
                                            Save Copy
                                        </Button>
                                    </View>
                                </>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </Portal>
    );
}
