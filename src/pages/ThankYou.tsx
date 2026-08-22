import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import AvisPromptDialog from "@/components/AvisPromptDialog";
import RdvCta from "@/components/RdvCta";
import { fireLeadConversion, getLastLeadId, getLastFormType } from "@/lib/leadTracking";

const ThankYou = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  // returnUrl : l'état React Router est perdu au rechargement complet de /merci
  // (on force désormais un vrai page-load pour le tracking) → on le récupère depuis
  // sessionStorage, écrit par le formulaire juste avant la redirection.
  const [returnUrl] = useState<string | undefined>(
    () =>
      ((location.state as any)?.returnUrl as string | undefined) ??
      (typeof window !== "undefined"
        ? sessionStorage.getItem("lead_return_url") ?? undefined
        : undefined),
  );
  const phoneVerified = sessionStorage.getItem("phone_verified") === "true";

  useEffect(() => {
    fireLeadConversion({
      pageKey: "merci",
      leadId: getLastLeadId(),
      formType: getLastFormType(),
      googleAdsSendTo: "AW-16586911321/1MwiCK30gpAcENncoOU9",
    });
    // Nettoie pour éviter un returnUrl périmé sur une visite directe ultérieure
    try { sessionStorage.removeItem("lead_return_url"); } catch { /* noop */ }
  }, []);

  const handleDiscoverResults = () => {
    if (returnUrl && phoneVerified) {
      navigate(returnUrl, { state: { showResults: true } });
    }
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('thankYou.title')}</h1>

          {phoneVerified && (
            <div className="flex items-center justify-center gap-2 mb-4 text-green-600">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-medium">
                {t('otp.phoneVerifiedSuccess', 'Votre numéro a été vérifié avec succès.')}
              </span>
            </div>
          )}

          <p className="text-xl text-muted-foreground mb-8">{t('thankYou.message')}</p>
          <p className="text-muted-foreground mb-8">{t('thankYou.nextSteps')}</p>
          
          {returnUrl && phoneVerified ? (
            <Button size="lg" onClick={handleDiscoverResults} className="text-lg px-8 py-6">
              {t('forms.discoverResults', 'Voir mes résultats')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : returnUrl && !phoneVerified ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t('otp.verificationRequired', 'La vérification de votre numéro est nécessaire pour accéder aux résultats.')}
              </p>
              <LocalizedLink to="/">
                <Button size="lg">{t('thankYou.backHome')}</Button>
              </LocalizedLink>
            </div>
          ) : (
            <LocalizedLink to="/">
              <Button size="lg">{t('thankYou.backHome')}</Button>
            </LocalizedLink>
          )}
        </div>

        {/* Encart CTA → renvoie vers la page dédiée /rendez-vous */}
        <RdvCta />
      </div>
      <AvisPromptDialog />
    </Layout>
  );
};

export default ThankYou;
