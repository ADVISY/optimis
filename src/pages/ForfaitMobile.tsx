import { Smartphone, Check, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";
import CategoryHero from "@/components/home/CategoryHero";
import StatsBar from "@/components/home/StatsBar";

const providers = [
  { name: "Swisscom", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/swisscom-logo.svg" },
  { name: "Sunrise", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/sunrise-logo.svg" },
  { name: "Salt", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/salt-logo.svg" },
  { name: "Wingo", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/wingo-logo.svg" },
];

const ForfaitMobile = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const tableOfContents = [
    { id: "why-compare", labelKey: "mobileDetailed.whyCompare" },
    { id: "operators", labelKey: "mobileDetailed.mainOperators" },
    { id: "criteria", labelKey: "mobileDetailed.criteriaTitle" },
    { id: "roaming", labelKey: "mobileDetailed.roamingTitle" },
    { id: "tips", labelKey: "mobileDetailed.tipsTitle" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCompareClick = () => {
    // No comparator page for mobile yet - could show a toast or redirect
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("mobile.title")}
        subtitle={t("mobile.feature1")}
        buttonLabel={t("mobile.compareButton")}
        buttonIcon={Smartphone}
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
                title="Optimis - Forfait Mobile Suisse"
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
              <div id="why-compare" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mobileDetailed.whyCompare')}</h2>
                <p className="text-muted-foreground mb-4">{t('mobileDetailed.whyCompareContent')}</p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold text-primary">{t('mobileDetailed.savingsHighlight')}</p>
                  </CardContent>
                </Card>
              </div>

              <div id="operators" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mobileDetailed.mainOperators')}</h2>
                <p className="text-muted-foreground mb-6">{t('mobileDetailed.operatorsContent')}</p>
                <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                  {providers.map((provider) => (
                    <img
                      key={provider.name}
                      src={provider.logo}
                      alt={provider.name}
                      className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
                    />
                  ))}
                </div>
              </div>

              <div id="criteria" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mobileDetailed.criteriaTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('mobileDetailed.criteriaContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobile.criteria1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobile.criteria2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobile.criteria3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobile.criteria4')}</span>
                  </li>
                </ul>
              </div>

              <div id="roaming" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mobileDetailed.roamingTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('mobileDetailed.roamingContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobileDetailed.roamingPoint1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobileDetailed.roamingPoint2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobileDetailed.roamingPoint3')}</span>
                  </li>
                </ul>
              </div>

              <div id="tips" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('mobileDetailed.tipsTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('mobileDetailed.tipsContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobileDetailed.tip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobileDetailed.tip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('mobileDetailed.tip3')}</span>
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
                {t('mobile.readyToCompare')}
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                {t('mobile.getEstimate')}
              </p>
              <Button size="lg" className="gap-2" onClick={handleCompareClick}>
                <Smartphone className="h-5 w-5" />
                {t('mobile.compareNow')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default ForfaitMobile;
