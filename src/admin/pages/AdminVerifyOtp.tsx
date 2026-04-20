import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import logoOptimis from "@/assets/logo.svg";

const RESEND_DELAY_S = 30;

export default function AdminVerifyOtp() {
  const navigate = useNavigate();
  const { session, isAdmin, isOtpVerified, loading, refreshOtpStatus, signOut } = useAdminAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [phoneLastDigits, setPhoneLastDigits] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const sentRef = useRef(false);

  // Redirect if not eligible
  useEffect(() => {
    if (loading) return;
    if (!session) navigate("/admin/login", { replace: true });
    else if (isOtpVerified) navigate("/admin", { replace: true });
  }, [session, isOtpVerified, loading, navigate]);

  const sendOtp = async () => {
    setSending(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("admin-send-otp");
      if (invokeError || !data?.success) {
        if (data?.error === "too_many_requests") {
          setError(data.message || "Trop de tentatives. Patientez quelques minutes.");
        } else if (data?.error === "forbidden" || data?.error === "account_inactive") {
          setError("Accès refusé. Compte non autorisé.");
        } else {
          setError("Échec de l'envoi du code. Réessayez.");
        }
      } else {
        setPhoneLastDigits(data.phoneLastDigits);
        setResendCooldown(RESEND_DELAY_S);
      }
    } catch (e) {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  // Auto-send on first mount
  useEffect(() => {
    if (loading || !session || isOtpVerified || sentRef.current) return;
    sentRef.current = true;
    sendOtp();
  }, [loading, session, isOtpVerified]);

  // Cooldown timer
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
        await refreshOtpStatus();
        navigate("/admin", { replace: true });
      }
    } catch (e) {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (code.length === 4 && !verifying) handleVerify(code);
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

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
                  {[0,1,2,3].map((i) => (
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
                onClick={sendOtp}
                disabled={sending || resendCooldown > 0}
                className="w-full"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {resendCooldown > 0 ? `Renvoyer le code (${resendCooldown}s)` : "Renvoyer le code"}
              </Button>
              <Button variant="ghost" onClick={async () => { await signOut(); navigate("/admin/login"); }} className="w-full text-sm">
                Annuler et se déconnecter
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
