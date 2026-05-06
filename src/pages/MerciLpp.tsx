import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle, Phone, Mail, Clock, Shield } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { fireLeadConversion, getLastLeadId } from "@/lib/leadTracking";

const MerciLpp = () => {
  const { t } = useTranslation();

  useEffect(() => {
    fireLeadConversion({
      pageKey: "merci-lpp",
      leadId: getLastLeadId(),
      googleAdsSendTo: "AW-16586911321/1MwiCK30gpAcENncoOU9",
    });
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <div className="container py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {t("thankYouLpp.title", "Merci pour votre demande LPP !")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              {t(
                "thankYouLpp.message",
                "Votre demande concernant vos avoirs LPP / libre passage a bien été enregistrée. Un conseiller vous contactera très prochainement."
              )}
            </p>

            <div className="bg-card rounded-2xl border p-6 md:p-8 mb-8 text-left">
              <h2 className="text-xl font-semibold mb-4 text-foreground">
                {t("thankYouLpp.nextStepsTitle", "Prochaines étapes")}
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t("thankYouLpp.step1Title", "Analyse de votre situation LPP")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t("thankYouLpp.step2Title", "Contact par un spécialiste prévoyance")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">
                      {t("thankYouLpp.step3Title", "Recommandations personnalisées")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

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

export default MerciLpp;
