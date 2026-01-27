import { Link } from "react-router-dom";
import { Car, Heart, Scale, Home, Shield, Star, Quote } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";

const quickLinks = [
  { label: "Assurance Voiture", href: "/assurance-voiture", icon: Car },
  { label: "Assurance Santé", href: "/assurance-sante", icon: Heart },
  { label: "Protection Juridique", href: "/protection-juridique", icon: Scale },
  { label: "Assurance Ménage", href: "/assurance-menage", icon: Home },
];

const insuranceOffers = [
  {
    name: "AXA",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/0001_0003782804_2-640.jpg",
    price: "À partir de 800 CHF",
  },
  {
    name: "La Mobilière",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/images.png",
    price: "À partir de 800 CHF",
  },
  {
    name: "Allianz",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/allianz-logo.svg",
    price: "À partir de 800 CHF",
  },
  {
    name: "Zurich",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/thumb_3715_page_big.png",
    price: "À partir de 800 CHF",
  },
  {
    name: "Generali",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg",
    price: "À partir de 800 CHF",
  },
];

const testimonials = [
  {
    name: "Laurent Weber",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-1.jpeg",
    text: "Utiliser Optimis a été une excellente décision. J'ai trouvé une assurance habitation avec des conditions bien meilleures que mon précédent contrat, et à un prix inférieur. Leur site est très convivial et m'a permis de prendre une décision éclairée en toute confiance. Merci à l'équipe d'Optimis pour leur aide précieuse.",
  },
  {
    name: "Claire Muller",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-4.jpeg",
    text: "Optimis a transformé ma manière de comparer les assurances. En quelques clics, j'ai pu comparer différentes offres et choisir celle qui convenait le mieux à mes besoins. Leur service client est également très réactif et m'a aidée à clarifier certaines questions. Une expérience sans stress et très satisfaisante !",
  },
  {
    name: "Philippe Dupont",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-3.jpeg",
    text: "Je suis vraiment impressionné par les services d'Optimis. Ils ont simplifié la recherche d'assurance, me permettant de trouver rapidement la meilleure offre pour ma famille. Grâce à leur plateforme intuitive, j'ai économisé du temps et de l'argent. Je recommande vivement Optimis à tous ceux qui cherchent à optimiser leur couverture d'assurance.",
  },
  {
    name: "Sophie Girard",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-2.jpeg",
    text: "Je ne savais pas par où commencer pour trouver une nouvelle assurance auto, mais Optimis m'a grandement facilité la tâche. Les comparaisons sont claires et détaillées, et j'ai rapidement trouvé une offre qui correspondait parfaitement à mes besoins et à mon budget. Je suis très satisfaite du service et je le recommande sans hésitation.",
  },
];

const partners = [
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
  { name: "Helsana", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/helsana-logo.svg" },
  { name: "Groupe Mutuel", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/logo-groupe-mutuel.svg" },
  { name: "SWICA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/SWICA_Logo_Mobile.svg" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
];

const formSteps = [
  "Votre voiture",
  "Utilisation de votre voiture",
  "Vos informations",
  "Votre couverture",
  "Vos coordonnées",
];

const AssuranceVoiture = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <Link to="/" className="hover:text-primary">Accueil</Link> / Assurance voiture
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Assurance voiture
              </h1>
              <p className="text-xl text-muted-foreground">
                Protégez-vous et vos proches grâce à une assurance voiture.
              </p>
              <p className="text-lg text-muted-foreground">
                Trouvez le plan parfait pour vos besoins.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/0001_0003782804_2-640.jpg"
                alt="Assurance voiture"
                className="h-48 w-auto md:h-64 rounded-xl shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-background border-b">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors font-medium"
              >
                <link.icon className="h-5 w-5 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Offers */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-muted-foreground mb-2">Ces offres là sont faites pour vous !</p>
            <p className="text-sm text-muted-foreground">Cliquez sur l'offre qui vous intéresse</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {insuranceOffers.map((offer) => (
              <Card key={offer.name} className="hover:shadow-lg transition-shadow cursor-pointer hover:border-primary">
                <CardContent className="p-6 text-center">
                  <div className="h-16 flex items-center justify-center mb-4">
                    <img
                      src={offer.logo}
                      alt={offer.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{offer.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">Budget estimé</p>
                  <p className="text-primary font-semibold">{offer.price}</p>
                  <Button className="w-full mt-4" variant="outline">
                    Cette offre m'intéresse
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary mb-2">Avis Clients</p>
            <h2 className="text-3xl font-bold text-foreground">TÉMOIGNAGES CLIENTS</h2>
            <p className="text-muted-foreground mt-2">Voici ce que nos clients disent de nous</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <Quote className="h-6 w-6 text-primary/30 mb-2" />
                  <p className="text-sm text-muted-foreground line-clamp-6">
                    {testimonial.text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-primary mb-2">NOS PARTENAIRES</h3>
            <p className="text-lg text-foreground">
              Parce que nous sommes Indépendant, nous trouvons les meilleures offres adaptées à vos besoins.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <img
                key={partner.name}
                src={partner.logo}
                alt={partner.name}
                className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-primary/5">
        <div className="container">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              {/* Form Steps */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {formSteps.map((step, index) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">Votre voiture</h2>
                <p className="text-muted-foreground mb-8">Quelle voiture souhaitez-vous assurer ?</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button variant="outline" className="px-8 py-6">
                    Ma voiture actuelle
                  </Button>
                  <Button variant="outline" className="px-8 py-6">
                    Une voiture que je souhaite acheter
                  </Button>
                </div>

                <p className="text-muted-foreground mb-6">Quelle est la marque de votre véhicule ?</p>
                
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4 mb-8">
                  {["ABARTH", "AIWAYS", "ALFA ROMEO", "ALPINE", "ASTON MARTIN", "AUDI", "BENTLEY", "BMW"].map((brand) => (
                    <div
                      key={brand}
                      className="p-3 border rounded-lg hover:border-primary cursor-pointer transition-colors"
                    >
                      <p className="text-xs text-center text-muted-foreground">{brand}</p>
                    </div>
                  ))}
                </div>

                <Button size="lg" className="gap-2">
                  <Car className="h-5 w-5" />
                  Continuer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-24 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Prêt à économiser sur votre assurance auto ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Obtenez une estimation gratuite et sans engagement en quelques clics.
              </p>
              <Button size="lg" className="gap-2">
                <Car className="h-5 w-5" />
                Comparer maintenant
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceVoiture;
