import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import logoOptimis from "@/assets/logo.svg";

const RESEND_DELAY_S = 30;
const RATE_LIMIT_COOLDOWN_S = 180;
const OTP_REQUEST_TTL_MS = 10 * 60 * 1000;
const OTP_STORAGE_PREFIX = "optimis_admin_otp_request";

type StoredOtpRequest = {
  phoneLastDigits: string;
  requestedAt: number;
};

const getOtpStorageKey = (userId: string) => `${OTP_STORAGE_PREFIX}:${userId}`;

const readStoredOtpRequest = (userId: string): StoredOtpRequest | null => {
  if (typeof window === "undefined") return null;

  const rawValue = sessionStorage.getItem(getOtpStorageKey(userId));
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(rawValue) as StoredOtpRequest;
    if (!parsed.phoneLastDigits || typeof parsed.requestedAt !== "number") {
      sessionStorage.removeItem(getOtpStorageKey(userId));
      return null;
    }

    if (Date.now() - parsed.requestedAt > OTP_REQUEST_TTL_MS) {
      sessionStorage.removeItem(getOtpStorageKey(userId));
      return null;
    }

    return parsed;
  } catch {
    sessionStorage.removeItem(getOtpStorageKey(userId));
    return null;
  }
};

const storeOtpRequest = (userId: string, phoneLastDigits: string) => {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    getOtpStorageKey(userId),
    JSON.stringify({ phoneLastDigits, requestedAt: Date.now() }),
  );
};

const clearStoredOtpRequest = (userId: string) => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(getOtpStorageKey(userId));
};

export default function AdminVerifyOtp() {
  const navigate = useNavigate();
  const { session, isOtpVerified, loading, refreshOtpStatus, signOut } = useAdminAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [phoneLastDigits, setPhoneLastDigits] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const sentRef = useRef(false);

  const restoreStoredOtpState = useCallback(() => {
    const userId = session?.user.id;
    if (!userId) return false;

    const storedRequest = readStoredOtpRequest(userId);
    if (!storedRequest) return false;

    setPhoneLastDigits(storedRequest.phoneLastDigits);
    const elapsedSeconds = Math.floor((Date.now() - storedRequest.requestedAt) / 1000);
    setResendCooldown(Math.max(0, RESEND_DELAY_S - elapsedSeconds));
    return true;
  }, [session?.user.id]);

  const getInvokeErrorPayload = useCallback(async (invokeError: unknown) => {
    if (!(invokeError instanceof FunctionsHttpError)) return null;

    try {
      return await invokeError.context.json();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!session) navigate("/admin/login", { replace: true });
    else if (isOtpVerified) navigate("/admin", { replace: true });
  }, [session, isOtpVerified, loading, navigate]);

  const sendOtp = useCallback(async ({ auto = false }: { auto?: boolean } = {}) => {
    const userId = session?.user.id;
    if (!userId) return;

    if (auto && restoreStoredOtpState()) return;

    setSending(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("admin-send-otp");
      const payload = !data?.success ? (data ?? await getInvokeErrorPayload(invokeError)) : data;

      if (invokeError || !data?.success) {
        if (payload?.error === "too_many_requests") {
          restoreStoredOtpState();
          setResendCooldown((current) => Math.max(current, RATE_LIMIT_COOLDOWN_S));
          setError(payload.message || "Un code a déjà été envoyé récemment. Patientez quelques minutes.");
        } else if (payload?.error === "forbidden" || payload?.error === "account_inactive") {
          setError("Accès refusé. Compte non autorisé.");
        } else {
          setError("Échec de l'envoi du code. Réessayez.");
        }
        return;
      }

      setPhoneLastDigits(data.phoneLastDigits);
      storeOtpRequest(userId, data.phoneLastDigits);
      setResendCooldown(RESEND_DELAY_S);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSending(false);
    }
  }, [getInvokeErrorPayload, restoreStoredOtpState, session?.user.id]);

  useEffect(() => {
    // Restore previously sent OTP state (if user refreshed during a valid request)
    // but DO NOT auto-send a new code — admin must click "Envoyer le code".
    if (loading || !session || isOtpVerified || sentRef.current) return;
    sentRef.current = true;
    restoreStoredOtpState();
  }, [loading, session, isOtpVerified, restoreStoredOtpState]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleVerify = async (value: string) => {
    setVerifying(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("admin-verify-otp", {
        body: { code: value },
      });
      if (invokeError || !data?.success) {
        setError("Code invalide ou expiré.");
        setCode("");
      } else {
        if (session?.user.id) clearStoredOtpRequest(session.user.id);
        await refreshOtpStatus();
        navigate("/admin", { replace: true });
      }
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (code.length === 4 && !verifying) handleVerify(code);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    if (session?.user.id) clearStoredOtpRequest(session.user.id);
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--optimis-green))] to-[hsl(var(--optimis-green-dark))] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoOptimis} alt="Optimis" className="h-14 w-auto mx-auto brightness-0 invert" />
          <p className="mt-3 text-white/80 text-sm uppercase tracking-widest font-semibold">Vérification 2FA</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-[hsl(var(--optimis-green))]" />
              <h2 className="text-xl font-bold text-[hsl(var(--optimis-green))]">Code de vérification</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {phoneLastDigits
                ? <>Un code à 4 chiffres a été envoyé au numéro se terminant par <strong>••{phoneLastDigits}</strong>.</>
                : "Envoi du code en cours..."}
            </p>

            <div className="flex justify-center mb-4">
              <InputOTP maxLength={4} value={code} onChange={setCode} disabled={verifying || sending}>
                <InputOTPGroup>
                  {[0, 1, 2, 3].map((i) => (
                    <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 mb-4 text-center">{error}</p>
            )}

            {verifying && (
              <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2 mb-4">
                <Loader2 className="h-4 w-4 animate-spin" /> Vérification...
              </p>
            )}

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => void sendOtp()}
                disabled={sending || resendCooldown > 0}
                className="w-full"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : "Renvoyer le code"}
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="w-full text-sm">
                Annuler et se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
