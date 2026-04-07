import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { formatPhoneInput, getPhoneValidationResult } from "@/lib/phoneValidation";

/**
 * Shared form validation utilities for all insurance forms.
 * Only Swiss and French mobile numbers with a valid structure are accepted.
 */
export function useFormValidation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [attemptedNext, setAttemptedNext] = useState(false);

  const resetAttempted = useCallback(() => setAttemptedNext(false), []);
  const markAttempted = useCallback(() => setAttemptedNext(true), []);

  /** Format phone while preserving country code semantics (+41 / +33) */
  const formatSwissPhone = useCallback((value: string): string => {
    return formatPhoneInput(value);
  }, []);

  const isValidEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, []);

  /** Validate phone: only mobile numbers */
  const isValidPhone = useCallback((phone: string): boolean => {
    return getPhoneValidationResult(phone).isValid;
  }, []);

  /** Get contact step errors (email + phone) */
  const getContactErrors = useCallback((email: string, phone: string): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !isValidEmail(email)) {
      errs.email = t("forms.validation.invalidEmail", "Adresse email non valide");
    }
    if (!phone.trim()) {
      errs.phone = t("forms.validation.phoneRequired", "Veuillez saisir votre numéro de téléphone");
    } else {
      const phoneValidation = getPhoneValidationResult(phone);

      if (!phoneValidation.isValid && phoneValidation.reason === "too_short" && phoneValidation.missingDigits > 0) {
        errs.phone = t("forms.validation.phoneTooShort", "Il manque {{count}} chiffre(s) à votre numéro", { count: phoneValidation.missingDigits });
      } else if (!phoneValidation.isValid) {
        errs.phone = t("forms.validation.mobileOnly", "Seuls les numéros mobiles sont acceptés (06, 07, +41 7X, +33 6/7)");
      }
    }
    return errs;
  }, [t, isValidEmail, isValidPhone]);

  /** Get identity step errors (firstName + lastName) */
  const getIdentityErrors = useCallback((firstName: string, lastName: string): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = t("forms.validation.required", "Ce champ est obligatoire");
    if (!lastName.trim()) errs.lastName = t("forms.validation.required", "Ce champ est obligatoire");
    return errs;
  }, [t]);

  /** Show toast for validation failure */
  const showValidationToast = useCallback(() => {
    toast({
      title: t("forms.validation.fillRequired", "Veuillez remplir les champs obligatoires"),
      description: t("forms.validation.checkFields", "Vérifiez les champs marqués en rouge"),
      variant: "destructive",
    });
  }, [toast, t]);

  return {
    attemptedNext,
    markAttempted,
    resetAttempted,
    formatSwissPhone,
    isValidEmail,
    isValidPhone,
    getContactErrors,
    getIdentityErrors,
    showValidationToast,
  };
}
