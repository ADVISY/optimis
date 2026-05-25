import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import Pillar3Form from "@/components/forms/Pillar3Form";
import { PiggyBank, CheckCircle, Clock, BadgePercent, ShieldCheck } from "lucide-react";

const ComparateurPilier3 = () => {
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
                {t("comparators.pillar3.heroTitle", "COMPARATEUR 3ÈME PILIER 2026 : TROUVEZ LA MEILLEURE OFFRE")}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-3 max-w-xl mx-auto">
                {t("comparators.pillar3.heroSubtitle", "Comparez les meilleurs 3ème piliers et maximisez vos économies d'impôts.")}
              </p>
              <div className="flex flex-col items-start gap-1.5 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  {t("comparators.pillar3.heroBullet1", "En 2 minutes")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <BadgePercent className="h-4 w-4 shrink-0" />
                  {t("comparators.pillar3.heroBullet2", "Jusqu'à 2'500 CHF d'économies d'impôts")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  {t("comparators.pillar3.heroBullet3", "Prévoyance et épargne optimisées")}
                </div>
              </div>
            </div>

            {/* Form */}
            <Pillar3Form />

            {/* Text Content - En bas */}
            <div className="max-w-3xl mx-auto text-center mt-12 pt-8 border-t border-border/50">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <PiggyBank className="h-4 w-4" />
                {t("comparators.pillar3.badge")}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("comparators.pillar3.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("comparators.pillar3.subtitle")}
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

export default ComparateurPilier3;
