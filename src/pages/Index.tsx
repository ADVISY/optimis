import { Car, Heart, Scale, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import LocalizedLink from "@/components/LocalizedLink";

const Index = () => {
  const { t } = useTranslation();

  const insuranceCards = [
    {
      icon: Car,
      titleKey: "nav.carInsurance",
      descriptionKey: "home.carInsuranceDesc",
      href: "/assurance-voiture",
      color: "text-blue-600",
    },
    {
      icon: Heart,
      titleKey: "nav.healthInsurance",
      descriptionKey: "home.healthInsuranceDesc",
      href: "/assurance-sante",
      color: "text-red-500",
    },
    {
      icon: Scale,
      titleKey: "nav.legalProtection",
      descriptionKey: "home.legalProtectionDesc",
      href: "/protection-juridique",
      color: "text-purple-600",
    },
    {
      icon: Home,
      titleKey: "nav.homeInsurance",
      descriptionKey: "home.homeInsuranceDesc",
      href: "/assurance-menage",
      color: "text-orange-500",
    },
  ];

  const steps = [
    { number: "1", titleKey: "home.step1Title", descriptionKey: "home.step1Desc" },
    { number: "2", titleKey: "home.step2Title", descriptionKey: "home.step2Desc" },
    { number: "3", titleKey: "home.step3Title", descriptionKey: "home.step3Desc" },
    { number: "4", titleKey: "home.step4Title", descriptionKey: "home.step4Desc" },
  ];

  const stats = [
    { value: "10,000+", labelKey: "stats.satisfiedUsers" },
    { value: "95%", labelKey: "stats.recommendationRate" },
    { value: "20+", labelKey: "stats.insurerPartners" },
  ];

  const testimonials = [
    {
      name: "Laurent Weber",
      location: "Genève",
      textKey: "testimonials.testimonial1",
    },
    {
      name: "Claire Muller",
      location: "Lausanne",
      textKey: "testimonials.testimonial2",
    },
    {
      name: "Marc Dubois",
      location: "Zurich",
      textKey: "testimonials.testimonial3",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24 lg:py-32 overflow-hidden">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6 animate-fade-in">
              {/* 5 Gold Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-2xl">★</span>
                ))}
              </div>
              <h1 className="font-heading text-4xl font-black leading-tight text-foreground uppercase md:text-5xl lg:text-6xl xl:text-7xl">
                <span className="block">{t('home.heroLine1')}</span>
                <span className="block">{t('home.heroLine2')}</span>
                <span className="block text-gradient-optimis">{t('home.heroLine3')}</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-lg">
                {t('home.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button asChild size="lg" className="text-base px-8 py-6 rounded-xl">
                  <LocalizedLink to="/assurance-sante">
                    {t('common.compareNow')}
                  </LocalizedLink>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 rounded-xl border-2">
                  <LocalizedLink to="/blog">
                    {t('common.readMore')}
                  </LocalizedLink>
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end relative">
              <img
                src={llamaMascot}
                alt="Mascotte Optimis"
                className="h-80 w-auto animate-fade-in md:h-[420px] lg:h-[500px] xl:h-[550px] drop-shadow-2xl"
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
              {t('home.whichInsurance')}
            </h2>
            <p className="text-muted-foreground">
              {t('home.selectInsurance')}
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {insuranceCards.map((card) => (
              <LocalizedLink key={card.href} to={card.href}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-6 text-center">
                    <div className={`mb-4 rounded-full bg-secondary p-4 ${card.color}`}>
                      <card.icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-foreground">
                      {t(card.titleKey)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(card.descriptionKey)}
                    </p>
                  </CardContent>
                </Card>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-secondary/30 py-16 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              {t('home.howItWorks')}
            </h2>
            <p className="text-muted-foreground">
              {t('home.bestOffersIn4Steps')}
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
                  {t(step.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(step.descriptionKey)}
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
              <div key={stat.labelKey} className="space-y-2">
                <p className="text-4xl font-bold text-primary md:text-5xl">
                  {stat.value}
                </p>
                <p className="text-muted-foreground">{t(stat.labelKey)}</p>
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
              {t('home.whatClientsSay')}
            </h2>
            <p className="text-muted-foreground">
              {t('home.thousandsTrust')}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full">
                <CardContent className="p-6">
                  <p className="mb-4 text-muted-foreground">
                    "{t(testimonial.textKey)}"
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
            {t('home.readyToSave')}
          </h2>
          <p className="mb-8 text-muted-foreground">
            {t('home.joinUsers')}
          </p>
          <Button asChild size="lg" className="text-base">
            <LocalizedLink to="/assurance-sante">
              {t('home.startFreeComparison')}
            </LocalizedLink>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
