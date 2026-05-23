import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Shield } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { fireLeadConversion, getLastLeadId } from "@/lib/leadTracking";

interface Props {
  pageKey: string;
  titleKey: string;
  titleDefault: string;
  messageKey: string;
  messageDefault: string;
}

const MerciGeneric = ({ pageKey, titleKey, titleDefault, messageKey, messageDefault }: Props) => {
  const { t } = useTranslation();

  useEffect(() => {
    fireLeadConversion({
      pageKey,
      leadId: getLastLeadId(),
      googleAdsSendTo: "AW-16586911321/1MwiCK30gpAcENncoOU9",
    });
  }, [pageKey]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t(titleKey, titleDefault)}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              {t(messageKey, messageDefault)}
            </p>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t("comparators.trust.free")}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t("comparators.trust.noCommitment")}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                {t("comparators.trust.dataProtected")}
              </div>
            </div>

            <LocalizedLink to="/">
              <Button size="lg" className="px-8">
                {t("thankYou.backHome", "Retour à l'accueil")}
              </Button>
            </LocalizedLink>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const MerciEstimation = () => (
  <MerciGeneric
    pageKey="merci-estimation"
    titleKey="thankYouRealEstate.title"
    titleDefault="Merci pour votre demande d'estimation !"
    messageKey="thankYouRealEstate.message"
    messageDefault="Votre demande d'estimation immobilière a bien été reçue. Un expert vous contactera rapidement avec une évaluation personnalisée de votre bien."
  />
);

export const MerciPartenaire = () => (
  <MerciGeneric
    pageKey="merci-partenaire"
    titleKey="thankYouPartner.title"
    titleDefault="Merci pour votre demande de partenariat !"
    messageKey="thankYouPartner.message"
    messageDefault="Un membre de notre équipe vous contactera sous 24 heures pour discuter de votre partenariat avec Optimis."
  />
);

export const MerciSubside = () => (
  <MerciGeneric
    pageKey="merci-subside"
    titleKey="thankYouSubsidy.title"
    titleDefault="Merci pour votre demande de subside !"
    messageKey="thankYouSubsidy.message"
    messageDefault="Votre demande de subside d'assurance maladie a bien été enregistrée. Un conseiller vous accompagnera dans vos démarches."
  />
);

export const MerciResiliation = () => (
  <MerciGeneric
    pageKey="merci-resiliation"
    titleKey="thankYouTermination.title"
    titleDefault="Merci pour votre demande de résiliation !"
    messageKey="thankYouTermination.message"
    messageDefault="Votre demande de résiliation a bien été reçue. Nous vous accompagnons dans les prochaines étapes pour résilier votre contrat actuel."
  />
);

export const MerciPrenatal = () => (
  <MerciGeneric
    pageKey="merci-prenatale"
    titleKey="thankYouPrenatal.title"
    titleDefault="Félicitations pour votre futur bébé !"
    messageKey="thankYouPrenatal.message"
    messageDefault="Votre demande d'assurance prénatale a bien été reçue. Un conseiller spécialisé vous contactera rapidement avec les meilleures offres pour protéger votre bébé dès sa naissance."
  />
);


export default MerciGeneric;
