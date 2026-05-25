import { Home, Check, ArrowRight } from "lucide-react";
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

const EstimationImmobiliere = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    { id: "why-estimate", labelKey: "realEstatePage.whyEstimate" },
    { id: "how-it-works", labelKey: "realEstatePage.howItWorks" },
    { id: "criteria", labelKey: "realEstatePage.criteria" },
    { id: "types", labelKey: "realEstatePage.propertyTypes" },
    { id: "process", labelKey: "realEstatePage.ourProcess" },
    { id: "tips", labelKey: "realEstatePage.tips" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCompareClick = () => {
    navigate(localizedPath("/estimation-immobiliere-gratuite"));
  };

  return (
    <Layout>
      <CategoryHero
        pageTitle={t("realEstatePage.title", "Estimation immobilière")}
        subtitle={t("realEstatePage.subtitle", "Connaissez la valeur de votre bien en Suisse")}
        buttonLabel={t("realEstatePage.compareButton", "Estimer mon bien")}
        buttonIcon={Home}
        onButtonClick={handleCompareClick}
      />

      <StatsBar />

      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-2">
                <h3 className="font-semibold text-foreground mb-4">{t("common.tableOfContents", "Sommaire")}</h3>
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

            <div className="space-y-12">
              <div id="why-estimate" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("realEstatePage.whyEstimate", "Pourquoi faire estimer son bien ?")}</h2>
                <p className="text-muted-foreground mb-4">{t("realEstatePage.whyEstimateContent", "Connaître la valeur de votre bien immobilier est essentiel, que vous envisagiez de vendre, de refinancer votre hypothèque ou simplement de faire le point sur votre patrimoine.")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.whyPoint1", "Fixer un prix de vente réaliste et compétitif")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.whyPoint2", "Négocier votre hypothèque avec des données solides")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.whyPoint3", "Planifier votre succession ou votre retraite")}</span>
                  </li>
                </ul>
              </div>

              <div id="how-it-works" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("realEstatePage.howItWorks", "Comment fonctionne l'estimation ?")}</h2>
                <p className="text-muted-foreground mb-4">{t("realEstatePage.howItWorksContent", "Notre processus d'estimation combine des données du marché local avec l'expertise de professionnels de l'immobilier suisse.")}</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">1</div>
                      <h4 className="font-semibold text-foreground mb-2">{t("realEstatePage.step1", "Décrivez votre bien")}</h4>
                      <p className="text-sm text-muted-foreground">{t("realEstatePage.step1Desc", "Renseignez l'adresse, le type et la surface de votre bien")}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">2</div>
                      <h4 className="font-semibold text-foreground mb-2">{t("realEstatePage.step2", "Analyse du marché")}</h4>
                      <p className="text-sm text-muted-foreground">{t("realEstatePage.step2Desc", "Nos experts analysent les données du marché local")}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">3</div>
                      <h4 className="font-semibold text-foreground mb-2">{t("realEstatePage.step3", "Recevez votre estimation")}</h4>
                      <p className="text-sm text-muted-foreground">{t("realEstatePage.step3Desc", "Un conseiller vous contacte avec une estimation détaillée")}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div id="criteria" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("realEstatePage.criteria", "Les critères d'estimation")}</h2>
                <p className="text-muted-foreground mb-4">{t("realEstatePage.criteriaContent", "Plusieurs facteurs influencent la valeur de votre bien immobilier en Suisse.")}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{t("realEstatePage.criteriaLocation", "Emplacement")}</h4>
                      <p className="text-sm text-muted-foreground">{t("realEstatePage.criteriaLocationDesc", "La commune, le quartier, la proximité des transports et des commerces.")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{t("realEstatePage.criteriaCondition", "État du bien")}</h4>
                      <p className="text-sm text-muted-foreground">{t("realEstatePage.criteriaConditionDesc", "L'année de construction, les rénovations effectuées et l'état général.")}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div id="types" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("realEstatePage.propertyTypes", "Types de biens estimés")}</h2>
                <p className="text-muted-foreground mb-4">{t("realEstatePage.propertyTypesContent", "Notre service d'estimation couvre tous les types de biens immobiliers en Suisse.")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.type1", "Appartements et studios")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.type2", "Maisons individuelles et villas")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.type3", "Locaux commerciaux et bureaux")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.type4", "Terrains constructibles")}</span>
                  </li>
                </ul>
              </div>

              <div id="process" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("realEstatePage.ourProcess", "Notre processus")}</h2>
                <p className="text-muted-foreground mb-4">{t("realEstatePage.ourProcessContent", "Optimis vous accompagne de A à Z dans l'estimation de votre bien immobilier.")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.process1", "Remplissez le formulaire en ligne en 2 minutes")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.process2", "Un expert analyse votre bien et le marché local")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.process3", "Estimation sur place si nécessaire")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.process4", "Vous recevez un rapport d'estimation détaillé")}</span>
                  </li>
                </ul>
              </div>

              <div id="tips" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("realEstatePage.tips", "Conseils pour valoriser votre bien")}</h2>
                <p className="text-muted-foreground mb-4">{t("realEstatePage.tipsContent", "Quelques astuces pour maximiser la valeur de votre bien avant une vente.")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.tip1", "Effectuez les petites réparations visibles")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.tip2", "Mettez en valeur les espaces avec du home staging")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("realEstatePage.tip3", "Rassemblez tous les documents techniques (plans, PV AG, etc.)")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 md:py-16">
        <div className="container px-4">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-16 md:h-24 mx-auto mb-4 md:mb-6" />
              <h2 className="text-lg md:text-3xl font-bold text-foreground mb-2 md:mb-4">
                {t("realEstatePage.readyToEstimate", "Prêt à connaître la valeur de votre bien ?")}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t("realEstatePage.readyToEstimateDesc", "Obtenez une estimation gratuite et sans engagement en quelques minutes.")}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <Home className="h-3.5 w-3.5 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{t("realEstatePage.compareButton", "Estimer mon bien")}</span>
                <span className="sm:hidden">{t("realEstatePage.compareButtonShort", "Estimer")}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default EstimationImmobiliere;
