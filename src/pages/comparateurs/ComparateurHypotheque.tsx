import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import MortgageForm from "@/components/forms/MortgageForm";
import { Building2, CheckCircle } from "lucide-react";

const ComparateurHypotheque = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {/* Form First */}
            <MortgageForm />

            {/* Text Content - En bas */}
            <div className="max-w-3xl mx-auto text-center mt-12 pt-8 border-t border-border/50">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Building2 className="h-4 w-4" />
                {t("comparators.mortgage.badge")}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t("comparators.mortgage.title")}
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                {t("comparators.mortgage.subtitle")}
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

export default ComparateurHypotheque;
