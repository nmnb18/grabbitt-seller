/**
 * useForm Hook
 * Generic form state management with validation
 */

import { useState, useCallback, useMemo } from "react";
import { validateField, validateAll, ValidationResult } from "@/utils/validation";

type ValidationSchema<T> = {
  [K in keyof T]?: ((value: string) => ValidationResult)[];
};

interface UseFormOptions<T> {
  initialValues: T;
  schema?: ValidationSchema<T>;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setValues: (values: Partial<T>) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  setTouched: <K extends keyof T>(field: K, isTouched?: boolean) => void;
  validateField: <K extends keyof T>(field: K) => string;
  validateForm: () => boolean;
  handleChange: (field: keyof T) => (value: string) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, schema = {}, onSubmit } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => {
    return Object.keys(initialValues).some(
      (key) => values[key as keyof T] !== initialValues[key as keyof T]
    );
  }, [values, initialValues]);

  const isValid = useMemo(() => {
    return Object.keys(errors).every((key) => !errors[key as keyof T]);
  }, [errors]);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const setAllValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [field]: isTouched }));
    },
    []
  );

  const validateSingleField = useCallback(
    <K extends keyof T>(field: K): string => {
      const rules = schema[field];
      if (!rules) return "";

      const error = validateField(
        String(field),
        String(values[field] || ""),
        rules
      );
      setErrors((prev) => ({ ...prev, [field]: error }));
      return error;
    },
    [values, schema]
  );

  const validateForm = useCallback((): boolean => {
    const result = validateAll(values as Record<string, any>, schema as any);
    setErrors(result.errors as Partial<Record<keyof T, string>>);
    return result.isValid;
  }, [values, schema]);

  const handleChange = useCallback(
    (field: keyof T) => (value: string) => {
      setValue(field, value as T[keyof T]);
    },
    [setValue]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setFieldTouched(field, true);
      validateSingleField(field);
    },
    [setFieldTouched, validateSingleField]
  );

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

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isValid,
    isDirty,
    isSubmitting,
    setValue,
    setValues: setAllValues,
    setError,
    setTouched: setFieldTouched,
    validateField: validateSingleField,
    validateForm,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
