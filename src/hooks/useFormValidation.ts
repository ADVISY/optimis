import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

/**
 * Shared form validation utilities for all insurance forms.
 * Only mobile numbers accepted: +41 7X, +33 6/7, 07X, 06X.
 */
export function useFormValidation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [attemptedNext, setAttemptedNext] = useState(false);

  const resetAttempted = useCallback(() => setAttemptedNext(false), []);
  const markAttempted = useCallback(() => setAttemptedNext(true), []);

  /** Format phone: only mobile numbers (+41 7X, +33 6/7, 07X, 06X) */
  const formatSwissPhone = useCallback((value: string): string => {
    let cleaned = value.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+') && !cleaned.startsWith('0')) {
      if ((cleaned.startsWith('41') || cleaned.startsWith('33')) && cleaned.length >= 11) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('41') || cleaned.startsWith('33') || cleaned.startsWith('4') || cleaned.startsWith('3')) {
        return cleaned; // Still typing international
      } else if (cleaned.startsWith('6') || cleaned.startsWith('7')) {
        cleaned = '0' + cleaned; // Mobile without prefix
      } else {
        return cleaned; // Unknown, don't format
      }
    }

    // +41 format: +41 7X XXX XX XX
    if (cleaned.startsWith('+41')) {
      const digits = cleaned.slice(3).slice(0, 9);
      let formatted = '+41';
      if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
      if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
      if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
      if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
      return formatted;
    }

    // +33 format: +33 6/7 XX XX XX XX
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

    // Local 0XX format
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

  /** Validate phone: only mobile numbers */
  const isValidPhone = useCallback((phone: string): boolean => {
    const digitsOnly = phone.replace(/[^\d]/g, '');
    const trimmed = phone.trim();

    if (trimmed.startsWith('+41')) {
      if (digitsOnly.length !== 11) return false;
      return digitsOnly.slice(2).startsWith('7');
    }
    if (trimmed.startsWith('+33')) {
      if (digitsOnly.length !== 11) return false;
      const after = digitsOnly.slice(2);
      return after.startsWith('6') || after.startsWith('7');
    }
    // Bare 41.../33...
    if (/^\d/.test(trimmed) && (trimmed.startsWith('41') || trimmed.startsWith('33'))) {
      if (digitsOnly.length !== 11) return false;
      const after = digitsOnly.slice(2);
      if (trimmed.startsWith('41')) return after.startsWith('7');
      return after.startsWith('6') || after.startsWith('7');
    }
    // Local: must be 06 or 07
    if (digitsOnly.length !== 10) return false;
    return digitsOnly.startsWith('07') || digitsOnly.startsWith('06');
  }, []);

  /** Get contact step errors (email + phone) */
  const getContactErrors = useCallback((email: string, phone: string): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !isValidEmail(email)) {
      errs.email = t("forms.validation.invalidEmail", "Adresse email non valide");
    }
    if (!phone.trim()) {
      errs.phone = t("forms.validation.phoneRequired", "Veuillez saisir votre numéro de téléphone");
    } else if (!isValidPhone(phone)) {
      const digitsOnly = phone.replace(/[^\d]/g, '');
      const trimmed = phone.trim();
      const isInternational = trimmed.startsWith('+41') || trimmed.startsWith('+33') || (/^\d/.test(trimmed) && (trimmed.startsWith('41') || trimmed.startsWith('33')));
      const requiredDigits = isInternational ? 11 : 10;

      if (digitsOnly.length < requiredDigits) {
        const missing = requiredDigits - digitsOnly.length;
        errs.phone = t("forms.validation.phoneTooShort", "Il manque {{count}} chiffre(s) à votre numéro", { count: missing });
      } else {
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
