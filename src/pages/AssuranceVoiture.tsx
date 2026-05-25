import { Car, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import CategoryHero from "@/components/home/CategoryHero";
import StatsBar from "@/components/home/StatsBar";
import { resolveLegacyImageUrl } from "@/data/legacyImageResolver";

const partners = [
  { name: "AXA", logo: resolveLegacyImageUrl("0001_0003782804_2-640.jpg") },
  { name: "La Mobilière", logo: resolveLegacyImageUrl("images.png") },
  { name: "Allianz", logo: resolveLegacyImageUrl("allianz-logo.svg") },
  { name: "Zurich", logo: resolveLegacyImageUrl("thumb_3715_page_big.png") },
  { name: "Generali", logo: resolveLegacyImageUrl("general-1.svg") },
];

const AssuranceVoiture = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    "carInsurance.introduction",
    "carInsurance.basicCoverage",
    "carInsurance.complementaryCoverage",
    "carInsurance.franchise",
    "carInsurance.bonusMalus",
  ];

  const handleCompareClick = () => {
    navigate(localizedPath("/assurance-voiture-landing"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("carInsurance.title")}
        subtitle={t("carInsurance.heroSubtitle")}
        buttonLabel={t("healthInsurance.compareButton")}
        buttonIcon={Car}
        onButtonClick={handleCompareClick}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Video Section */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/4pYQxql9Ghw"
                title="PRÉSENTATION DE OPTIMIS"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents & Content */}
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
                  <p className="text-2xl font-bold text-primary mb-6">8 {t('common.min')}</p>
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
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.introduction')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.introContent1')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.introContent2')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.introContent3')}
                </p>
              </section>

              <section id="section-1" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.basicCoverage')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.basicCoverageIntro')}
                </p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <ul className="space-y-4 text-muted-foreground">
                    <li><strong>{t('carInsurance.civilLiability')}</strong> {t('carInsurance.civilLiabilityDesc')}</li>
                    <li><strong>{t('carInsurance.partialCasco')}</strong> {t('carInsurance.partialCascoDesc')}</li>
                    <li><strong>{t('carInsurance.fullCasco')}</strong> {t('carInsurance.fullCascoDesc')}</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  {t('carInsurance.basicCoverageConclusion')}
                </p>
              </section>

              <section id="section-2" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.complementaryCoverage')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.complementaryIntro')}
                </p>
                <ul className="space-y-3 text-muted-foreground my-4">
                  <li><strong>{t('carInsurance.passengerInsurance')}</strong> {t('carInsurance.passengerInsuranceDesc')}</li>
                  <li><strong>{t('carInsurance.parkingDamage')}</strong> {t('carInsurance.parkingDamageDesc')}</li>
                  <li><strong>{t('carInsurance.extendedGlass')}</strong> {t('carInsurance.extendedGlassDesc')}</li>
                  <li><strong>{t('carInsurance.mobilityAssistance')}</strong> {t('carInsurance.mobilityAssistanceDesc')}</li>
                  <li><strong>{t('carInsurance.lossOfUse')}</strong> {t('carInsurance.lossOfUseDesc')}</li>
                  <li><strong>{t('carInsurance.grossNegligence')}</strong> {t('carInsurance.grossNegligenceDesc')}</li>
                  <li><strong>{t('carInsurance.increasedValue')}</strong> {t('carInsurance.increasedValueDesc')}</li>
                  <li><strong>{t('carInsurance.bonusProtection')}</strong> {t('carInsurance.bonusProtectionDesc')}</li>
                </ul>
              </section>

              <section id="section-3" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.franchise')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.franchiseContent1')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.franchiseContent2')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.franchiseContent3')}
                </p>
              </section>

              <section id="section-4" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('carInsurance.bonusMalus')}</h3>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent1')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent2')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent3')}
                </p>
                <p className="text-muted-foreground">
                  {t('carInsurance.bonusMalusContent4')}
                </p>
              </section>

              <img 
                src={resolveLegacyImageUrl("Vous-ne-savezpas-si-votre-assurance-copie-2-1024x576.jpg")}
                alt="Assurance automobile Suisse"
                className="rounded-lg my-6 w-full"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-primary mb-2">{t('common.partners')}</h3>
            <p className="text-lg text-foreground">
              {t('common.partnersDescription')}
            </p>
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
                {t('carInsurance.readyToSave')}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t('carInsurance.getEstimate')}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <Car className="h-3.5 w-3.5 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{t('healthInsurance.compareNow')}</span>
                <span className="sm:hidden">Comparer</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceVoiture;
