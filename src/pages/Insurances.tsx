import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Heart, Shield, Home, Umbrella } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const Insurances = () => {
  const { t } = useTranslation();

  const insuranceTypes = [
    {
      icon: Heart,
      title: t('nav.healthInsurance'),
      description: t('home.healthInsuranceDesc'),
      link: "/assurance-sante",
      compareLink: "/assurance-maladie-landing"
    },
    {
      icon: Car,
      title: t('nav.carInsurance'),
      description: t('home.carInsuranceDesc'),
      link: "/assurance-voiture",
      compareLink: "/assurance-voiture-landing"
    },
    {
      icon: Home,
      title: t('nav.homeInsurance'),
      description: t('home.homeInsuranceDesc'),
      link: "/assurance-menage",
      compareLink: "/assurance-menage-landing"
    },
    {
      icon: Shield,
      title: t('nav.legalProtection'),
      description: t('home.legalProtectionDesc'),
      link: "/protection-juridique",
      compareLink: "/protection-juridique-landing"
    },
    {
      icon: Umbrella,
      title: t('nav.lifeInsurance'),
      description: t('insurances.lifeInsuranceDesc'),
      link: "/assurance-vie",
      compareLink: "/3eme-pilier-offres"
    },
  ];

  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-4">{t('insurances.title')}</h1>
        <p className="text-xl text-muted-foreground mb-8">{t('insurances.subtitle')}</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insuranceTypes.map((insurance, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <insurance.icon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>{insurance.title}</CardTitle>
                <CardDescription>{insurance.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <LocalizedLink to={insurance.link}>
                  <Button variant="outline" className="w-full">{t('common.readMore')}</Button>
                </LocalizedLink>
                <LocalizedLink to={insurance.compareLink}>
                  <Button className="w-full">{t('common.compareOffers')}</Button>
                </LocalizedLink>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Insurances;
