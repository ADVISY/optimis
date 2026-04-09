import { useState, useCallback } from "react";
import { useOtpVerification } from "@/hooks/useOtpVerification";

interface OtpFormFlowOptions {
  onOtpVerified: () => Promise<void> | void;
  getPhone: () => string;
}

/**
 * Manages OTP verification flow for lead forms.
 * Call `startOtpFlow()` instead of directly submitting.
 * After phone is verified, `onOtpVerified` callback fires.
 */
export function useOtpFormFlow({ onOtpVerified, getPhone }: OtpFormFlowOptions) {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const otp = useOtpVerification();

  const startOtpFlow = useCallback(async () => {
    const phone = getPhone();
    setPendingPhone(phone);
    setShowOtpModal(true);
    await otp.sendOtp(phone);
  }, [getPhone, otp]);

  const handleVerify = useCallback(async (code: string) => {
    const success = await otp.verifyOtp(code);
    if (success) {
      setShowOtpModal(false);
      // Store verification in sessionStorage for ThankYou page
      sessionStorage.setItem("phone_verified", "true");
      await onOtpVerified();
    }
  }, [otp, onOtpVerified]);

  const handleResend = useCallback(async () => {
    await otp.sendOtp(pendingPhone);
  }, [otp, pendingPhone]);

  const handleModifyPhone = useCallback(() => {
    // Close modal and reset OTP state so user can edit phone
    setShowOtpModal(false);
    otp.resetOtp();
  }, [otp]);

  const handleClose = useCallback(() => {
    setShowOtpModal(false);
  }, []);

  const otpModalProps = {
    open: showOtpModal,
    phone: pendingPhone,
    phoneLastDigits: otp.phoneLastDigits,
    isSending: otp.isSending,
    isVerifying: otp.isVerifying,
    error: otp.error,
    remainingAttempts: otp.remainingAttempts,
    onVerify: handleVerify,
    onResend: handleResend,
    onModifyPhone: handleModifyPhone,
    onClose: handleClose,
  };

  return {
    showOtpModal,
    startOtpFlow,
    otpModalProps,
    isOtpSending: otp.isSending,
  };
}
