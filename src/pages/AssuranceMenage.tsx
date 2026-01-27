import { Home, Shield, Clock, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";

const features = [
  { icon: Shield, title: "RC & Ménage", description: "Protection complète du foyer" },
  { icon: Clock, title: "Comparaison rapide", description: "En 2 minutes seulement" },
  { icon: CheckCircle, title: "Économies garanties", description: "Jusqu'à 50% d'économies" },
];

const AssuranceMenage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Assurance Ménage en{" "}
                <span className="text-gradient-optimis">Suisse</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Protégez votre foyer et vos biens avec une assurance RC ménage 
                adaptée à vos besoins.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Home className="h-5 w-5" />
                  Comparer les offres
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src={llamaMascot}
                alt="Mascotte Optimis"
                className="h-64 w-auto md:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Form Placeholder */}
      <section className="bg-secondary/30 py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground">
              Obtenez votre devis gratuit
            </h2>
            <p className="mb-8 text-muted-foreground">
              Comparez les meilleures assurances ménage du marché.
            </p>
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground">
                  Formulaire de comparaison à venir...
                </p>
                <Button className="mt-6">Demander un devis</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceMenage;
