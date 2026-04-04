import { } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const ThankYou = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const returnUrl = (location.state as any)?.returnUrl as string | undefined;


  const handleDiscoverResults = () => {
    if (returnUrl) {
      navigate(returnUrl, { state: { showResults: true } });
    }
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">{t('thankYou.title')}</h1>
          <p className="text-xl text-muted-foreground mb-8">{t('thankYou.message')}</p>
          <p className="text-muted-foreground mb-8">{t('thankYou.nextSteps')}</p>
          
          {returnUrl ? (
            <Button size="lg" onClick={handleDiscoverResults} className="text-lg px-8 py-6">
              {t('forms.discoverResults', 'Découvrir les résultats')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
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
