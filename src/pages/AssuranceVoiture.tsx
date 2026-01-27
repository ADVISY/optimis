import { Car, Heart, Scale, Home, Star, Quote } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/LocalizedLink";

const insuranceOffers = [
  {
    name: "AXA",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/0001_0003782804_2-640.jpg",
    price: "800 CHF",
  },
  {
    name: "La Mobilière",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/images.png",
    price: "800 CHF",
  },
  {
    name: "Allianz",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/allianz-logo.svg",
    price: "800 CHF",
  },
  {
    name: "Zurich",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/thumb_3715_page_big.png",
    price: "800 CHF",
  },
  {
    name: "Generali",
    logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg",
    price: "800 CHF",
  },
];

const testimonials = [
  {
    name: "Laurent Weber",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-1.jpeg",
    textKey: "testimonial1",
  },
  {
    name: "Claire Muller",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-4.jpeg",
    textKey: "testimonial2",
  },
  {
    name: "Philippe Dupont",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-3.jpeg",
    textKey: "testimonial3",
  },
  {
    name: "Sophie Girard",
    image: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/telechargement-2.jpeg",
    textKey: "testimonial4",
  },
];

const partners = [
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
  { name: "Helsana", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/helsana-logo.svg" },
  { name: "Groupe Mutuel", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/logo-groupe-mutuel.svg" },
  { name: "SWICA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/SWICA_Logo_Mobile.svg" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
];

const AssuranceVoiture = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { labelKey: "nav.carInsurance", href: "/assurance-voiture", icon: Car },
    { labelKey: "nav.healthInsurance", href: "/assurance-sante", icon: Heart },
    { labelKey: "nav.legalProtection", href: "/protection-juridique", icon: Scale },
    { labelKey: "nav.homeInsurance", href: "/assurance-menage", icon: Home },
  ];

  const formSteps = [
    { key: "carInsurance.yourCar" },
    { key: "carInsurance.carUsage" },
    { key: "carInsurance.yourInfo" },
    { key: "carInsurance.yourCoverage" },
    { key: "carInsurance.yourContact" },
  ];

  // Static testimonial texts (could be added to translation files if needed)
  const testimonialTexts: Record<string, string> = {
    testimonial1: "Utiliser Optimis a été une excellente décision. J'ai trouvé une assurance habitation avec des conditions bien meilleures que mon précédent contrat, et à un prix inférieur. Leur site est très convivial et m'a permis de prendre une décision éclairée en toute confiance. Merci à l'équipe d'Optimis pour leur aide précieuse.",
    testimonial2: "Optimis a transformé ma manière de comparer les assurances. En quelques clics, j'ai pu comparer différentes offres et choisir celle qui convenait le mieux à mes besoins. Leur service client est également très réactif et m'a aidée à clarifier certaines questions. Une expérience sans stress et très satisfaisante !",
    testimonial3: "Je suis vraiment impressionné par les services d'Optimis. Ils ont simplifié la recherche d'assurance, me permettant de trouver rapidement la meilleure offre pour ma famille. Grâce à leur plateforme intuitive, j'ai économisé du temps et de l'argent. Je recommande vivement Optimis à tous ceux qui cherchent à optimiser leur couverture d'assurance.",
    testimonial4: "Je ne savais pas par où commencer pour trouver une nouvelle assurance auto, mais Optimis m'a grandement facilité la tâche. Les comparaisons sont claires et détaillées, et j'ai rapidement trouvé une offre qui correspondait parfaitement à mes besoins et à mon budget. Je suis très satisfaite du service et je le recommande sans hésitation.",
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <LocalizedLink to="/" className="hover:text-primary">{t('common.home')}</LocalizedLink> / {t('carInsurance.title')}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t('carInsurance.title')}
              </h1>
              <p className="text-xl text-muted-foreground">
                {t('carInsurance.heroSubtitle')}
              </p>
              <p className="text-lg text-muted-foreground">
                {t('carInsurance.findPerfectPlan')}
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
              <LocalizedLink
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors font-medium"
              >
                <link.icon className="h-5 w-5 text-primary" />
                {t(link.labelKey)}
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Offers */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-10">
            <p className="text-muted-foreground mb-2">{t('carInsurance.offersForYou')}</p>
            <p className="text-sm text-muted-foreground">{t('carInsurance.clickOffer')}</p>
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
                  <p className="text-xs text-muted-foreground mb-1">{t('carInsurance.estimatedBudget')}</p>
                  <p className="text-primary font-semibold">{offer.price}</p>
                  <Button className="w-full mt-4" variant="outline">
                    {t('carInsurance.interestedInOffer')}
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
            <p className="text-sm font-semibold text-primary mb-2">{t('carInsurance.clientReviews')}</p>
            <h2 className="text-3xl font-bold text-foreground">{t('carInsurance.testimonials')}</h2>
            <p className="text-muted-foreground mt-2">{t('carInsurance.whatClientsSay')}</p>
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
                    {testimonialTexts[testimonial.textKey]}
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
            <h3 className="text-sm font-semibold text-primary mb-2">{t('common.partners')}</h3>
            <p className="text-lg text-foreground">
              {t('common.partnersDescription')}
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
                    key={step.key}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <span className="w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    {t(step.key)}
                  </div>
                ))}
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-4">{t('carInsurance.yourCar')}</h2>
                <p className="text-muted-foreground mb-8">{t('carInsurance.whichCarToInsure')}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Button variant="outline" className="px-8 py-6">
                    {t('carInsurance.currentCar')}
                  </Button>
                  <Button variant="outline" className="px-8 py-6">
                    {t('carInsurance.carToBuy')}
                  </Button>
                </div>

                <p className="text-muted-foreground mb-6">{t('carInsurance.carBrand')}</p>
                
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
                  {t('common.continue')}
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
                {t('carInsurance.readyToSave')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('carInsurance.getEstimate')}
              </p>
              <Button size="lg" className="gap-2">
                <Car className="h-5 w-5" />
                {t('healthInsurance.compareNow')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceVoiture;
