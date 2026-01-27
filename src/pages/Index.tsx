import { Car, Heart, Scale, Home } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";

const insuranceCards = [
  {
    icon: Car,
    title: "Assurance Voiture",
    description: "Comparez les meilleures offres auto",
    href: "/assurance-voiture",
    color: "text-blue-600",
  },
  {
    icon: Heart,
    title: "Assurance Santé",
    description: "Trouvez la couverture idéale",
    href: "/assurance-sante",
    color: "text-red-500",
  },
  {
    icon: Scale,
    title: "Protection Juridique",
    description: "Protégez vos droits",
    href: "/protection-juridique",
    color: "text-purple-600",
  },
  {
    icon: Home,
    title: "Assurance Ménage",
    description: "Sécurisez votre foyer",
    href: "/assurance-menage",
    color: "text-orange-500",
  },
];

const steps = [
  { number: "1", title: "Choisissez", description: "Sélectionnez votre type d'assurance" },
  { number: "2", title: "Remplissez", description: "Complétez le formulaire en 2 minutes" },
  { number: "3", title: "Comparez", description: "Recevez les meilleures offres" },
  { number: "4", title: "Économisez", description: "Jusqu'à 40% d'économies" },
];

const stats = [
  { value: "10,000+", label: "Utilisateurs satisfaits" },
  { value: "95%", label: "Taux de recommandation" },
  { value: "20+", label: "Partenaires assureurs" },
];

const testimonials = [
  {
    name: "Laurent Weber",
    location: "Genève",
    text: "Grâce à Optimis, j'ai économisé plus de 800 CHF sur mon assurance auto. Service rapide et professionnel !",
  },
  {
    name: "Claire Muller",
    location: "Lausanne",
    text: "Excellente expérience ! Le comparateur est simple d'utilisation et j'ai trouvé une assurance santé parfaite pour ma famille.",
  },
  {
    name: "Marc Dubois",
    location: "Zurich",
    text: "Je recommande vivement Optimis. L'équipe m'a accompagné tout au long du processus de changement d'assurance.",
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6 animate-fade-in">
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
                Comparez les assurances et trouvez les{" "}
                <span className="text-gradient-optimis">meilleures offres</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl">
                Le comparateur suisse qui vous aide à économiser sur vos
                assurances en quelques clics.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="text-base">
                  Comparer maintenant
                </Button>
                <Button size="lg" variant="outline" className="text-base">
                  En savoir plus
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src={llamaMascot}
                alt="Mascotte Optimis"
                className="h-64 w-auto animate-fade-in md:h-80 lg:h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Selector */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Quelle assurance cherchez-vous ?
            </h2>
            <p className="text-muted-foreground">
              Sélectionnez un type d'assurance pour commencer votre comparaison
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {insuranceCards.map((card) => (
              <Link key={card.href} to={card.href}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className={`mb-4 rounded-full bg-secondary p-4 ${card.color}`}>
                      <card.icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {card.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Comment ça marche ?
            </h2>
            <p className="text-muted-foreground">
              Obtenez les meilleures offres en 4 étapes simples
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
                )}
                <div className="relative z-10 mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid gap-8 text-center sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-2">
                <p className="text-4xl font-bold text-primary md:text-5xl">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Ce que disent nos clients
            </h2>
            <p className="text-muted-foreground">
              Des milliers de Suisses nous font confiance
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full">
                <CardContent className="p-6">
                  <p className="mb-4 text-muted-foreground">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-optimis py-16 md:py-20">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Prêt à économiser sur vos assurances ?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Rejoignez plus de 10,000 utilisateurs satisfaits
          </p>
          <Button size="lg" className="text-base">
            Commencer ma comparaison gratuite
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
