import { Home, Shield, Clock, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import CategoryHero from "@/components/home/CategoryHero";
import StatsBar from "@/components/home/StatsBar";

const partners = [
  { name: "La Mobilière", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/images.png" },
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
  { name: "AXA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/0001_0003782804_2-640.jpg" },
  { name: "Zurich", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/thumb_3715_page_big.png" },
];

const AssuranceMenage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const features = [
    { icon: Shield, titleKey: "homeInsurance.rcAndHome", descKey: "homeInsurance.rcAndHomeDesc" },
    { icon: Clock, titleKey: "homeInsurance.quickComparison", descKey: "homeInsurance.quickComparisonDesc" },
    { icon: CheckCircle, titleKey: "homeInsurance.guaranteedSavings", descKey: "homeInsurance.guaranteedSavingsDesc" },
  ];

  const tableOfContents = [
    "homeInsurance.whatIsRcMenage",
    "homeInsurance.whatIsCovered",
    "homeInsurance.isItMandatory",
    "homeInsurance.combinedInsurance",
    "homeInsurance.howMuchDoesItCost",
    "homeInsurance.howToTerminate",
    "homeInsurance.optimisHelps",
  ];

  const handleCompareClick = () => {
    navigate(localizedPath("/assurance-menage-landing"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("homeInsurance.title")}
        subtitle={t("homeInsurance.heroSubtitle")}
        buttonLabel={t("homeInsurance.compareButton")}
        buttonIcon={Home}
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
              <h3 className="text-2xl font-bold text-foreground mb-2">{t('homeInsurance.watchVideo')}</h3>
              <p className="text-muted-foreground">{t('homeInsurance.videoDescription')}</p>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/Q_HiE7yxfBE"
                title="Assurance Ménage Optimis"
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
                <h3 className="text-2xl font-bold text-foreground">{t('homeInsurance.whatIsRcMenage')}</h3>
                <p className="text-muted-foreground">{t('homeInsurance.whatIsRcMenageContent')}</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <p className="text-muted-foreground mb-4"><strong>{t('homeInsurance.rcPrivateTitle')}</strong> {t('homeInsurance.rcPrivateDesc')}</p>
                  <p className="text-muted-foreground"><strong>{t('homeInsurance.menageTitle')}</strong> {t('homeInsurance.menageDesc')}</p>
                </div>
                <p className="text-muted-foreground">{t('homeInsurance.combinedExplanation')}</p>
              </section>

              <section id="section-1" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('homeInsurance.whatIsCovered')}</h3>
                <p className="text-muted-foreground">{t('homeInsurance.whatIsCoveredIntro')}</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• <strong>{t('homeInsurance.coverFire')}</strong> {t('homeInsurance.coverFireDesc')}</li>
                    <li>• <strong>{t('homeInsurance.coverTheft')}</strong> {t('homeInsurance.coverTheftDesc')}</li>
                    <li>• <strong>{t('homeInsurance.coverNatural')}</strong> {t('homeInsurance.coverNaturalDesc')}</li>
                    <li>• <strong>{t('homeInsurance.coverWater')}</strong> {t('homeInsurance.coverWaterDesc')}</li>
                    <li>• <strong>{t('homeInsurance.coverGlass')}</strong> {t('homeInsurance.coverGlassDesc')}</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">{t('homeInsurance.rcCoversSummary')}</p>
              </section>

              <section id="section-2" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('homeInsurance.isItMandatory')}</h3>
                <p className="text-muted-foreground">{t('homeInsurance.mandatoryContent1')}</p>
                <p className="text-muted-foreground mt-4">{t('homeInsurance.mandatoryContent2')}</p>
                <div className="bg-primary/5 p-6 rounded-lg my-6">
                  <p className="text-muted-foreground">{t('homeInsurance.mandatoryCantons')}</p>
                </div>
              </section>

              <section id="section-3" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('homeInsurance.combinedInsurance')}</h3>
                <p className="text-muted-foreground">{t('homeInsurance.combinedIntro')}</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                    <li><strong>{t('homeInsurance.benefit1')}</strong> {t('homeInsurance.benefit1Desc')}</li>
                    <li><strong>{t('homeInsurance.benefit2')}</strong> {t('homeInsurance.benefit2Desc')}</li>
                    <li><strong>{t('homeInsurance.benefit3')}</strong> {t('homeInsurance.benefit3Desc')}</li>
                    <li><strong>{t('homeInsurance.benefit4')}</strong> {t('homeInsurance.benefit4Desc')}</li>
                    <li><strong>{t('homeInsurance.benefit5')}</strong> {t('homeInsurance.benefit5Desc')}</li>
                    <li><strong>{t('homeInsurance.benefit6')}</strong> {t('homeInsurance.benefit6Desc')}</li>
                  </ol>
                </div>
              </section>

              <section id="section-4" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('homeInsurance.howMuchDoesItCost')}</h3>
                <p className="text-muted-foreground">{t('homeInsurance.costContent')}</p>
              </section>

              <section id="section-5" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('homeInsurance.howToTerminate')}</h3>
                <p className="text-muted-foreground">{t('homeInsurance.terminateContent')}</p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• {t('homeInsurance.terminateInfo1')}</li>
                    <li>• {t('homeInsurance.terminateInfo2')}</li>
                    <li>• {t('homeInsurance.terminateInfo3')}</li>
                    <li>• {t('homeInsurance.terminateInfo4')}</li>
                    <li>• {t('homeInsurance.terminateInfo5')}</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">{t('homeInsurance.terminateDeadline')}</p>
              </section>

              <section id="section-6" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('homeInsurance.optimisHelps')}</h3>
                <p className="text-muted-foreground">{t('homeInsurance.optimisHelpsContent')}</p>
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
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-24 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('homeInsurance.getFreeQuote')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('homeInsurance.compareDescription')}
              </p>
              <Button size="lg" className="gap-2" onClick={handleCompareClick}>
                <Home className="h-5 w-5" />
                {t('homeInsurance.requestQuote')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceMenage;
