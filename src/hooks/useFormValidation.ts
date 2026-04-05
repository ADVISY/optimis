import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

/**
 * Shared form validation utilities for all insurance forms.
 * Provides phone auto-formatting, email validation, and step-level error handling.
 */
export function useFormValidation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [attemptedNext, setAttemptedNext] = useState(false);

  const resetAttempted = useCallback(() => setAttemptedNext(false), []);
  const markAttempted = useCallback(() => setAttemptedNext(true), []);

  /** Format phone: +41/+33 XX XXX XX XX, 0XX XXX XX XX, or detect bare 41.../33... */
  const formatSwissPhone = useCallback((value: string): string => {
    let cleaned = value.replace(/[^\d+]/g, '');

    // Detect bare "41..." or "33..." without "+" and auto-prefix
    if (!cleaned.startsWith('+') && !cleaned.startsWith('0')) {
      if (cleaned.startsWith('41') && cleaned.length > 2) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('33') && cleaned.length > 2) {
        cleaned = '+' + cleaned;
      }
    }

    // +41 format: +41 XX XXX XX XX (9 digits after code)
    if (cleaned.startsWith('+41')) {
      const digits = cleaned.slice(3).slice(0, 9);
      let formatted = '+41';
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      return formatted;
    }

    // +33 format: +33 X XX XX XX XX (9 digits after code)
    if (cleaned.startsWith('+33')) {
      const digits = cleaned.slice(3).slice(0, 9);
      let formatted = '+33';
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 1);
      if (digits.length > 1) formatted += ' ' + digits.slice(1, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      return formatted;
    }

    // Local 0XX format (Swiss or French)
    if (cleaned.startsWith('0')) {
      const digits = cleaned.slice(0, 10);
      let formatted = digits.slice(0, 3);
      if (digits.length > 3) formatted += ' ' + digits.slice(3, 6);
      if (digits.length > 6) formatted += ' ' + digits.slice(6, 8);
      if (digits.length > 8) formatted += ' ' + digits.slice(8, 10);
      return formatted;
    }

    return cleaned;
  }, []);

  const isValidEmail = useCallback((email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, []);

  /** Validate phone: +41 (11 digits), +33 (11 digits), or 0XX (10 digits) */
  const isValidPhone = useCallback((phone: string): boolean => {
    const digitsOnly = phone.replace(/[^\d]/g, '');
    // +41 format: 41 + 9 digits = 11 digits total
    if (phone.trim().startsWith('+41')) {
      return digitsOnly.length === 11;
    }
    // +33 format: 33 + 9 digits = 11 digits total
    if (phone.trim().startsWith('+33')) {
      return digitsOnly.length === 11;
    }
    // 0XX format: exactly 10 digits
    return digitsOnly.length === 10;
  }, []);

  /** Get contact step errors (email + phone) */
  const getContactErrors = useCallback((email: string, phone: string): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !isValidEmail(email)) {
      errs.email = t("forms.validation.invalidEmail", "Adresse email non valide");
    }
    if (!phone.trim() || !isValidPhone(phone)) {
      errs.phone = t("forms.validation.invalidPhone", "Numéro de téléphone non valide (min. 10 chiffres)");
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
