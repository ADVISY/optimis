import { CreditCard, Check, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LocalizedLink from "@/components/LocalizedLink";
import llamaMascot from "@/assets/llama-mascot.png";
import { useNavigate } from "react-router-dom";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import CategoryHero from "@/components/home/CategoryHero";
import StatsBar from "@/components/home/StatsBar";

const cantons = [
  { name: "Vaud", slug: "vaud" },
  { name: "Genève", slug: "geneve" },
  { name: "Fribourg", slug: "fribourg" },
  { name: "Valais", slug: "valais" },
  { name: "Neuchâtel", slug: "neuchatel" },
  { name: "Jura", slug: "jura" },
  { name: "Berne", slug: "berne" },
  { name: "Zurich", slug: "zurich" },
];

const Subside = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    { id: "what-is", labelKey: "subsidyDetailed.whatIsSubsidy" },
    { id: "eligibility", labelKey: "subsidyDetailed.eligibilityTitle" },
    { id: "how-to-apply", labelKey: "subsidyDetailed.howToApply" },
    { id: "by-canton", labelKey: "subsidyDetailed.byCantonTitle" },
    { id: "amounts", labelKey: "subsidyDetailed.amountsTitle" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCompareClick = () => {
    navigate(localizedPath("/subside-assurance-maladie-demande"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("subsidy.title")}
        subtitle={t("subsidy.feature1")}
        buttonLabel={t("subsidy.requestButton")}
        buttonIcon={CreditCard}
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
                title="Optimis - Subside Assurance Maladie"
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
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('subsidyDetailed.whatIsSubsidy')}</h2>
                <p className="text-muted-foreground mb-4">{t('subsidyDetailed.whatIsSubsidyContent')}</p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <p className="text-lg font-semibold text-primary">{t('subsidyDetailed.savingsHighlight')}</p>
                  </CardContent>
                </Card>
              </div>

              <div id="eligibility" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('subsidyDetailed.eligibilityTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('subsidyDetailed.eligibilityContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('subsidy.eligibility1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('subsidy.eligibility2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('subsidy.eligibility3')}</span>
                  </li>
                </ul>
              </div>

              <div id="how-to-apply" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('subsidyDetailed.howToApply')}</h2>
                <p className="text-muted-foreground mb-4">{t('subsidyDetailed.howToApplyContent')}</p>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                    <span className="text-muted-foreground">{t('subsidyDetailed.step1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                    <span className="text-muted-foreground">{t('subsidyDetailed.step2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                    <span className="text-muted-foreground">{t('subsidyDetailed.step3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</span>
                    <span className="text-muted-foreground">{t('subsidyDetailed.step4')}</span>
                  </li>
                </ol>
              </div>

              <div id="by-canton" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('subsidyDetailed.byCantonTitle')}</h2>
                <p className="text-muted-foreground mb-6">{t('subsidyDetailed.byCantonContent')}</p>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  {cantons.map((canton) => (
                    <LocalizedLink key={canton.slug} to={`/blog/le-subside-dassurance-maladie-a-${canton.slug}-mode-demploi`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardContent className="p-4 text-center flex items-center justify-center h-full">
                          <p className="font-medium text-foreground">{canton.name}</p>
                        </CardContent>
                      </Card>
                    </LocalizedLink>
                  ))}
                </div>
              </div>

              <div id="amounts" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('subsidyDetailed.amountsTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('subsidyDetailed.amountsContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('subsidyDetailed.amountPoint1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('subsidyDetailed.amountPoint2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('subsidyDetailed.amountPoint3')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-16">
        <div className="container px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-16 md:h-24 mx-auto mb-4 md:mb-6" />
              <h2 className="text-lg md:text-3xl font-bold text-foreground mb-2 md:mb-4">
                {t('subsidy.needHelp')}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t('subsidy.helpDescription')}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <CreditCard className="h-3.5 w-3.5 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{t('subsidy.requestNow')}</span>
                <span className="sm:hidden">Demander</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Subside;
