import { Landmark, Check, ArrowRight } from "lucide-react";
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

const AvoirsLpp = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const tableOfContents = [
    { id: "what-is", labelKey: "lppPage.whatIsLpp" },
    { id: "who", labelKey: "lppPage.whoIsConcerned" },
    { id: "how-it-works", labelKey: "lppPage.howItWorks" },
    { id: "forgotten", labelKey: "lppPage.forgottenFunds" },
    { id: "retrieve", labelKey: "lppPage.howToRetrieve" },
    { id: "tax", labelKey: "lppPage.taxImplications" },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCompareClick = () => {
    navigate(localizedPath("/avoirs-lpp-libre-passage"));
  };

  return (
    <Layout>
      {/* Hero Section */}
      <CategoryHero
        pageTitle={t("lppPage.title", "Avoirs LPP / Libre passage")}
        subtitle={t("lppPage.subtitle", "Retrouvez et optimisez votre 2e pilier")}
        buttonLabel={t("lppPage.compareButton", "Vérifier mon avoir LPP")}
        buttonIcon={Landmark}
        onButtonClick={handleCompareClick}
      />

      {/* Stats Bar */}
      <StatsBar />

      {/* Content with Table of Contents */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            {/* Table of Contents */}
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

            {/* Main Content */}
            <div className="space-y-12">
              <div id="what-is" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("lppPage.whatIsLpp", "Qu'est-ce que le libre passage LPP ?")}</h2>
                <p className="text-muted-foreground mb-4">{t("lppPage.whatIsLppContent", "Quand vous quittez un emploi en Suisse, votre 2e pilier (prévoyance professionnelle) ne disparaît pas. Il est transféré sur un compte de libre passage, en attente d'être réclamé ou transféré vers une nouvelle caisse de pension.")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.whatIsPoint1", "Capital accumulé pendant votre activité professionnelle")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.whatIsPoint2", "Transféré automatiquement lors d'un changement d'emploi")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.whatIsPoint3", "Peut être placé dans une fondation de libre passage de votre choix")}</span>
                  </li>
                </ul>
              </div>

              <div id="who" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("lppPage.whoIsConcerned", "Qui est concerné ?")}</h2>
                <p className="text-muted-foreground mb-6">{t("lppPage.whoIsConcernedContent", "Toute personne ayant travaillé en Suisse et ayant changé d'emploi, quitté le pays ou cessé son activité professionnelle peut avoir des avoirs de libre passage.")}</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{t("lppPage.whoSalaried", "Salariés ayant changé d'emploi")}</h4>
                      <p className="text-sm text-muted-foreground">{t("lppPage.whoSalariedDesc", "Votre avoir LPP est transféré à chaque changement d'employeur. Des fonds peuvent rester en attente.")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-foreground mb-2">{t("lppPage.whoSelfEmployed", "Indépendants et expatriés")}</h4>
                      <p className="text-sm text-muted-foreground">{t("lppPage.whoSelfEmployedDesc", "En quittant le statut de salarié ou la Suisse, votre capital reste en libre passage.")}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div id="how-it-works" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("lppPage.howItWorks", "Comment fonctionne le libre passage ?")}</h2>
                <p className="text-muted-foreground mb-4">{t("lppPage.howItWorksContent", "Lorsque vous quittez un emploi sans en reprendre un immédiatement, votre caisse de pension transfère vos avoirs sur un compte de libre passage. Ce compte est géré par une fondation bancaire ou d'assurance.")}</p>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">1</div>
                      <h4 className="font-semibold text-foreground mb-2">{t("lppPage.step1", "Vous travaillez")}</h4>
                      <p className="text-sm text-muted-foreground">{t("lppPage.step1Desc", "Vous cotisez au 2e pilier via votre employeur")}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">2</div>
                      <h4 className="font-semibold text-foreground mb-2">{t("lppPage.step2", "Vous quittez votre emploi")}</h4>
                      <p className="text-sm text-muted-foreground">{t("lppPage.step2Desc", "Votre capital est transféré en libre passage")}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-2xl font-bold text-primary mb-2">3</div>
                      <h4 className="font-semibold text-foreground mb-2">{t("lppPage.step3", "Votre argent attend")}</h4>
                      <p className="text-sm text-muted-foreground">{t("lppPage.step3Desc", "Il reste en attente jusqu'à ce que vous le réclamiez")}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div id="forgotten" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("lppPage.forgottenFunds", "Des milliers de personnes oublient leur LPP")}</h2>
                <p className="text-muted-foreground mb-4">{t("lppPage.forgottenFundsContent", "Après un changement de vie, votre argent peut être transféré automatiquement sur un compte de la Fondation institution supplétive LPP, sans que vous le sachiez.")}</p>
                <Card className="bg-accent/10 border-accent/20">
                  <CardContent className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">{t("lppPage.forgottenStats", "Le saviez-vous ?")}</h4>
                    <div className="space-y-2 text-muted-foreground">
                      <p>{t("lppPage.forgottenStat1", "💰 En moyenne CHF 12'838 par personne")}</p>
                      <p>{t("lppPage.forgottenStat2", "📊 Des milliards de francs dorment en Suisse")}</p>
                      <p>{t("lppPage.forgottenStat3", "⚠️ Votre argent peut dormir quelque part sans que vous le sachiez")}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div id="retrieve" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("lppPage.howToRetrieve", "Comment retrouver ses avoirs ?")}</h2>
                <p className="text-muted-foreground mb-4">{t("lppPage.howToRetrieveContent", "Plusieurs démarches sont possibles pour retrouver et optimiser vos avoirs de libre passage.")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.retrieve1", "Retrouver vos fonds LPP via la Centrale du 2e pilier")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.retrieve2", "Réunir plusieurs comptes de libre passage")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.retrieve3", "Transférer votre capital vers une fondation plus avantageuse")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.retrieve4", "Optimiser votre situation avec un conseiller spécialisé")}</span>
                  </li>
                </ul>
              </div>

              <div id="tax" className="scroll-mt-24">
                <h2 className="text-3xl font-bold text-foreground mb-6">{t("lppPage.taxImplications", "Attention à l'impôt")}</h2>
                <p className="text-muted-foreground mb-4">{t("lppPage.taxImplicationsContent", "Retirer votre LPP peut avoir un impact fiscal important. Un accompagnement professionnel permet d'éviter les erreurs et d'optimiser votre retrait.")}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.taxPoint1", "Le retrait est soumis à un impôt spécial, séparé du revenu")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.taxPoint2", "Le taux varie selon le canton et le montant retiré")}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{t("lppPage.taxPoint3", "Un échelonnement des retraits peut réduire la charge fiscale")}</span>
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
                {t("lppPage.readyToCheck", "Vous avez peut-être un avoir LPP oublié")}
              </h2>
              <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
                {t("lppPage.readyToCheckDesc", "Vérifiez gratuitement votre situation en moins d'une minute.")}
              </p>
              <Button size="sm" className="gap-1.5 md:gap-2 text-xs md:text-base h-9 md:h-11 px-4 md:px-6" onClick={handleCompareClick}>
                <Landmark className="h-3.5 w-3.5 md:h-5 md:w-5" />
                <span className="hidden sm:inline">{t("lppPage.compareButton", "Vérifier mon avoir LPP")}</span>
                <span className="sm:hidden">{t("lppPage.compareButtonShort", "Vérifier")}</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AvoirsLpp;
