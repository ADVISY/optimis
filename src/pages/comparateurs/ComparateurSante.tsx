import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import HealthInsuranceForm from "@/components/forms/HealthInsuranceForm";
import { Shield, CheckCircle } from "lucide-react";

const ComparateurSante = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        {/* Hero Section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                {t("comparators.health.badge")}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {t("comparators.health.title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("comparators.health.subtitle")}
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm text-muted-foreground">
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

            {/* Form */}
            <HealthInsuranceForm />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparateurSante;
