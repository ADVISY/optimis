import { Car, Heart, Scale, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import mascotPointing from "@/assets/mascotte-optimis-hd.png";
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
      {/* Hero Section - Premium & Engaging */}
      <section className="gradient-optimis pt-6 md:pt-8 lg:pt-10 pb-8 md:pb-10 overflow-visible relative">
        <div className="container relative">
          <div className="grid items-start gap-4 lg:grid-cols-2 min-h-[380px] lg:min-h-[420px]">
            <div className="space-y-4 md:space-y-5 animate-fade-in z-10 relative pt-4 md:pt-6 lg:pt-8">
              {/* 5 Gold Stars */}
              <div className="flex gap-1.5 animate-fade-in-delay">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-2xl md:text-3xl drop-shadow-sm">★</span>
                ))}
              </div>
              <h1 className="font-heading text-4xl font-black leading-[1.05] text-foreground uppercase md:text-5xl lg:text-6xl xl:text-7xl tracking-tight">
                <span className="block">{t('home.heroLine1')}</span>
                <span className="block">{t('home.heroLine2')}</span>
                <span className="block text-gradient-optimis">{t('home.heroLine3')}</span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl max-w-lg leading-relaxed">
                {t('home.heroSubtitle')}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="xl" className="animate-fade-in-delay-2">
                  <LocalizedLink to="/assurance-sante">
                    {t('common.compareNow')}
                  </LocalizedLink>
                </Button>
                <Button asChild size="lg" variant="outline" className="animate-fade-in-delay-2">
                  <LocalizedLink to="/blog">
                    {t('common.readMore')}
                  </LocalizedLink>
                </Button>
              </div>
            </div>
            
            {/* Mascot - large, behind the selection bar */}
            <div className="hidden lg:flex justify-end items-end absolute right-0 xl:right-4 2xl:right-12 bottom-0 translate-y-20 z-10">
              <img
                src={mascotPointing}
                alt="Mascotte Optimis"
                className="h-[560px] xl:h-[640px] 2xl:h-[720px] w-auto drop-shadow-2xl animate-fade-in"
              />
            </div>
          </div>
        </div>
        
        {/* Quick Selection Bar - Premium - above mascot */}
        <div className="container relative z-20 mt-4 lg:mt-2">
          <div className="bg-background rounded-2xl shadow-premium p-5 md:p-8 border">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {insuranceCards.map((card) => (
                <LocalizedLink
                  key={card.href}
                  to={card.href}
                  className="flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl transition-all duration-300 hover:bg-secondary hover:-translate-y-1 hover:shadow-card group"
                >
                  <div className={`${card.color} transition-transform duration-300 group-hover:scale-110`}>
                    <card.icon className="h-6 w-6 md:h-7 md:w-7" />
                  </div>
                  <span className="font-semibold text-sm md:text-base lg:text-lg text-foreground">
                    {t(card.titleKey)}
                  </span>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Insurance Selector - Enhanced */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="container">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-headline mb-6 text-foreground">
              {t('home.whichInsurance')}
            </h2>
            <p className="text-body-lg text-muted-foreground">
              {t('home.selectInsurance')}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {insuranceCards.map((card, index) => (
              <LocalizedLink key={card.href} to={card.href} className="group">
                <Card className="h-full hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className={`mb-6 rounded-2xl bg-secondary p-5 ${card.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                      <card.icon className="h-10 w-10" />
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {t(card.titleKey)}
                    </h3>
                    <p className="text-base text-muted-foreground leading-relaxed">
                      {t(card.descriptionKey)}
                    </p>
                  </CardContent>
                </Card>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Premium */}
      <section className="bg-secondary/30 py-20 md:py-28 lg:py-32">
        <div className="container">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-headline mb-6 text-foreground">
              {t('home.howItWorks')}
            </h2>
            <p className="text-body-lg text-muted-foreground">
              {t('home.bestOffersIn4Steps')}
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center group"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-12 hidden h-1 w-full bg-border/50 lg:block rounded-full" />
                )}
                <div className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-4xl font-black text-primary-foreground shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
                  {step.number}
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {t(step.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section - Impactful */}
      <section className="py-20 md:py-28 lg:py-32">
        <div className="container">
          <div className="grid gap-12 text-center sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.labelKey} className="space-y-4 group">
                <p className="text-5xl md:text-6xl lg:text-7xl font-black text-primary transition-transform duration-300 group-hover:scale-105">
                  {stat.value}
                </p>
                <p className="text-lg text-muted-foreground font-medium">{t(stat.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials - Premium Cards */}
      <section className="bg-secondary/30 py-20 md:py-28 lg:py-32">
        <div className="container">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-headline mb-6 text-foreground">
              {t('home.whatClientsSay')}
            </h2>
            <p className="text-body-lg text-muted-foreground">
              {t('home.thousandsTrust')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="h-full hover-lift">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-accent text-xl">★</span>
                    ))}
                  </div>
                  <p className="mb-6 text-lg text-foreground/80 leading-relaxed italic">
                    "{t(testimonial.textKey)}"
                  </p>
                  <div className="pt-4 border-t border-border">
                    <p className="font-bold text-lg text-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-base text-muted-foreground">
                      {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Compelling */}
      <section className="gradient-optimis py-20 md:py-28 lg:py-32">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-headline mb-6 text-foreground">
            {t('home.readyToSave')}
          </h2>
          <p className="mb-10 text-body-lg text-muted-foreground">
            {t('home.joinUsers')}
          </p>
          <Button asChild size="xl">
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
