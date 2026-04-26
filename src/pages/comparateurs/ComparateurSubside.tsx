import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import SubsidyForm from "@/components/forms/SubsidyForm";
import { HandCoins, CheckCircle, Clock, BadgePercent, Users } from "lucide-react";

const ComparateurSubside = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Hero intro section */}
            <div className="max-w-3xl mx-auto text-center mb-5 md:mb-8">
              <div className="flex gap-1 justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-lg md:text-xl drop-shadow-sm">★</span>
                ))}
              </div>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-foreground tracking-tight uppercase mb-2">
                {t("comparators.subsidy.heroTitle", "SIMULATION SUBSIDE 2026 : VÉRIFIEZ VOTRE DROIT AUX AIDES")}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-3 max-w-xl mx-auto">
                {t("comparators.subsidy.heroSubtitle", "Découvrez en 2 minutes le montant du subside auquel vous avez droit pour réduire votre prime d'assurance maladie.")}
              </p>
              <div className="flex flex-col items-start gap-1.5 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  {t("comparators.subsidy.heroBullet1", "Simulation gratuite en 2 minutes")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <BadgePercent className="h-4 w-4 shrink-0" />
                  {t("comparators.subsidy.heroBullet2", "Jusqu'à 3'500 CHF d'aides par année")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Users className="h-4 w-4 shrink-0" />
                  {t("comparators.subsidy.heroBullet3", "Familles, couples, personnes seules, étudiants")}
                </div>
              </div>
            </div>

            {/* Form */}
            <SubsidyForm />

            {/* Text Content - En bas */}
            <div className="max-w-3xl mx-auto text-center mt-12 pt-8 border-t border-border/50">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <HandCoins className="h-4 w-4" />
                {t("comparators.subsidy.badge")}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("comparators.subsidy.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("comparators.subsidy.subtitle")}
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("comparators.trust.free")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("comparators.trust.noCommitment")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("comparators.trust.dataProtected")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparateurSubside;
