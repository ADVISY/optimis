import { useState, useCallback } from "react";

interface UseMultiStepFormOptions<T extends object> {
  initialData: T;
  totalSteps: number;
  onSubmit: (data: T) => Promise<void>;
}

export function useMultiStepForm<T extends object>({
  initialData,
  totalSteps,
  onSubmit,
}: UseMultiStepFormOptions<T>) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<T>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(updates);
    setErrors((prev) => {
      const newErrors = { ...prev };
      updatedKeys.forEach((key) => delete newErrors[key]);
      return newErrors;
    });
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  }, [totalSteps]);

  const scrollToFormTop = useCallback(() => {
    // Scroll to top of form container or window
    const formContainer = document.querySelector('[data-form-container]');
    if (formContainer) {
      formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const previousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setTimeout(scrollToFormTop, 50);
    }
  }, [currentStep, scrollToFormTop]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit]);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    currentStep,
    formData,
    isSubmitting,
    errors,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    updateFormData,
    goToStep,
    nextStep,
    previousStep,
    handleSubmit,
    setFieldError,
    clearErrors,
  };
}
