import { useState, useCallback, useRef, useEffect } from "react";
import { useOtpVerification } from "@/hooks/useOtpVerification";

interface OtpFormFlowOptions {
  onOtpVerified: () => Promise<void> | void;
  getPhone: () => string;
}

/**
 * Manages the lead form continuation point with SMS OTP verification.
 */
export function useOtpFormFlow({ onOtpVerified, getPhone }: OtpFormFlowOptions) {
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");
  const otp = useOtpVerification();

  const onOtpVerifiedRef = useRef(onOtpVerified);
  const getPhoneRef = useRef(getPhone);
  useEffect(() => { onOtpVerifiedRef.current = onOtpVerified; }, [onOtpVerified]);
  useEffect(() => { getPhoneRef.current = getPhone; }, [getPhone]);

  const startOtpFlow = useCallback(async () => {
    const phone = getPhoneRef.current().trim();
    setPendingPhone(phone);
    const sent = await otp.sendOtp(phone);
    if (sent) {
      setShowOtpModal(true);
    }
  }, [otp]);

  const handleVerify = useCallback(async (code: string) => {
    const success = await otp.verifyOtp(code);
    if (success) {
      setShowOtpModal(false);
      sessionStorage.setItem("phone_verified", "true");
      await onOtpVerifiedRef.current();
    }
  }, [otp]);

  const handleResend = useCallback(async () => {
    await otp.sendOtp(pendingPhone);
  }, [otp, pendingPhone]);

  const handleModifyPhone = useCallback(() => {
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
