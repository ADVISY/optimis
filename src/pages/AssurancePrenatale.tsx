// Marketing/SEO page for prénatale (route: assurance-prenatale).
// The rich educational content lives HERE (full site chrome), while the
// funnel page (assurance-prenatale-offres → ComparateurPrenatal) is a pure form.
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CategoryHero from "@/components/home/CategoryHero";
import { Button } from "@/components/ui/button";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import llamaMascot from "@/assets/llama-mascot.png";
import {
  Shield,
  Baby,
  Stethoscope,
  Leaf,
  Smile,
  Plane,
  AlertTriangle,
  BedDouble,
  Wallet,
  FileCheck2,
  Sparkles,
} from "lucide-react";

const AssurancePrenatale = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const goToFunnel = () => navigate(localizedPath("/assurance-prenatale-offres"));

  const benefits = [
    {
      icon: Shield,
      title: t("comparators.prenatal.benefits.b1.title", "La meilleure protection dès le 1er jour"),
      text: t(
        "comparators.prenatal.benefits.b1.text",
        "Votre bébé est couvert dès sa naissance, même s'il est prématuré ou présente des problèmes de santé."
      ),
    },
    {
      icon: FileCheck2,
      title: t("comparators.prenatal.benefits.b2.title", "Sans questionnaire de santé"),
      text: t(
        "comparators.prenatal.benefits.b2.text",
        "Aucune réserve, aucun refus possible : les complémentaires de votre choix sont garanties."
      ),
    },
    {
      icon: Wallet,
      title: t("comparators.prenatal.benefits.b3.title", "Aucune prime avant la naissance"),
      text: t(
        "comparators.prenatal.benefits.b3.text",
        "Vous ne payez rien tant que votre enfant n'est pas né. Anticipez sans frais."
      ),
    },
    {
      icon: Sparkles,
      title: t("comparators.prenatal.benefits.b4.title", "Rabais sur les complémentaires"),
      text: t(
        "comparators.prenatal.benefits.b4.text",
        "Profitez de rabais exclusifs proposés par les caisses maladie aux nouveaux assurés prénataux."
      ),
    },
  ];

  const modules = [
    {
      icon: Stethoscope,
      title: t("comparators.prenatal.modules.m1.title", "Soins ambulatoires"),
      text: t(
        "comparators.prenatal.modules.m1.text",
        "Médicaments hors-listes, lunettes, transports d'urgence, frais de psychologue, moyens auxiliaires : les premières lacunes de la LAMal comblées."
      ),
    },
    {
      icon: Leaf,
      title: t("comparators.prenatal.modules.m2.title", "Médecines douces"),
      text: t(
        "comparators.prenatal.modules.m2.text",
        "Ostéopathie, homéopathie, kinésiologie, médecines chinoises : un accès aux thérapies naturelles pour votre enfant."
      ),
    },
    {
      icon: Smile,
      title: t("comparators.prenatal.modules.m3.title", "Soins dentaires & orthodontie"),
      text: t(
        "comparators.prenatal.modules.m3.text",
        "Contrôles, caries, détartrage, appareils dentaires : la couverture indispensable pour préserver le budget familial."
      ),
    },
    {
      icon: Plane,
      title: t("comparators.prenatal.modules.m4.title", "Vacances & voyages à l'étranger"),
      text: t(
        "comparators.prenatal.modules.m4.text",
        "Frais médicaux et hospitalisation à l'étranger, rapatriement en Suisse : voyagez l'esprit tranquille avec bébé."
      ),
    },
    {
      icon: AlertTriangle,
      title: t("comparators.prenatal.modules.m5.title", "Assurance accident"),
      text: t(
        "comparators.prenatal.modules.m5.text",
        "Chambre privée, libre choix du médecin et capital invalidité : une protection essentielle pour les premières années."
      ),
    },
    {
      icon: BedDouble,
      title: t("comparators.prenatal.modules.m6.title", "Hospitalisation privée"),
      text: t(
        "comparators.prenatal.modules.m6.text",
        "Accès aux meilleurs spécialistes, cliniques privées, chambre individuelle et prise en charge rapide en cas d'urgence."
      ),
    },
  ];

  return (
    <Layout>
      <CategoryHero
        pageTitle={t("comparators.prenatal.heroTitle", "ASSURANCE PRÉNATALE : PROTÉGEZ VOTRE BÉBÉ AVANT LA NAISSANCE")}
        subtitle={t(
          "comparators.prenatal.heroSubtitle",
          "Souscrivez une assurance complémentaire pour votre bébé avant sa naissance et garantissez sa couverture santé sans questions médicales."
        )}
        buttonLabel={t("comparators.prenatal.compareButton", "Comparer les offres prénatales")}
        buttonIcon={Baby}
        onButtonClick={goToFunnel}
      />

      {/* Pourquoi c'est important */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                {t("comparators.prenatal.badge", "Pour les futures mamans")}
              </div>
              <h2 className="font-heading text-2xl md:text-4xl font-black mb-4 text-foreground">
                {t("comparators.prenatal.whyTitle", "Pourquoi souscrire une assurance prénatale ?")}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                {t(
                  "comparators.prenatal.whyText",
                  "Après la naissance, les caisses maladie peuvent exiger un questionnaire de santé pour les complémentaires et exclure certaines pathologies. En souscrivant avant l'accouchement, vous garantissez à votre bébé l'accès à toutes les couvertures, sans réserve ni refus."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              {benefits.map(({ icon: Icon, title, text }, i) => (
                <div
                  key={i}
                  className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LAMal vs LCA */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-heading text-2xl md:text-4xl font-black mb-3 text-foreground">
                {t("comparators.prenatal.coverageTitle", "Quelles couvertures pour votre enfant ?")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  {t("comparators.prenatal.lamalLabel", "Obligatoire")}
                </div>
                <h3 className="font-heading font-black text-xl mb-3 text-foreground">
                  {t("comparators.prenatal.lamalTitle", "Assurance de base (LAMal)")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "comparators.prenatal.lamalText",
                    "Obligatoire dès la naissance pour toute personne domiciliée en Suisse. La caisse ne peut ni refuser votre bébé, ni émettre d'exclusion liée à son état de santé."
                  )}
                </p>
              </div>
              <div className="bg-background border-2 border-accent/30 rounded-2xl p-6">
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  {t("comparators.prenatal.lcaLabel", "Recommandée")}
                </div>
                <h3 className="font-heading font-black text-xl mb-3 text-foreground">
                  {t("comparators.prenatal.lcaTitle", "Complémentaires (LCA)")}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(
                    "comparators.prenatal.lcaText",
                    "Non obligatoires mais essentielles : elles comblent les lacunes de la LAMal. Conclues avant la naissance, elles sont accordées sans restriction ni questionnaire de santé."
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Baby Package - 6 modules */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-4xl font-black mb-3 text-foreground">
                {t("comparators.prenatal.packageTitle", "Composez le Baby Package idéal")}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t(
                  "comparators.prenatal.packageSubtitle",
                  "6 modules complémentaires pour offrir à votre bébé la couverture santé la plus complète."
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {modules.map(({ icon: Icon, title, text }, i) => (
                <div
                  key={i}
                  className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/15 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 text-foreground">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/70 text-center mt-6 italic">
              {t(
                "comparators.prenatal.packageDisclaimer",
                "* Les prestations octroyées dépendent des conditions d'assurance de chaque caisse maladie."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* CTA final vers le funnel */}
      <section className="py-8 md:py-16">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto bg-primary/5 border border-primary/20 rounded-2xl p-6 md:p-12 text-center">
            <img src={llamaMascot} alt="Mascotte Optimis" className="h-16 md:h-24 mx-auto mb-4 md:mb-6" />
            <h2 className="text-lg md:text-3xl font-bold text-foreground mb-2 md:mb-4">
              {t("comparators.prenatal.ctaTitle", "Prêt à protéger votre bébé ?")}
            </h2>
            <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
              {t("comparators.prenatal.ctaText", "Recevez gratuitement les meilleures offres prénatales en 2 minutes.")}
            </p>
            <Button size="lg" className="gap-2" onClick={goToFunnel}>
              <Baby className="h-5 w-5" />
              {t("comparators.prenatal.ctaButton", "Comparer les offres prénatales")}
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AssurancePrenatale;
