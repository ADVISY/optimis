import { Smartphone, CreditCard, FileX, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";

const services = [
  {
    icon: Smartphone,
    title: "Forfait Mobile",
    description: "Comparez les abonnements mobiles et économisez plus de 200 CHF par an.",
    href: "/services/mobile",
  },
  {
    icon: CreditCard,
    title: "Subside Assurance",
    description: "Vérifiez votre éligibilité aux subsides d'assurance maladie.",
    href: "/blog/subside-dassurance-maladie-comment-ca-marche-et-comment-faire-sa-demande",
  },
  {
    icon: FileX,
    title: "Résiliation",
    description: "Résilier facilement votre assurance actuelle avec nos modèles de lettres.",
    href: "/blog/tout-savoir-sur-la-resiliation-de-votre-assurance-assura",
  },
];

const Services = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Nos{" "}
                <span className="text-gradient-optimis">Services</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Découvrez tous nos services pour vous accompagner dans vos 
                démarches et optimiser vos dépenses.
              </p>
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

      {/* Services Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <Link key={service.title} to={service.href}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/30 py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            Besoin d'aide ?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Nos conseillers sont disponibles pour répondre à toutes vos questions.
          </p>
          <Button size="lg" asChild>
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
              Prendre rendez-vous
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
