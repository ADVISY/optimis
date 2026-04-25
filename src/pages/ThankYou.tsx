import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ShieldCheck } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const ThankYou = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const returnUrl = (location.state as any)?.returnUrl as string | undefined;
  const phoneVerified = sessionStorage.getItem("phone_verified") === "true";

  useEffect(() => {
    // Dédup : ne déclencher la conversion Google Ads qu'une seule fois par session,
    // pour éviter le re-comptage en cas de F5 ou retour navigateur sur /merci.
    const FLAG = "ga_conversion_thankyou_sent";
    if (sessionStorage.getItem(FLAG) === "1") return;
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'AW-16586911321/1MwiCK30gpAcENncoOU9'
      });
      sessionStorage.setItem(FLAG, "1");
    }
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
      </div>
    </Layout>
  );
};

export default ThankYou;
