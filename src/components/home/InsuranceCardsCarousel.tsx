import { Scale, Heart, Car, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LocalizedLink from "@/components/LocalizedLink";

const InsuranceCardsCarousel = () => {
  const { t } = useTranslation();

  const insuranceCards = [
    {
      icon: Scale,
      titleKey: "nav.legalProtection",
      descriptionKey: "home.legalProtectionCardDesc",
      href: "/protection-juridique",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Heart,
      titleKey: "nav.healthInsurance",
      descriptionKey: "home.healthInsuranceCardDesc",
      href: "/assurance-sante",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: Car,
      titleKey: "nav.carInsurance",
      descriptionKey: "home.carInsuranceCardDesc",
      href: "/assurance-voiture",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Home,
      titleKey: "nav.homeInsurance",
      descriptionKey: "home.homeInsuranceCardDesc",
      href: "/assurance-menage",
      color: "text-orange-500",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            {t('home.compareLabel')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('home.compareInsurancesTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('home.compareInsurancesSubtitle')}
          </p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {insuranceCards.map((card) => (
            <Card key={card.href} className="group hover-lift overflow-hidden border-0 shadow-md">
              <CardContent className="p-6 flex flex-col h-full">
                <div className={`mb-4 rounded-xl ${card.bgColor} p-4 w-fit transition-transform duration-300 group-hover:scale-110`}>
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {t(card.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 flex-grow">
                  {t(card.descriptionKey)}
                </p>
                <Button asChild variant="outline" className="w-full mt-auto">
                  <LocalizedLink to={card.href}>
                    {t('common.compare')}
                  </LocalizedLink>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InsuranceCardsCarousel;
