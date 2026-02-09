/**
 * useCopyOfferModal Hook
 * Manages copy offer modal state and logic
 * Used by: whats-new-home.tsx
 */

import { offersApi } from "@/services";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { Offer, OfferDoc } from "./useOffers";

interface UseCopyOfferModalReturn {
    copyModalVisible: boolean;
    copyingOffer: OfferDoc | null;
    copyDateMode: "single" | "range";
    copyStartDate: dayjs.Dayjs;
    copyEndDate: dayjs.Dayjs;
    copyOffers: Offer[];
    savingCopy: boolean;
    openCopyModal: (offerDoc: OfferDoc) => void;
    closeCopyModal: () => void;
    setCopyDateMode: (mode: "single" | "range") => void;
    handleCopyDateChange: (params: any) => void;
    updateCopyOffer: (index: number, field: keyof Offer, value: string | number) => void;
    addCopyOffer: () => void;
    removeCopyOffer: (index: number) => void;
    saveCopiedOffer: (onSuccess: () => void) => Promise<void>;
}

export function useCopyOfferModal(): UseCopyOfferModalReturn {
    const [copyModalVisible, setCopyModalVisible] = useState(false);
    const [copyingOffer, setCopyingOffer] = useState<OfferDoc | null>(null);
    const [copyDateMode, setCopyDateMode] = useState<"single" | "range">("single");
    const [copyStartDate, setCopyStartDate] = useState(dayjs().add(1, "day"));
    const [copyEndDate, setCopyEndDate] = useState(dayjs().add(1, "day"));
    const [copyOffers, setCopyOffers] = useState<Offer[]>([]);
    const [savingCopy, setSavingCopy] = useState(false);

    const openCopyModal = useCallback((offerDoc: OfferDoc) => {
        setCopyingOffer(offerDoc);
        setCopyOffers(offerDoc.offers.map((o: Offer) => ({ ...o })));
        setCopyModalVisible(true);
    }, []);

    const closeCopyModal = useCallback(() => {
        setCopyModalVisible(false);
        setCopyingOffer(null);
        setCopyOffers([]);
        setCopyStartDate(dayjs().add(1, "day"));
        setCopyEndDate(dayjs().add(1, "day"));
        setCopyDateMode("single");
    }, []);

    const handleCopyDateChange = useCallback((params: any) => {
        if (copyDateMode === "single") {
            setCopyStartDate(dayjs(params.date));
            setCopyEndDate(dayjs(params.date));
        } else {
            setCopyStartDate(dayjs(params.startDate));
            setCopyEndDate(dayjs(params.endDate));
        }
    }, [copyDateMode]);

    const updateCopyOffer = useCallback(
        (index: number, field: keyof Offer, value: string | number) => {
            const updated = [...copyOffers];
            updated[index] = { ...updated[index], [field]: value };
            setCopyOffers(updated);
        },
        [copyOffers]
    );

    const addCopyOffer = useCallback(() => {
        if (copyOffers.length < 10) {
            setCopyOffers([
                ...copyOffers,
                { id: Date.now().toString(), title: "", min_spend: 0 },
            ]);
        }
    }, [copyOffers]);

    const removeCopyOffer = useCallback(
        (index: number) => {
            setCopyOffers(copyOffers.filter((_, i) => i !== index));
        },
        [copyOffers]
    );

    const saveCopiedOffer = useCallback(
        async (onSuccess: () => void) => {
            if (!copyingOffer) return;

            const requiredFields = copyOffers.every((o) => o.title && o.min_spend);
            if (!requiredFields) {
                Alert.alert("Validation", "All offer fields are required");
                return;
            }

            try {
                setSavingCopy(true);

                const startDateStr = copyStartDate.format("YYYY-MM-DD");
                const endDateStr = copyEndDate.format("YYYY-MM-DD");

                const datesToCreate = [];
                let current = copyStartDate;

                while (current.isBefore(copyEndDate) || current.isSame(copyEndDate, "day")) {
                    datesToCreate.push(current.format("YYYY-MM-DD"));
                    current = current.add(1, "day");
                }

                for (const date of datesToCreate) {
                    const sortedOffers = [...copyOffers].sort(
                        (a, b) => a.min_spend - b.min_spend
                    );

                    await offersApi.saveSellerOffer({
                        date,
                        offers: sortedOffers.map((o) => ({
                            id: o.id,
                            title: o.title,
                            min_spend: Number(o.min_spend),
                            terms: o.terms || "",
                        })),
                    });
                }

                Alert.alert("Success", "Offer copied successfully!");
                onSuccess();
                closeCopyModal();
            } catch (err: any) {
                Alert.alert("Error", err.response?.data?.error || "Failed to save");
            } finally {
                setSavingCopy(false);
            }
        },
        [copyingOffer, copyOffers, copyStartDate, copyEndDate, closeCopyModal]
    );

    return {
        copyModalVisible,
        copyingOffer,
        copyDateMode,
        copyStartDate,
        copyEndDate,
        copyOffers,
        savingCopy,
        openCopyModal,
        closeCopyModal,
        setCopyDateMode,
        handleCopyDateChange,
        updateCopyOffer,
        addCopyOffer,
        removeCopyOffer,
        saveCopiedOffer,
    };
}
