/**
 * useMultiStepForm Hook
 * Advanced form state management for multi-step forms with step-based validation
 * Eliminates code duplication between useForm and useSellerRegistration
 */

import { validateAll, validateField, ValidationResult } from "@/utils/validation";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

type ValidationSchema<T> = {
    [K in keyof T]?: ((value: string) => ValidationResult)[];
};

type StepValidator<T> = (values: T, stepNumber: number) => { valid: boolean; errors: string[] };
type AlertHandler = (title: string, message: string) => void;

interface UseMultiStepFormOptions<T> {
    initialValues: T;
    schema?: ValidationSchema<T>;
    stepValidators?: Record<number, StepValidator<T>>;
    totalSteps: number;
    onSubmit?: (values: T) => Promise<void> | void;
    onStepChange?: (stepNumber: number) => void;
    alertHandler?: AlertHandler;
}

interface UseMultiStepFormReturn<T> {
    // State
    values: T;
    errors: Partial<Record<keyof T, string>>;
    touched: Partial<Record<keyof T, boolean>>;
    currentStep: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;

    // Value setters
    setValue: <K extends keyof T>(field: K, value: T[K]) => void;
    setValues: (values: Partial<T>) => void;
    setError: <K extends keyof T>(field: K, error: string) => void;
    setTouched: <K extends keyof T>(field: K, isTouched?: boolean) => void;

    // Validation
    validateField: <K extends keyof T>(field: K) => string;
    validateForm: () => boolean;
    validateStep: (step?: number) => boolean;

    // Handlers
    handleChange: (field: keyof T) => (value: string) => void;
    handleBlur: (field: keyof T) => () => void;
    handleSubmit: () => Promise<void>;
    handleNext: () => boolean; // Returns true if can move to next step
    handlePrevious: () => void;
    goToStep: (step: number) => boolean; // Returns true if step exists

    // Reset
    reset: () => void;
    resetField: <K extends keyof T>(field: K) => void;
}

