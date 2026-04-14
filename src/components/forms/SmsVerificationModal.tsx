import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Phone, Loader2, RefreshCw, Pencil, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmsVerificationModalProps {
  open: boolean;
  phone: string;
  phoneLastDigits: string;
  isSending: boolean;
  isVerifying: boolean;
  error: string | null;
  remainingAttempts: number | null;
  onVerify: (code: string) => void;
  onResend: () => void;
  onModifyPhone: () => void;
  onClose: () => void;
}

const CODE_LENGTH = 6;

const SmsVerificationModal = ({
  open,
  phone,
  phoneLastDigits,
  isSending,
  isVerifying,
  error,
  remainingAttempts,
  onVerify,
  onResend,
  onModifyPhone,
  onClose,
}: SmsVerificationModalProps) => {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (open) {
      setDigits(Array(CODE_LENGTH).fill(""));
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleDigitChange = useCallback((index: number, value: string) => {
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, "").slice(0, CODE_LENGTH).split("");
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        if (index + i < CODE_LENGTH) newDigits[index + i] = d;
      });
      setDigits(newDigits);
      const nextIndex = Math.min(index + pastedDigits.length, CODE_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      if (newDigits.every((d) => d !== "")) {
        onVerify(newDigits.join(""));
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && newDigits.every((d) => d !== "")) {
      onVerify(newDigits.join(""));
    }
  }, [digits, onVerify]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newDigits = [...digits];
      newDigits[index - 1] = "";
      setDigits(newDigits);
    }
  }, [digits]);

  const handleResend = () => {
    setDigits(Array(CODE_LENGTH).fill(""));
    setResendCooldown(30);
    onResend();
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const isComplete = digits.every((d) => d !== "");

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            {t("otp.title", "Vérifiez votre numéro pour continuer")}
          </DialogTitle>
          <DialogDescription className="text-center mt-2">
            {t("otp.description", "Nous vous avons envoyé un code de sécurité par SMS. Entrez ce code pour confirmer votre numéro et poursuivre.")}
          </DialogDescription>
          {phoneLastDigits && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
              <Phone className="h-3.5 w-3.5" />
              {t("otp.sentTo", "Code envoyé au numéro se terminant par")} ****{phoneLastDigits}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Code inputs */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
                  if (pasted) handleDigitChange(i, pasted);
                }}
                className={cn(
                  "w-11 h-13 sm:w-12 sm:h-14 rounded-lg border-2 text-center text-xl sm:text-2xl font-semibold",
                  "bg-background text-foreground outline-none transition-all duration-150",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  digit ? "border-primary/50" : "border-border",
                  error && "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
                  (isVerifying || isSending) && "opacity-50 cursor-not-allowed"
                )}
                disabled={isVerifying || isSending}
                autoComplete={i === 0 ? "one-time-code" : "off"}
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-sm text-destructive text-center font-medium">{error}</p>
          )}

          {/* Verify button */}
          <Button
            onClick={() => onVerify(digits.join(""))}
            disabled={!isComplete || isVerifying || isSending}
            className="w-full h-12 text-lg"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t("otp.verifying", "Vérification...")}
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                {t("otp.verify", "Valider le code")}
              </>
            )}
          </Button>

          {/* Actions row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={isSending || resendCooldown > 0}
              className="flex items-center gap-1.5 text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", isSending && "animate-spin")} />
              {resendCooldown > 0
                ? t("otp.resendIn", "Renvoyer le code ({{seconds}}s)", { seconds: resendCooldown })
                : t("otp.resend", "Renvoyer le code")}
            </button>

            <button
              type="button"
              onClick={onModifyPhone}
              disabled={isSending || isVerifying}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t("otp.modifyPhone", "Modifier mon numéro")}
            </button>
          </div>

          {/* Loading indicator for sending */}
          {isSending && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("otp.sending", "Envoi du code SMS...")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmsVerificationModal;
