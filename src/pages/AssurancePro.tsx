import { Briefcase, Clock, Shield, Scale, HeartPulse, Building2, AlertTriangle, Lock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import CategoryHero from "@/components/home/CategoryHero";
import StatsBar from "@/components/home/StatsBar";

const partners = [
  { name: "AXA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/0001_0003782804_2-640.jpg" },
  { name: "La Mobilière", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/images.png" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
  { name: "Zurich", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/thumb_3715_page_big.png" },
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
];

const AssurancePro = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    "professionalInsurancePage.toc.rcPro",
    "professionalInsurancePage.toc.laa",
    "professionalInsurancePage.toc.lpp",
    "professionalInsurancePage.toc.legalProtection",
    "professionalInsurancePage.toc.lossOfEarnings",
    "professionalInsurancePage.toc.multiRisk",
    "professionalInsurancePage.toc.cyber",
  ];

  const insuranceTypes = [
    {
      icon: Shield,
      titleKey: "professionalInsurancePage.rcPro.title",
      descKey: "professionalInsurancePage.rcPro.desc",
      detailsKey: "professionalInsurancePage.rcPro.details",
    },
    {
      icon: AlertTriangle,
      titleKey: "professionalInsurancePage.laa.title",
      descKey: "professionalInsurancePage.laa.desc",
      detailsKey: "professionalInsurancePage.laa.details",
    },
    {
      icon: HeartPulse,
      titleKey: "professionalInsurancePage.lpp.title",
      descKey: "professionalInsurancePage.lpp.desc",
      detailsKey: "professionalInsurancePage.lpp.details",
    },
    {
      icon: Scale,
      titleKey: "professionalInsurancePage.legalProtection.title",
      descKey: "professionalInsurancePage.legalProtection.desc",
      detailsKey: "professionalInsurancePage.legalProtection.details",
    },
    {
      icon: Building2,
      titleKey: "professionalInsurancePage.lossOfEarnings.title",
      descKey: "professionalInsurancePage.lossOfEarnings.desc",
      detailsKey: "professionalInsurancePage.lossOfEarnings.details",
    },
    {
      icon: Lock,
      titleKey: "professionalInsurancePage.multiRisk.title",
      descKey: "professionalInsurancePage.multiRisk.desc",
      detailsKey: "professionalInsurancePage.multiRisk.details",
    },
    {
      icon: Lock,
      titleKey: "professionalInsurancePage.cyber.title",
      descKey: "professionalInsurancePage.cyber.desc",
      detailsKey: "professionalInsurancePage.cyber.details",
    },
  ];

  const handleCompareClick = () => {
    navigate(localizedPath("/assurance-entreprise-offres"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("professionalInsurancePage.heroTitle")}
        subtitle={t("professionalInsurancePage.heroSubtitle")}
        buttonLabel={t("professionalInsurancePage.compareButton")}
        buttonIcon={Briefcase}
        onButtonClick={handleCompareClick}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Insurance Types Grid */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
            {t("professionalInsurancePage.typesTitle")}
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
            {t("professionalInsurancePage.typesSubtitle")}
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insuranceTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <Icon className="h-10 w-10 text-primary mb-4" />
                    <h3 className="text-xl font-bold mb-2">{t(type.titleKey)}</h3>
                    <p className="text-muted-foreground text-sm">{t(type.descKey)}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Table of Contents & Detailed Content */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">{t('common.readingTime')}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-6">10 {t('common.min')}</p>
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => (
                      <a
                        key={index}
                        href={`#section-${index}`}
                        className="block text-sm text-foreground/80 hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                      >
                        {t(item)}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 prose prose-lg max-w-none">
              {insuranceTypes.map((type, index) => (
                <section key={index} id={`section-${index}`} className="mb-12">
                  <h3 className="text-2xl font-bold text-foreground">{t(type.titleKey)}</h3>
                  <p className="text-muted-foreground">{t(type.descKey)}</p>
                  <div className="bg-background p-6 rounded-lg my-4">
                    <p className="text-muted-foreground">{t(type.detailsKey)}</p>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            {t("professionalInsurancePage.faqTitle")}
          </h2>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-border py-6">
              <h3 className="font-bold text-lg mb-2">{t(`professionalInsurancePage.faq.q${i}`)}</h3>
              <p className="text-muted-foreground">{t(`professionalInsurancePage.faq.a${i}`)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-primary mb-2">{t('common.partners')}</h3>
            <p className="text-lg text-foreground">{t('common.partnersDescription')}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <img key={partner.name} src={partner.logo} alt={partner.name} className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity" />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 md:py-16">
        <div className="container px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-16 md:h-24 mx-auto mb-4 md:mb-6" />
              <h2 className="text-lg md:text-3xl font-bold text-foreground mb-2 md:mb-4">
                {t('professionalInsurancePage.ctaTitle')}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t('professionalInsurancePage.ctaDescription')}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <Briefcase className="h-3.5 w-3.5 md:h-5 md:w-5" />
                {t('professionalInsurancePage.compareButton')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssurancePro;
