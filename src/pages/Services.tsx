import { Smartphone, CreditCard, FileX, Car, Heart, Scale, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LocalizedLink from "@/components/LocalizedLink";
import llamaMascot from "@/assets/llama-mascot.png";
import { resolveLegacyImageUrl } from "@/data/legacyImageResolver";

const Services = () => {
  const { t } = useTranslation();

  const quickLinks = [
    { labelKey: "nav.carInsurance", href: "/assurance-voiture", icon: Car },
    { labelKey: "nav.healthInsurance", href: "/assurance-sante", icon: Heart },
    { labelKey: "nav.legalProtection", href: "/protection-juridique", icon: Scale },
    { labelKey: "nav.homeInsurance", href: "/assurance-menage", icon: Home },
  ];

  const services = [
    {
      icon: Smartphone,
      titleKey: "services.mobilePackage",
      descKey: "services.mobilePackageDesc",
      href: "/forfait-mobile",
      content: "services.mobileContent",
    },
    {
      icon: CreditCard,
      titleKey: "services.subsidy",
      descKey: "services.subsidyDesc",
      href: "/subside-assurance-maladie",
      content: "services.subsidyContent",
    },
    {
      icon: FileX,
      titleKey: "services.termination",
      descKey: "services.terminationDesc",
      href: "/resiliation",
      content: "services.terminationContent",
    },
  ];

  return (
    <Layout>
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <LocalizedLink to="/" className="hover:text-primary">{t('common.home')}</LocalizedLink> / {t('services.title')}
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                {t('services.title')}
              </h1>
              <p className="text-lg text-muted-foreground">
                {t('services.heroSubtitle')}
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

      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            {t('services.howCanWeHelp')}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {services.map((service) => (
              <Card key={service.titleKey} className="h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-primary">
                <CardContent className="flex flex-col p-8">
                  <div className="mb-6 rounded-full bg-primary/10 p-4 w-fit">
                    <service.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {t(service.titleKey)}
                  </h3>
                  <p className="text-muted-foreground mb-4 flex-grow">
                    {t(service.descKey)}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    {t(service.content)}
                  </p>
                  <Button asChild className="w-full">
                    <LocalizedLink to={service.href}>
                      {t('common.readMore')}
                    </LocalizedLink>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Smartphone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{t('services.mobilePackage')}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{t('services.mobileDetailedDesc')}</p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li>• {t('services.mobileFeature1')}</li>
                  <li>• {t('services.mobileFeature2')}</li>
                  <li>• {t('services.mobileFeature3')}</li>
                </ul>
                <Button asChild>
                  <LocalizedLink to="/forfait-mobile">
                    {t('services.compareMobile')}
                  </LocalizedLink>
                </Button>
              </div>
              <div className="flex justify-center">
                <img 
                  src={resolveLegacyImageUrl("mobile-phone.png")}
                  alt="Forfait Mobile"
                  className="max-w-xs"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div className="order-2 md:order-1 flex justify-center">
                <img 
                  src={resolveLegacyImageUrl("coins-5946827.jpg")}
                  alt="Subside"
                  className="max-w-xs rounded-lg shadow-lg"
                  loading="lazy"
                />
              </div>
              <div className="order-1 md:order-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CreditCard className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{t('services.subsidy')}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{t('services.subsidyDetailedDesc')}</p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li>• {t('services.subsidyFeature1')}</li>
                  <li>• {t('services.subsidyFeature2')}</li>
                  <li>• {t('services.subsidyFeature3')}</li>
                </ul>
                <Button asChild>
                  <LocalizedLink to="/subside-assurance-maladie">
                    {t('services.requestSubsidy')}
                  </LocalizedLink>
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="grid gap-8 md:grid-cols-2 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <FileX className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">{t('services.termination')}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{t('services.terminationDetailedDesc')}</p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li>• {t('services.terminationFeature1')}</li>
                  <li>• {t('services.terminationFeature2')}</li>
                  <li>• {t('services.terminationFeature3')}</li>
                </ul>
                <Button asChild>
                  <LocalizedLink to="/resiliation">
                    {t('services.startTermination')}
                  </LocalizedLink>
                </Button>
              </div>
              <div className="flex justify-center">
                <img 
                  src={resolveLegacyImageUrl("contract-cancel.png")}
                  alt="Résiliation"
                  className="max-w-xs"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-24 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('services.needHelp')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('services.helpDescription')}
              </p>
              <Button size="lg" asChild>
                <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                  {t('common.takeAppointment')}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
