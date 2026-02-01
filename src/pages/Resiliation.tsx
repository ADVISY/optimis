import { FileX, Check, AlertTriangle } from "lucide-react";
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

const insurers = [
  { name: "Assura", slug: "assura" },
  { name: "CSS", slug: "css" },
  { name: "Groupe Mutuel", slug: "groupe-mutuel" },
  { name: "Helsana", slug: "helsana" },
  { name: "Swica", slug: "swica" },
  { name: "Visana", slug: "visana" },
  { name: "Sanitas", slug: "sanitas" },
  { name: "Concordia", slug: "concordia" },
];

const Resiliation = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    { id: "deadlines", labelKey: "terminationDetailed.deadlinesTitle" },
    { id: "how-to", labelKey: "terminationDetailed.howToTitle" },
    { id: "by-insurer", labelKey: "terminationDetailed.byInsurerTitle" },
    { id: "templates", labelKey: "terminationDetailed.templatesTitle" },
    { id: "faq", labelKey: "terminationDetailed.faqTitle" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCompareClick = () => {
    navigate(localizedPath("/resiliation-assurance"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("termination.title")}
        subtitle={t("termination.feature1")}
        buttonLabel={t("termination.startButton")}
        buttonIcon={FileX}
        onButtonClick={handleCompareClick}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Alert */}
      <section className="py-8">
        <div className="container">
          <Card className="border-accent/50 bg-accent/10">
            <CardContent className="p-6 flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('termination.importantDeadline')}</h4>
                <p className="text-muted-foreground">{t('termination.deadlineInfo')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/9KQfrp1_lqg"
                title="Optimis - Résiliation Assurance"
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
              <div id="deadlines" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('terminationDetailed.deadlinesTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('terminationDetailed.deadlinesContent')}</p>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">{t('terminationDetailed.keyDates')}</h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• {t('terminationDetailed.date1')}</li>
                      <li>• {t('terminationDetailed.date2')}</li>
                      <li>• {t('terminationDetailed.date3')}</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <div id="how-to" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('terminationDetailed.howToTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('termination.howToTerminateContent')}</p>
                <ol className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</span>
                    <span className="text-muted-foreground">{t('termination.step1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</span>
                    <span className="text-muted-foreground">{t('termination.step2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</span>
                    <span className="text-muted-foreground">{t('termination.step3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">4</span>
                    <span className="text-muted-foreground">{t('termination.step4')}</span>
                  </li>
                </ol>
              </div>

              <div id="by-insurer" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('terminationDetailed.byInsurerTitle')}</h2>
                <p className="text-muted-foreground mb-6">{t('terminationDetailed.byInsurerContent')}</p>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  {insurers.map((insurer) => (
                    <LocalizedLink key={insurer.slug} to={`/blog/tout-savoir-sur-la-resiliation-de-votre-assurance-${insurer.slug}`}>
                      <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                        <CardContent className="p-4 text-center flex items-center justify-center h-full">
                          <p className="font-medium text-foreground">{insurer.name}</p>
                        </CardContent>
                      </Card>
                    </LocalizedLink>
                  ))}
                </div>
              </div>

              <div id="templates" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('terminationDetailed.templatesTitle')}</h2>
                <p className="text-muted-foreground mb-4">{t('terminationDetailed.templatesContent')}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('terminationDetailed.template1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('terminationDetailed.template2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t('terminationDetailed.template3')}</span>
                  </li>
                </ul>
              </div>

              <div id="faq" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t('terminationDetailed.faqTitle')}</h2>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('terminationDetailed.faq1Question')}</h4>
                    <p className="text-muted-foreground">{t('terminationDetailed.faq1Answer')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('terminationDetailed.faq2Question')}</h4>
                    <p className="text-muted-foreground">{t('terminationDetailed.faq2Answer')}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">{t('terminationDetailed.faq3Question')}</h4>
                    <p className="text-muted-foreground">{t('terminationDetailed.faq3Answer')}</p>
                  </div>
                </div>
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
                {t('termination.needHelp')}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t('termination.helpDescription')}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <FileX className="h-3.5 w-3.5 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{t('termination.startButton')}</span>
                <span className="sm:hidden">Résilier</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Resiliation;
