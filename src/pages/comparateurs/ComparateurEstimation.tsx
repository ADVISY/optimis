import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import RealEstateForm from "@/components/forms/RealEstateForm";
import { Shield, CheckCircle, Clock, Home, MapPin } from "lucide-react";

const ComparateurEstimation = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-5 md:mb-8">
              <div className="flex gap-1 justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-lg md:text-xl drop-shadow-sm">★</span>
                ))}
              </div>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-foreground tracking-tight uppercase mb-2">
                {t("realEstate.heroTitle", "ESTIMATION IMMOBILIÈRE GRATUITE EN SUISSE")}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-3 max-w-xl mx-auto">
                {t("realEstate.heroSubtitle", "Obtenez une estimation précise de votre bien immobilier en quelques minutes.")}
              </p>
              <div className="flex flex-col items-start gap-1.5 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  {t("realEstate.heroBullet1", "Estimation en 2 minutes")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Home className="h-4 w-4 shrink-0" />
                  {t("realEstate.heroBullet2", "Tous types de biens : appartement, maison, villa")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {t("realEstate.heroBullet3", "Analyse locale par des experts suisses")}
                </div>
              </div>
            </div>

            <RealEstateForm />

            <div className="max-w-3xl mx-auto text-center mt-12 pt-8 border-t border-border/50">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                {t("realEstate.badge", "Estimation immobilière")}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("realEstate.seoTitle", "Estimez la valeur de votre bien immobilier")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("realEstate.seoDescription", "Que vous souhaitiez vendre, refinancer ou simplement connaître la valeur de votre bien, notre service d'estimation vous accompagne.")}
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

export default ComparateurEstimation;
