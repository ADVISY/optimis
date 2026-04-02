import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormThankYouScreenProps {
  onDiscoverResults: () => void;
  resultsReady?: boolean;
}

const FormThankYouScreen = ({ onDiscoverResults, resultsReady = true }: FormThankYouScreenProps) => {
  const { t } = useTranslation();

  // Fire conversion pixels on mount
  useEffect(() => {
    if ((window as any).fbq) (window as any).fbq('track', 'Lead');
    if ((window as any).ttq) (window as any).ttq.track('SubmitForm');
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("thankYou.title", "Merci pour votre demande !")}
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          {t("thankYou.message", "Nous avons bien reçu vos informations. Un conseiller vous contactera dans les plus brefs délais.")}
        </p>
        <p className="text-muted-foreground">
          {t("thankYou.nextSteps", "En attendant, découvrez les offres qui correspondent à votre profil.")}
        </p>
        <Button
          size="lg"
          onClick={onDiscoverResults}
          disabled={!resultsReady}
          className="mt-4 text-lg px-8 py-6"
        >
          {resultsReady
            ? t("forms.discoverResults", "Découvrir les résultats")
            : t("forms.loadingResults", "Chargement des offres...")}
          {resultsReady && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default FormThankYouScreen;
