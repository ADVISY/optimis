import { Smartphone, CreditCard, FileX } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LocalizedLink from "@/components/LocalizedLink";
import llamaMascot from "@/assets/llama-mascot.png";

const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Smartphone,
      titleKey: "services.mobilePackage",
      descKey: "services.mobilePackageDesc",
      href: "/services/mobile",
    },
    {
      icon: CreditCard,
      titleKey: "services.subsidy",
      descKey: "services.subsidyDesc",
      href: "/blog/subside-dassurance-maladie-comment-ca-marche-et-comment-faire-sa-demande",
    },
    {
      icon: FileX,
      titleKey: "services.termination",
      descKey: "services.terminationDesc",
      href: "/blog/tout-savoir-sur-la-resiliation-de-votre-assurance-assura",
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
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

      {/* Services Grid */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {services.map((service) => (
              <LocalizedLink key={service.titleKey} to={service.href}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-8 text-center">
                    <div className="mb-4 rounded-full bg-primary/10 p-4">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {t(service.titleKey)}
                    </h3>
                    <p className="text-muted-foreground">
                      {t(service.descKey)}
                    </p>
                  </CardContent>
                </Card>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-secondary/30 py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">
            {t('services.howCanWeHelp')}
          </h2>
          <p className="mb-8 text-muted-foreground">
            {t('services.helpDescription')}
          </p>
          <Button size="lg" asChild>
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
              {t('common.takeAppointment')}
            </a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Services;