import { KeyRound, Check, Banknote, PiggyBank, ArrowRight } from "lucide-react";
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

const DevenirProprietaire = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const goMortgage = () => navigate(localizedPath("/hypotheque-offres"));
  const goPillar = () => navigate(localizedPath("/3eme-pilier-offres"));

  const tableOfContents = [
    { id: "capacity", labelKey: "becomeOwner.toc1" },
    { id: "equity", labelKey: "becomeOwner.toc2" },
    { id: "pillars", labelKey: "becomeOwner.toc3" },
    { id: "mortgage", labelKey: "becomeOwner.toc4" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const steps = [
    {
      id: "capacity",
      titleKey: "becomeOwner.s1Title",
      bodyKey: "becomeOwner.s1Body",
      points: ["becomeOwner.s1Point1", "becomeOwner.s1Point2", "becomeOwner.s1Point3"],
    },
    {
      id: "equity",
      titleKey: "becomeOwner.s2Title",
      bodyKey: "becomeOwner.s2Body",
      points: ["becomeOwner.s2Point1", "becomeOwner.s2Point2", "becomeOwner.s2Point3"],
    },
    {
      id: "pillars",
      titleKey: "becomeOwner.s3Title",
      bodyKey: "becomeOwner.s3Body",
      points: ["becomeOwner.s3Point1", "becomeOwner.s3Point2", "becomeOwner.s3Point3"],
    },
    {
      id: "mortgage",
      titleKey: "becomeOwner.s4Title",
      bodyKey: "becomeOwner.s4Body",
      points: ["becomeOwner.s4Point1", "becomeOwner.s4Point2", "becomeOwner.s4Point3"],
    },
  ];

  const faqs = [
    { q: "becomeOwner.faq1Q", a: "becomeOwner.faq1A" },
    { q: "becomeOwner.faq2Q", a: "becomeOwner.faq2A" },
    { q: "becomeOwner.faq3Q", a: "becomeOwner.faq3A" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <CategoryHero
        pageTitle={t("becomeOwner.title")}
        subtitle={t("becomeOwner.subtitle")}
        buttonLabel={t("becomeOwner.heroButton")}
        buttonIcon={KeyRound}
        onButtonClick={goMortgage}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Intro */}
      <section className="py-10 md:py-14">
        <div className="container">
          <p className="max-w-3xl mx-auto text-center text-base md:text-lg text-muted-foreground">
            {t("becomeOwner.intro")}
          </p>
        </div>
      </section>

      {/* Content with Table of Contents */}
      <section className="pb-4">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            {/* Table of Contents */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <h3 className="font-semibold text-foreground mb-4">{t("common.tableOfContents")}</h3>
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
                    {t(item.labelKey)}
                  </button>
                ))}
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-12">
              {steps.map((step) => (
                <div key={step.id} id={step.id} className="scroll-mt-24">
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">{t(step.titleKey)}</h2>
                  <p className="text-muted-foreground mb-6">{t(step.bodyKey)}</p>
                  <ul className="space-y-3">
                    {step.points.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{t(p)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell : hypothèque + 3e pilier */}
      <section className="py-14 bg-muted/30">
        <div className="container">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-8">
            {t("becomeOwner.crossTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Banknote className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t("becomeOwner.mortgageCardTitle")}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{t("becomeOwner.mortgageCardDesc")}</p>
                <Button className="gap-2 w-full sm:w-auto" onClick={goMortgage}>
                  <Banknote className="h-4 w-4" />
                  {t("becomeOwner.mortgageCardBtn")}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <PiggyBank className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{t("becomeOwner.pillarCardTitle")}</h3>
                <p className="text-muted-foreground mb-6 flex-1">{t("becomeOwner.pillarCardDesc")}</p>
                <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={goPillar}>
                  <PiggyBank className="h-4 w-4" />
                  {t("becomeOwner.pillarCardBtn")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14">
        <div className="container">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-foreground mb-8">
            {t("becomeOwner.faqTitle")}
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((f) => (
              <Card key={f.q} className="bg-muted/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2 flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    {t(f.q)}
                  </h3>
                  <p className="text-muted-foreground pl-7">{t(f.a)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 md:py-16">
        <div className="container px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-16 md:h-24 mx-auto mb-4 md:mb-6" />
              <h2 className="text-lg md:text-3xl font-bold text-foreground mb-2 md:mb-4">
                {t("becomeOwner.ctaTitle")}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t("becomeOwner.ctaDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={goMortgage}>
                  <Banknote className="h-3.5 w-3.5 md:h-5 md:w-5" />
                  {t("becomeOwner.mortgageCardBtn")}
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={goPillar}>
                  <PiggyBank className="h-3.5 w-3.5 md:h-5 md:w-5" />
                  {t("becomeOwner.pillarCardBtn")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default DevenirProprietaire;
