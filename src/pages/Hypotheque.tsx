import { Banknote, Check, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import CategoryHero from "@/components/home/CategoryHero";
import StatsBar from "@/components/home/StatsBar";

const Hypotheque = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    { id: "what-is", labelKey: "mortgage.whatIsMortgage" },
    { id: "types", labelKey: "mortgage.mortgageTypes" },
    { id: "rates", labelKey: "mortgage.interestRates" },
    { id: "how-to-choose", labelKey: "mortgage.howToChoose" },
    { id: "documents", labelKey: "mortgage.requiredDocuments" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCompareClick = () => {
    navigate(localizedPath("/comparateur/hypotheque"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("mortgage.title")}
        subtitle={t("mortgage.feature1")}
        buttonLabel={t("mortgage.compareButton")}
        buttonIcon={Banknote}
        onButtonClick={handleCompareClick}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Video Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/9KQfrp1_lqg"
                title="Optimis - Hypothèque Suisse"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content with Table of Contents */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            {/* Table of Contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <h3 className="font-semibold text-foreground mb-4">{t('common.tableOfContents')}</h3>
                {tableOfContents.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {t(item.labelKey, item.labelKey.split('.').pop())}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-12">
              <div id="what-is" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mortgage.whatIsMortgage')}</h2>
                <p className="text-muted-foreground mb-4">{t('mortgage.whatIsMortgageContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.mortgagePoint1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.mortgagePoint2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.mortgagePoint3')}</span>
                  </li>
                </ul>
              </div>

              <div id="types" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mortgage.mortgageTypes')}</h2>
                <p className="text-muted-foreground mb-6">{t('mortgage.mortgageTypesContent')}</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{t('mortgage.fixedRate')}</h4>
                      <p className="text-sm text-muted-foreground">{t('mortgage.fixedRateDesc')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{t('mortgage.variableRate')}</h4>
                      <p className="text-sm text-muted-foreground">{t('mortgage.variableRateDesc')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{t('mortgage.saronRate')}</h4>
                      <p className="text-sm text-muted-foreground">{t('mortgage.saronRateDesc')}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div id="rates" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mortgage.interestRates')}</h2>
                <p className="text-muted-foreground mb-4">{t('mortgage.interestRatesContent')}</p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">{t('mortgage.currentRates')}</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{t('mortgage.rate5years')}</p>
                      <p>{t('mortgage.rate10years')}</p>
                      <p>{t('mortgage.rateSaron')}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div id="how-to-choose" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mortgage.howToChoose')}</h2>
                <p className="text-muted-foreground mb-4">{t('mortgage.howToChooseContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.choosePoint1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.choosePoint2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.choosePoint3')}</span>
                  </li>
                </ul>
              </div>

              <div id="documents" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mortgage.requiredDocuments')}</h2>
                <p className="text-muted-foreground mb-4">{t('mortgage.documentsContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.document1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.document2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.document3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mortgage.document4')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-24 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('mortgage.readyToCompare')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('mortgage.getEstimate')}
              </p>
              <Button size="lg" className="gap-2" onClick={handleCompareClick}>
                <Banknote className="h-5 w-5" />
                {t('mortgage.compareNow')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Hypotheque;
