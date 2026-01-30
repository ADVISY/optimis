import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import CarInsuranceForm from "@/components/forms/CarInsuranceForm";
import { Car, CheckCircle } from "lucide-react";

const ComparateurVoiture = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Car className="h-4 w-4" />
                {t("comparators.car.badge")}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {t("comparators.car.title")}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t("comparators.car.subtitle")}
              </p>
            </div>

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

            <CarInsuranceForm />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparateurVoiture;
