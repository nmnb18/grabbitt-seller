import { Offer } from "@/components/whats-new/offer-form";
import { offersApi } from "@/services";
import dayjs from "dayjs";
import { useCallback } from "react";

export const useSaveOffer = () => {
    const saveOffer = useCallback(
        async (
            dateMode: "single" | "range",
            startDate: dayjs.Dayjs,
            endDate: dayjs.Dayjs,
            offers: Offer[],
            isEditMode: boolean
        ) => {
            // Sort offers by min_spend
            const sortedOffers = [...offers].sort(
                (a, b) => Number(a.min_spend) - Number(b.min_spend)
            );

            const today = dayjs().format("YYYY-MM-DD");

            if (dateMode === "range") {
                // Save for each date in range
                const dates: string[] = [];
                let current = startDate;

                while (current.isBefore(endDate) || current.isSame(endDate, "day")) {
                    const dateStr = current.format("YYYY-MM-DD");
                    if (dateStr > today) {
                        dates.push(dateStr);
                    }
                    current = current.add(1, "day");
                }

                if (dates.length === 0) {
                    throw new Error("No valid future dates in the selected range");
                }

                // Save for each date
                for (const date of dates) {
                    await offersApi.saveSellerOffer({
                        date,
                        offers: sortedOffers.map((o) => ({
                            id: o.id,
                            title: o.title.trim(),
                            min_spend: Number(o.min_spend),
                            terms: o.terms.trim(),
                        })),
                    });
                }

                return {
                    success: true,
                    message: `Offers saved for ${dates.length} day${dates.length > 1 ? "s" : ""}`,
                    count: dates.length,
                };
            } else {
                // Single date
                await offersApi.saveSellerOffer({
                    date: startDate.format("YYYY-MM-DD"),
                    offers: sortedOffers.map((o) => ({
                        id: o.id,
                        title: o.title.trim(),
                        min_spend: Number(o.min_spend),
                        terms: o.terms.trim(),
                    })),
                });

                return {
                    success: true,
                    message: "Offer saved successfully",
                    count: 1,
                };
            }
        },
        []
    );

    return { saveOffer };
};
