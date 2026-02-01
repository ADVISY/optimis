import { Car, Heart, Scale, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import mascotPointing from "@/assets/mascotte-optimis-hd.png";
import LocalizedLink from "@/components/LocalizedLink";
import StatsBar from "@/components/home/StatsBar";
import InsuranceCardsCarousel from "@/components/home/InsuranceCardsCarousel";
import TestimonialsCarousel from "@/components/home/TestimonialsCarousel";
import BlogPreview from "@/components/home/BlogPreview";
import InsuranceDetails from "@/components/home/InsuranceDetails";

const Index = () => {
  const { t } = useTranslation();

  const insuranceCards = [
    {
      icon: Car,
      titleKey: "nav.carInsurance",
      href: "/assurance-voiture",
      color: "text-blue-600",
    },
    {
      icon: Heart,
      titleKey: "nav.healthInsurance",
      href: "/assurance-sante",
      color: "text-red-500",
    },
    {
      icon: Scale,
      titleKey: "nav.legalProtection",
      href: "/protection-juridique",
      color: "text-purple-600",
    },
    {
      icon: Home,
      titleKey: "nav.homeInsurance",
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

  return (
    <Layout>
      {/* Hero Section - Full viewport height to show everything above the fold */}
      <section className="gradient-optimis min-h-[calc(100vh-6rem)] flex flex-col justify-between overflow-visible relative pb-4 md:pb-8">
        <div className="container relative flex-1 flex items-center">
          <div className="grid items-center gap-4 lg:grid-cols-2 w-full py-6 md:py-8 lg:py-12">
            {/* Mobile: centered content */}
            <div className="space-y-3 md:space-y-5 animate-fade-in z-10 relative text-center md:text-left">
              {/* 5 Gold Stars */}
              <div className="flex gap-1 md:gap-1.5 animate-fade-in-delay justify-center md:justify-start">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-xl md:text-3xl drop-shadow-sm">★</span>
                ))}
              </div>
              <h1 className="font-heading text-2xl font-black leading-[1.05] text-foreground uppercase md:text-3xl lg:text-4xl xl:text-5xl tracking-tight">
                <span className="block">{t('home.heroLine1')}</span>
                <span className="block">{t('home.heroLine2')}</span>
                <span className="block text-gradient-optimis">{t('home.heroLine3')}</span>
              </h1>
              <p className="text-sm md:text-xl text-muted-foreground max-w-lg leading-relaxed mx-auto md:mx-0">
                {t('home.heroSubtitle')}
              </p>
              
              {/* Desktop only buttons */}
              <div className="hidden md:flex flex-wrap gap-4 pt-1 justify-center md:justify-start">
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
            
            {/* Mascot - desktop: positioned right, mobile: centered at bottom */}
            <div className="hidden lg:flex justify-end items-end absolute right-4 xl:right-8 2xl:right-16 bottom-0 translate-y-16 z-10">
              <img
                src={mascotPointing}
                alt="Mascotte Optimis"
                className="h-[520px] xl:h-[600px] 2xl:h-[680px] w-auto drop-shadow-2xl animate-fade-in"
              />
            </div>
          </div>
        </div>

        {/* Mobile mascot - centered, large */}
        <div className="md:hidden flex justify-center -mb-4 relative z-10">
          <img
            src={mascotPointing}
            alt="Mascotte Optimis"
            className="h-56 w-auto drop-shadow-2xl animate-fade-in"
          />
        </div>
        
        {/* Quick Selection Bar */}
        <div className="container relative z-20 mt-2 md:mt-6">
          <div className="bg-background rounded-xl md:rounded-2xl shadow-premium p-3 md:p-4 border">
            {/* Mobile: vertical list, centered */}
            <div className="md:hidden flex flex-col gap-1">
              {insuranceCards.map((card) => (
                <LocalizedLink
                  key={card.href}
                  to={card.href}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all duration-300 hover:bg-secondary group"
                >
                  <div className={`${card.color} transition-transform duration-300 group-hover:scale-110`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-sm text-foreground">
                    {t(card.titleKey)}
                  </span>
                </LocalizedLink>
              ))}
            </div>
            {/* Desktop: horizontal grid */}
            <div className="hidden md:grid grid-cols-4 gap-3">
              {insuranceCards.map((card) => (
                <LocalizedLink
                  key={card.href}
                  to={card.href}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-secondary hover:-translate-y-1 hover:shadow-card group"
                >
                  <div className={`${card.color} transition-transform duration-300 group-hover:scale-110`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <span className="font-semibold text-base text-foreground">
                    {t(card.titleKey)}
                  </span>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar - just below hero */}
      <StatsBar />

      {/* How it Works Section */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('home.howItWorks')}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              {t('home.bestOffersIn4Steps')}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center text-center group"
              >
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-10 hidden h-0.5 w-full bg-border lg:block" />
                )}
                <div className="relative z-10 mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground shadow-lg transition-all duration-300 group-hover:scale-110">
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  {t(step.titleKey)}
                </h3>
                <p className="text-muted-foreground">
                  {t(step.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Cards Carousel */}
      <InsuranceCardsCarousel />

      {/* Client Testimonials */}
      <TestimonialsCarousel />

      {/* Insurance Details */}
      <InsuranceDetails />

      {/* Blog Preview */}
      <BlogPreview />

      {/* CTA Section */}
      <section className="gradient-optimis py-16 md:py-20">
        <div className="container text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('home.readyToSave')}
          </h2>
          <p className="mb-8 text-muted-foreground text-lg">
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
