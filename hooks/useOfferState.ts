import { Offer } from "@/components/whats-new/offer-form";
import dayjs from "dayjs";
import { useCallback, useState } from "react";

export const useOfferState = (initialOffers?: Offer[]) => {
    const [dateMode, setDateMode] = useState<"single" | "range">("single");
    const [startDate, setStartDate] = useState(dayjs().add(1, "day"));
    const [endDate, setEndDate] = useState(dayjs().add(1, "day"));
    const [offers, setOffers] = useState<Offer[]>(
        initialOffers || [
            { id: Date.now().toString(), title: "", min_spend: "", terms: "" },
            { id: (Date.now() + 1).toString(), title: "", min_spend: "", terms: "" },
        ]
    );

    const updateOffer = useCallback(
        (index: number, field: keyof Offer, value: string) => {
            const updated = [...offers];
            updated[index] = { ...updated[index], [field]: value };
            setOffers(updated);
        },
        [offers]
    );

    const addOffer = useCallback(() => {
        setOffers([
            ...offers,
            { id: Date.now().toString(), title: "", min_spend: "", terms: "" },
        ]);
    }, [offers]);

    const removeOffer = useCallback(
        (index: number) => {
            setOffers(offers.filter((_, i) => i !== index));
        },
        [offers]
    );

    const handleDateChange = useCallback(
        (params: any) => {
            if (dateMode === "range") {
                if (params?.startDate) setStartDate(dayjs(params.startDate));
                if (params?.endDate) setEndDate(dayjs(params.endDate));
            } else {
                if (params?.date) {
                    setStartDate(dayjs(params.date));
                    setEndDate(dayjs(params.date));
                }
            }
        },
        [dateMode]
    );

    const resetOffers = useCallback(() => {
        setDateMode("single");
        setStartDate(dayjs().add(1, "day"));
        setEndDate(dayjs().add(1, "day"));
        setOffers(
            initialOffers || [
                { id: Date.now().toString(), title: "", min_spend: "", terms: "" },
                { id: (Date.now() + 1).toString(), title: "", min_spend: "", terms: "" },
            ]
        );
    }, [initialOffers]);

    return {
        dateMode,
        setDateMode,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        offers,
        setOffers,
        updateOffer,
        addOffer,
        removeOffer,
        handleDateChange,
        resetOffers,
    };
};
