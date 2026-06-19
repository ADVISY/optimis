import Layout from "@/components/layout/Layout";
import ComplementaryInsuranceForm from "@/components/forms/ComplementaryInsuranceForm";
import { CheckCircle, HeartPulse, Shield, BadgePercent } from "lucide-react";

const ComparateurComplementaire = () => {
  return (
    <Layout>
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-20">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <HeartPulse className="h-4 w-4" />
              Assurances complémentaires LCA
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Comparez et optimisez vos assurances complémentaires
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Hospitalisation, dentaire, fitness, médecine alternative… Recevez une offre sur mesure
              et économisez jusqu'à 40% sur vos primes.
            </p>
          </div>

          <ComplementaryInsuranceForm />

          <div className="max-w-3xl mx-auto mt-10 grid sm:grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">100% gratuit & sans engagement</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Données protégées (nLPD)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <BadgePercent className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Jusqu'à 40% d'économies</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ComparateurComplementaire;
