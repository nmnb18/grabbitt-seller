import { Offer } from "@/components/whats-new/offer-form";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

const MIN_OFFERS = 2;
const MAX_OFFERS = 10;

interface ValidationErrors {
    [key: string]: string;
}

export const useOfferValidation = () => {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    const validateOffers = useCallback(
        (offers: Offer[], startDate: dayjs.Dayjs, endDate: dayjs.Dayjs, dateMode: "single" | "range"): boolean => {
            const newErrors: ValidationErrors = {};
            let isValid = true;

            // Validate date
            const today = dayjs().format("YYYY-MM-DD");
            const formattedStart = startDate.format("YYYY-MM-DD");

            if (formattedStart <= today) {
                newErrors.date = "Please select a future date (tomorrow or later)";
                isValid = false;
            }

            if (dateMode === "range") {
                const formattedEnd = endDate.format("YYYY-MM-DD");
                if (formattedEnd <= today) {
                    newErrors.date = "End date must be in the future";
                    isValid = false;
                }
                if (endDate.isBefore(startDate)) {
                    newErrors.date = "End date must be after start date";
                    isValid = false;
                }
            }

            // Validate each offer
            offers.forEach((offer, index) => {
                if (!offer.title.trim()) {
                    newErrors[`offer_${index}_title`] = "Title is required";
                    isValid = false;
                }
                if (!offer.min_spend || Number(offer.min_spend) <= 0) {
                    newErrors[`offer_${index}_min_spend`] = "Valid minimum spend is required";
                    isValid = false;
                }
            });

            // Check for duplicate min_spend values
            const minSpends = offers.map((o) => Number(o.min_spend)).filter((v) => v > 0);
            const uniqueMinSpends = new Set(minSpends);
            if (minSpends.length !== uniqueMinSpends.size) {
                newErrors.duplicate = "Each offer must have a unique minimum spend value";
                isValid = false;
            }

            setErrors(newErrors);
            return isValid;
        },
        []
    );

    const clearFieldError = useCallback((fieldKey: string) => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next[fieldKey];
            return next;
        });
    }, []);

    const clearDateError = useCallback(() => {
        setErrors((prev) => {
            const next = { ...prev };
            delete next.date;
            return next;
        });
    }, []);

    const checkOfferLimit = useCallback((currentCount: number, isAdding: boolean): boolean => {
        if (isAdding && currentCount >= MAX_OFFERS) {
            Alert.alert("Limit Reached", `Maximum ${MAX_OFFERS} offers allowed per day`);
            return false;
        }
        if (!isAdding && currentCount <= MIN_OFFERS) {
            Alert.alert("Minimum Required", `At least ${MIN_OFFERS} offers are required`);
            return false;
        }
        return true;
    }, []);

    return {
        errors,
        setErrors,
        clearErrors,
        validateOffers,
        clearFieldError,
        clearDateError,
        checkOfferLimit,
        MIN_OFFERS,
        MAX_OFFERS,
    };
};
