import { Heart, Clock } from "lucide-react";
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
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
  { name: "Helsana", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/helsana-logo.svg" },
  { name: "Groupe Mutuel", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/logo-groupe-mutuel.svg" },
  { name: "SWICA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/SWICA_Logo_Mobile.svg" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
];

const AssuranceSante = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    "healthInsurance.allAboutHealthInsurance",
    "healthInsurance.whatToKnow",
    "healthInsurance.howItWorks",
    "healthInsurance.howMuchDoesItCost",
    "healthInsurance.howToGet",
    "healthInsurance.supplementaryInsurance",
    "healthInsurance.lcaInfo",
    "healthInsurance.lamalOrCmu",
  ];

  const handleCompareClick = () => {
    navigate(localizedPath("/assurance-maladie-landing"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("healthInsurance.title")}
        subtitle={t("healthInsurance.heroSubtitle")}
        buttonLabel={t("healthInsurance.compareButton")}
        buttonIcon={Heart}
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
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.allAboutHealthInsurance')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.allAboutHealthInsuranceContent')}
                </p>
                <img 
                  src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/theluckycharm_delete_the_extra_things_3580fd9b-5c4e-45bd-88b3-fb7463e2f924-min.png" 
                  alt="Illustration assurance maladie"
                  className="rounded-lg my-6 w-full max-w-md"
                />
              </section>

              <section id="section-1" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.whatToKnow')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.whatToKnowContent')}
                </p>
              </section>

              <section id="section-2" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.howItWorks')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.howItWorksContent')}
                </p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <h4 className="font-semibold text-foreground mb-4">{t('healthInsurance.basicInsurance')}</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• {t('healthInsurance.basicInsurancePoint1')}</li>
                    <li>• {t('healthInsurance.basicInsurancePoint2')}</li>
                    <li>• {t('healthInsurance.basicInsurancePoint3')}</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  {t('healthInsurance.chooseInsurer')}
                </p>
                <p className="text-muted-foreground mt-4">
                  {t('healthInsurance.newResidents')}
                </p>
              </section>

              <section id="section-3" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.howMuchDoesItCost')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.premiumsVary')}
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• {t('healthInsurance.costFactor1')}</li>
                  <li>• {t('healthInsurance.costFactor2')}</li>
                  <li>• {t('healthInsurance.costFactor3')}</li>
                  <li>• {t('healthInsurance.costFactor4')}</li>
                  <li>• {t('healthInsurance.costFactor5')}</li>
                </ul>
                <p className="text-muted-foreground">
                  {t('healthInsurance.sameReimbursement')}
                </p>
                <p className="text-muted-foreground mt-4">
                  {t('healthInsurance.subsidies')}
                </p>
              </section>

              <section id="section-4" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.howToGet')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.freeToChoose')}
                </p>
                <p className="text-muted-foreground mt-4">
                  {t('healthInsurance.compareFactors')}
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• {t('healthInsurance.compareFactor1')}</li>
                  <li>• {t('healthInsurance.compareFactor2')}</li>
                  <li>• {t('healthInsurance.compareFactor3')}</li>
                  <li>• {t('healthInsurance.compareFactor4')}</li>
                  <li>• {t('healthInsurance.compareFactor5')}</li>
                </ul>
              </section>

              <section id="section-5" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.supplementaryInsurance')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.supplementaryContent')}
                </p>
                <h4 className="font-semibold text-foreground mt-6 mb-4">{t('healthInsurance.whySupplementary')}</h4>
                <p className="text-muted-foreground">
                  {t('healthInsurance.supplementaryReason')}
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• {t('healthInsurance.supplementaryCover1')}</li>
                  <li>• {t('healthInsurance.supplementaryCover2')}</li>
                  <li>• {t('healthInsurance.supplementaryCover3')}</li>
                  <li>• {t('healthInsurance.supplementaryCover4')}</li>
                  <li>• {t('healthInsurance.supplementaryCover5')}</li>
                </ul>
                <p className="text-muted-foreground">
                  {t('healthInsurance.notMandatory')}
                </p>
              </section>

              <section id="section-6" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.lcaInfo')}</h3>
                <h4 className="font-semibold text-foreground mt-6 mb-4">{t('healthInsurance.crossBorderFocus')}</h4>
                <p className="text-muted-foreground">
                  {t('healthInsurance.crossBorderContent')}
                </p>
                <h4 className="font-semibold text-foreground mt-6 mb-4">{t('healthInsurance.canCrossBorderGetLamal')}</h4>
                <p className="text-muted-foreground">
                  {t('healthInsurance.crossBorderOptions')}
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• {t('healthInsurance.cmu')}</li>
                  <li>• {t('healthInsurance.lamalFrontalier')}</li>
                </ul>
              </section>

              <section id="section-7" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.lamalOrCmu')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.lamalOrCmuContent')}
                </p>
              </section>

              <section className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">{t('healthInsurance.allHealthFunds')}</h3>
                <p className="text-muted-foreground">
                  {t('healthInsurance.allHealthFundsContent')}
                </p>
                <h4 className="font-semibold text-foreground mt-6 mb-4">{t('healthInsurance.comparisonCriteria')}</h4>
                <div className="grid gap-4 md:grid-cols-3 my-6">
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-foreground">{t('healthInsurance.reimbursement')}</h5>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('healthInsurance.reimbursementDesc')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-foreground">{t('healthInsurance.customerService')}</h5>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('healthInsurance.customerServiceDesc')}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-foreground">{t('healthInsurance.otherCriteria')}</h5>
                      <p className="text-sm text-muted-foreground mt-2">
                        {t('healthInsurance.otherCriteriaDesc')}
                      </p>
                    </CardContent>
                  </Card>
                </div>
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
                {t('healthInsurance.readyToCompare')}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t('healthInsurance.getEstimate')}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <Heart className="h-3.5 w-3.5 md:h-5 md:w-5" />
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

export default AssuranceSante;
