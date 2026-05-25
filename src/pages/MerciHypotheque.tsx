import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone, Mail, Clock, Shield } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { fireLeadConversion, getLastLeadId } from "@/lib/leadTracking";

const MerciHypotheque = () => {
  const { t } = useTranslation();

  useEffect(() => {
    fireLeadConversion({
      pageKey: "merci-hypotheque",
      leadId: getLastLeadId(),
      googleAdsSendTo: "AW-16586911321/1MwiCK30gpAcENncoOU9",
    });
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success icon */}
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("thankYouMortgage.title", "Merci pour votre demande !")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              {t("thankYouMortgage.message", "Votre demande de comparaison hypothécaire a été envoyée avec succès. Un de nos conseillers spécialisés vous contactera dans les plus brefs délais.")}
            </p>

            {/* Next steps */}
            <div className="bg-card rounded-2xl border p-6 md:p-8 mb-8 text-left">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {t("thankYouMortgage.nextStepsTitle", "Prochaines étapes")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t("thankYouMortgage.step1Title", "Analyse de votre dossier")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("thankYouMortgage.step1Desc", "Notre équipe analyse votre profil pour vous trouver les meilleurs taux hypothécaires disponibles.")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t("thankYouMortgage.step2Title", "Contact par un conseiller")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("thankYouMortgage.step2Desc", "Un conseiller hypothécaire vous contactera sous 24h pour discuter de votre projet immobilier.")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t("thankYouMortgage.step3Title", "Offres personnalisées")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("thankYouMortgage.step3Desc", "Vous recevrez par email une sélection des meilleures offres hypothécaires adaptées à votre situation.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust badges */}
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

            {/* CTA */}
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

export default MerciHypotheque;
