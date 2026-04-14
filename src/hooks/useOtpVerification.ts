import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OtpState {
  phone: string;
  phoneLastDigits: string;
  expiresAt: string | null;
  isVerified: boolean;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  remainingAttempts: number | null;
}

export function useOtpVerification() {
  const [state, setState] = useState<OtpState>({
    phone: "",
    phoneLastDigits: "",
    expiresAt: null,
    isVerified: false,
    isSending: false,
    isVerifying: false,
    error: null,
    remainingAttempts: null,
  });

  const sendOtp = useCallback(async (phone: string) => {
    setState((prev) => ({ ...prev, isSending: true, error: null, phone }));

    try {
      const { data, error } = await supabase.functions.invoke("send-otp", {
        body: { phone },
      });

      if (error) throw new Error(error.message || "Erreur lors de l'envoi du SMS");

      if (!data?.success) {
        const msg = data?.error === "too_many_requests"
          ? data.message
          : data?.message || "Erreur lors de l'envoi du SMS";
        setState((prev) => ({ ...prev, isSending: false, error: msg }));
        return false;
      }

      setState((prev) => ({
        ...prev,
        isSending: false,
        phoneLastDigits: data.phoneLastDigits,
        expiresAt: data.expiresAt,
        isVerified: false,
        error: null,
        remainingAttempts: null,
      }));
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setState((prev) => ({ ...prev, isSending: false, error: message }));
      return false;
    }
  }, []);

  const verifyOtp = useCallback(async (code: string) => {
    setState((prev) => ({ ...prev, isVerifying: true, error: null }));

    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone: state.phone, code },
      });

      if (error) throw new Error(error.message || "Erreur de vérification");

      if (!data?.success) {
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          error: data?.message || "Code incorrect",
          remainingAttempts: data?.remainingAttempts ?? prev.remainingAttempts,
        }));
        return false;
      }

      if (data.verified) {
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          isVerified: true,
          error: null,
        }));
        return true;
      }

      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setState((prev) => ({ ...prev, isVerifying: false, error: message }));
      return false;
    }
  }, [state.phone]);

  const resetOtp = useCallback(() => {
    setState({
      phone: "",
      phoneLastDigits: "",
      expiresAt: null,
      isVerified: false,
      isSending: false,
      isVerifying: false,
      error: null,
      remainingAttempts: null,
    });
  }, []);

  return {
    ...state,
    sendOtp,
    verifyOtp,
    resetOtp,
  };
}