export function useMultiStepForm<T extends Record<string, any>>(
    options: UseMultiStepFormOptions<T>
): UseMultiStepFormReturn<T> {
    const {
        initialValues,
        schema,
        stepValidators,
        totalSteps,
        onSubmit,
        onStepChange,
        alertHandler = (title, message) => Alert.alert(title, message),
    } = options;

    // State
    const [values, setValuesState] = useState<T>(initialValues);
    const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
    const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Computed
    const isDirty = useMemo(() => {
        return Object.keys(initialValues).some(
            (key) => values[key as keyof T] !== initialValues[key as keyof T]
        );
    }, [values, initialValues]);

    const isValid = useMemo(() => {
        return Object.keys(errors).every((key) => !errors[key as keyof T]);
    }, [errors]);

    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    // Field setter with auto-clear error
    const setValue = useCallback(
        <K extends keyof T>(field: K, value: T[K]) => {
            setValuesState((prev) => ({ ...prev, [field]: value }));
            if (errors[field]) {
                setErrors((prev) => ({ ...prev, [field]: "" }));
            }
        },
        [errors]
    );

    // Batch value setter
    const setValues = useCallback((newValues: Partial<T>) => {
        setValuesState((prev) => ({ ...prev, ...newValues }));
    }, []);

    // Error setter
    const setError = useCallback(
        <K extends keyof T>(field: K, error: string) => {
            setErrors((prev) => ({ ...prev, [field]: error }));
        },
        []
    );

    // Touched setter
    const setFieldTouched = useCallback(
        <K extends keyof T>(field: K, isTouched = true) => {
            setTouched((prev) => ({ ...prev, [field]: isTouched }));
        },
        []
    );

    // Single field validation
    const validateSingleField = useCallback(
        <K extends keyof T>(field: K): string => {
            if (!schema) return "";
            const rules = schema[field];
            if (!rules) return "";

            const error = validateField(String(field), String(values[field] || ""), rules);
            setErrors((prev) => ({ ...prev, [field]: error }));
            return error;
        },
        [values, schema]
    );

    // Form validation
    const validateForm = useCallback((): boolean => {
        const result = validateAll(values as Record<string, any>, schema as any);
        setErrors(result.errors as Partial<Record<keyof T, string>>);
        return result.isValid;
    }, [values, schema]);

    // Step validation
    const validateStep = useCallback(
        (step?: number): boolean => {
            const stepNum = step ?? currentStep;

            // Use step validator if provided
            if (stepValidators?.[stepNum]) {
                const { valid, errors: stepErrors } = stepValidators[stepNum](values, stepNum);
                if (!valid && stepErrors.length > 0) {
                    alertHandler("Validation Error", stepErrors.join("\n"));
                }
                return valid;
            }

            // Fallback to schema validation if no step validator
            return validateForm();
        },
        [values, currentStep, stepValidators, validateForm, alertHandler]
    );

    // Change handler
    const handleChange = useCallback(
        (field: keyof T) => (value: string) => {
            setValue(field, value as T[keyof T]);
        },
        [setValue]
    );

    // Blur handler
    const handleBlur = useCallback(
        (field: keyof T) => () => {
            setFieldTouched(field, true);
            validateSingleField(field);
        },
        [setFieldTouched, validateSingleField]
    );

    // Submit handler
    const handleSubmit = useCallback(async () => {
        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {} as Partial<Record<keyof T, boolean>>
        );
        setTouched(allTouched);

        // Validate form
        const isFormValid = validateForm();
        if (!isFormValid) return;

        // Submit
        if (onSubmit) {
            try {
                setIsSubmitting(true);
                await onSubmit(values);
            } finally {
                setIsSubmitting(false);
            }
        }
    }, [values, validateForm, onSubmit]);

    // Next step handler
    const handleNext = useCallback((): boolean => {
        // Validate current step
        if (!validateStep(currentStep)) {
            return false;
        }

        // Move to next step if not last
        if (!isLastStep) {
            const nextStep = currentStep + 1;
            setCurrentStep(nextStep);
            onStepChange?.(nextStep);
            return true;
        }

        return true;
    }, [currentStep, isLastStep, validateStep, onStepChange]);

    // Previous step handler
    const handlePrevious = useCallback(() => {
        if (!isFirstStep) {
            const prevStep = currentStep - 1;
            setCurrentStep(prevStep);
            onStepChange?.(prevStep);
        }
    }, [currentStep, isFirstStep, onStepChange]);

    // Go to specific step
    const goToStep = useCallback(
        (step: number): boolean => {
            if (step >= 1 && step <= totalSteps) {
                setCurrentStep(step);
                onStepChange?.(step);
                return true;
            }
            return false;
        },
        [totalSteps, onStepChange]
    );

    // Reset
    const reset = useCallback(() => {
        setValuesState(initialValues);
        setErrors({});
        setTouched({});
        setCurrentStep(1);
        setIsSubmitting(false);
    }, [initialValues]);

    // Reset single field
    const resetField = useCallback(
        <K extends keyof T>(field: K) => {
            setValuesState((prev) => ({
                ...prev,
                [field]: initialValues[field],
            }));
            setErrors((prev) => ({ ...prev, [field]: "" }));
            setTouched((prev) => ({ ...prev, [field]: false }));
        },
        [initialValues]
    );

    return {
        // State
        values,
        errors,
        touched,
        currentStep,
        isFirstStep,
        isLastStep,
        isValid,
        isDirty,
        isSubmitting,

        // Setters
        setValue,
        setValues,
        setError,
        setTouched: setFieldTouched,

        // Validation
        validateField: validateSingleField,
        validateForm,
        validateStep,

        // Handlers
        handleChange,
        handleBlur,
        handleSubmit,
        handleNext,
        handlePrevious,
        goToStep,

        // Reset
        reset,
        resetField,
    };
}
