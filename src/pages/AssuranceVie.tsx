import { Heart, Shield, Clock, CheckCircle, Banknote } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import CategoryHero from "@/components/home/CategoryHero";
import StatsBar from "@/components/home/StatsBar";
import { resolveLegacyImageUrl } from "@/data/legacyImageResolver";

const partners = [
  { name: "Generali", logo: resolveLegacyImageUrl("general-1.svg") },
  { name: "Allianz", logo: resolveLegacyImageUrl("allianz-logo.svg") },
  { name: "AXA", logo: resolveLegacyImageUrl("0001_0003782804_2-640.jpg") },
  { name: "Swiss Life", logo: resolveLegacyImageUrl("Swiss_Life_AG_logo.svg") },
];

const AssuranceVie = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const features = [
    { icon: Shield, titleKey: "lifeInsurance.capitalProtection", descKey: "lifeInsurance.capitalProtectionDesc" },
    { icon: Clock, titleKey: "lifeInsurance.taxAdvantages", descKey: "lifeInsurance.taxAdvantagesDesc" },
    { icon: CheckCircle, titleKey: "lifeInsurance.familyProtection", descKey: "lifeInsurance.familyProtectionDesc" },
  ];

  const tableOfContents = [
    "lifeInsurance.whatIsLifeInsurance",
    "lifeInsurance.typesOfLifeInsurance",
    "lifeInsurance.thirdPillarExplained",
    "lifeInsurance.whoNeedsIt",
    "lifeInsurance.howToChoose",
    "lifeInsurance.taxBenefits",
  ];

  const handleCompareClick = () => {
    navigate(localizedPath("/3eme-pilier-offres"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("lifeInsurance.title")}
        subtitle={t("lifeInsurance.heroSubtitle") || t("lifeInsurance.feature1")}
        buttonLabel={t("lifeInsurance.compareButton")}
        buttonIcon={Banknote}
        onButtonClick={handleCompareClick}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.titleKey}>
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">{t(feature.descKey)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('lifeInsurance.watchVideo')}</h3>
              <p className="text-muted-foreground">{t('lifeInsurance.videoDescription')}</p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/Q_HiE7yxfBE"
                title="Assurance Vie Optimis"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">{t('common.readingTime')}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-6">5 {t('common.min')}</p>
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
              <section id="section-0" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.whatIsLifeInsurance')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.whatIsLifeInsuranceContent')}</p>
              </section>

              <section id="section-1" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.typesOfLifeInsurance')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.typesContent')}</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• {t('lifeInsurance.type1')}</li>
                    <li>• {t('lifeInsurance.type2')}</li>
                    <li>• {t('lifeInsurance.type3')}</li>
                  </ul>
                </div>
              </section>

              <section id="section-2" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.thirdPillarExplained')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.thirdPillarContent')}</p>
                <div className="bg-primary/5 p-6 rounded-lg my-6">
                  <h4 className="font-semibold text-foreground mb-4">{t('lifeInsurance.pillar3aVs3b')}</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• {t('lifeInsurance.pillar3aDesc')}</li>
                    <li>• {t('lifeInsurance.pillar3bDesc')}</li>
                  </ul>
                </div>
              </section>

              <section id="section-3" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.whoNeedsIt')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.whoNeedsItContent')}</p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• {t('lifeInsurance.needCase1')}</li>
                  <li>• {t('lifeInsurance.needCase2')}</li>
                  <li>• {t('lifeInsurance.needCase3')}</li>
                  <li>• {t('lifeInsurance.needCase4')}</li>
                </ul>
              </section>

              <section id="section-4" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.howToChoose')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.howToChooseContent')}</p>
              </section>

              <section id="section-5" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('lifeInsurance.taxBenefits')}</h3>
                <p className="text-muted-foreground">{t('lifeInsurance.taxBenefitsContent')}</p>
                <Card className="my-6">
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold text-primary">{t('lifeInsurance.maxDeduction')}</p>
                    <p className="text-muted-foreground mt-2">{t('lifeInsurance.maxDeductionDesc')}</p>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
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

      {/* CTA Section */}
      <section className="py-8 md:py-16">
        <div className="container px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-16 md:h-24 mx-auto mb-4 md:mb-6" />
              <h2 className="text-lg md:text-3xl font-bold text-foreground mb-2 md:mb-4">
                {t('lifeInsurance.readyToCompare')}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t('lifeInsurance.getEstimate')}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <Banknote className="h-3.5 w-3.5 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{t('lifeInsurance.compareNow')}</span>
                <span className="sm:hidden">Comparer</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceVie;
