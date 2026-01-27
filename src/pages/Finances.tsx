import { Banknote, Shield, Clock, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";

const features = [
  { icon: Shield, title: "3ème Pilier", description: "Préparez votre retraite" },
  { icon: Clock, title: "Économies d'impôts", description: "Jusqu'à 7056 CHF/an" },
  { icon: CheckCircle, title: "Conseil gratuit", description: "Sans engagement" },
];

const Finances = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Assurance Vie &{" "}
                <span className="text-gradient-optimis">3ème Pilier</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Préparez votre avenir et économisez sur vos impôts avec nos 
                solutions de prévoyance adaptées.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Banknote className="h-5 w-5" />
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
              Simulez vos économies d'impôts
            </h2>
            <p className="mb-8 text-muted-foreground">
              Découvrez combien vous pouvez économiser avec le 3ème pilier.
            </p>
            <Card>
              <CardContent className="p-8">
                <p className="text-muted-foreground">
                  Formulaire de simulation à venir...
                </p>
                <Button className="mt-6">Calculer mes économies</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Finances;
