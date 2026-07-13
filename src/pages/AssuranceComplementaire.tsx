// Marketing/SEO page for complémentaire (route: assurance-complementaire).
// The rich educational content lives HERE (full site chrome), while the
// funnel page (assurance-complementaire-offres → ComparateurComplementaire)
// is a pure single-screen form.
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import CategoryHero from "@/components/home/CategoryHero";
import { Button } from "@/components/ui/button";
import { useLocalizedPath } from "@/hooks/useLocalizedPath";
import llamaMascot from "@/assets/llama-mascot.png";
import {
  Shield,
  HeartPulse,
  Stethoscope,
  Leaf,
  Smile,
  Plane,
  AlertTriangle,
  BedDouble,
  FileCheck2,
  Sparkles,
  BadgePercent,
} from "lucide-react";

const AssuranceComplementaire = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { localizedPath } = useLocalizedPath();

  const goToFunnel = () => navigate(localizedPath("/assurance-complementaire-offres"));

  const benefits = [
    {
      icon: Shield,
      title: "Comblez les lacunes de la LAMal",
      text: "Hospitalisation, dentaire, médecines douces, lunettes : couvrez tout ce que l'assurance de base ne prend pas en charge.",
    },
    {
      icon: BadgePercent,
      title: "Jusqu'à 40% d'économies",
      text: "Notre comparateur identifie les meilleures offres LCA du marché suisse adaptées à votre profil.",
    },
    {
      icon: FileCheck2,
      title: "Conseil 100% indépendant",
      text: "Nous comparons toutes les caisses partenaires pour vous proposer la couverture la plus pertinente.",
    },
    {
      icon: Sparkles,
      title: "Offres exclusives",
      text: "Profitez de rabais négociés et de conditions préférentielles réservées à nos clients.",
    },
  ];

  const modules = [
    {
      icon: Stethoscope,
      title: "Soins ambulatoires",
      text: "Médicaments hors-liste, lunettes, transports d'urgence, psychologue, moyens auxiliaires : les premières lacunes comblées.",
    },
    {
      icon: Leaf,
      title: "Médecines douces",
      text: "Ostéopathie, homéopathie, acupuncture, médecines chinoises : un accès complet aux thérapies naturelles.",
    },
    {
      icon: Smile,
      title: "Soins dentaires & orthodontie",
      text: "Contrôles, caries, détartrage, appareils dentaires : préservez votre budget santé familial.",
    },
    {
      icon: Plane,
      title: "Vacances & voyages à l'étranger",
      text: "Frais médicaux, hospitalisation et rapatriement en Suisse : voyagez l'esprit tranquille.",
    },
    {
      icon: AlertTriangle,
      title: "Assurance accident",
      text: "Chambre privée, libre choix du médecin et capital invalidité : une protection essentielle au quotidien.",
    },
    {
      icon: BedDouble,
      title: "Hospitalisation privée",
      text: "Accès aux meilleurs spécialistes, cliniques privées, chambre individuelle et prise en charge rapide.",
    },
  ];

  return (
    <Layout>
      <CategoryHero
        pageTitle={t("comparators.complementary.heroTitle", "ASSURANCE COMPLÉMENTAIRE : COMPAREZ ET ÉCONOMISEZ JUSQU'À 40%")}
        subtitle={t(
          "comparators.complementary.heroSubtitle",
          "Hospitalisation, dentaire, fitness, médecine alternative… Recevez une offre LCA sur mesure et optimisez vos primes."
        )}
        buttonLabel={t("comparators.complementary.compareButton", "Comparer les complémentaires")}
        buttonIcon={HeartPulse}
        onButtonClick={goToFunnel}
      />

      {/* Pourquoi c'est important */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Shield className="h-4 w-4" />
                Assurances complémentaires LCA
              </div>
              <h2 className="font-heading text-2xl md:text-4xl font-black mb-4 text-foreground">
                Pourquoi souscrire une assurance complémentaire ?
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                La LAMal couvre uniquement le strict minimum. Les complémentaires LCA vous permettent
                d'accéder à des soins de meilleure qualité, à plus de confort et à des prestations
                exclusives selon vos besoins et ceux de votre famille.
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
                LAMal ou LCA : quelle différence ?
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
                <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                  Obligatoire
                </div>
                <h3 className="font-heading font-black text-xl mb-3 text-foreground">
                  Assurance de base (LAMal)
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Obligatoire pour toute personne domiciliée en Suisse. Elle couvre les soins
                  essentiels mais laisse de nombreuses lacunes : dentaire, médecines douces,
                  confort hospitalier, lunettes, etc.
                </p>
              </div>
              <div className="bg-background border-2 border-accent/30 rounded-2xl p-6">
                <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                  Recommandée
                </div>
                <h3 className="font-heading font-black text-xl mb-3 text-foreground">
                  Complémentaires (LCA)
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Facultatives, elles comblent les lacunes de la LAMal et vous offrent un meilleur
                  confort, le libre choix du médecin, l'accès aux cliniques privées et bien plus
                  encore.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 modules */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-4xl font-black mb-3 text-foreground">
                Composez votre couverture idéale
              </h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                6 modules complémentaires pour adapter votre protection santé à votre mode de vie.
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
              * Les prestations octroyées dépendent des conditions d'assurance de chaque caisse maladie.
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
              Prêt à optimiser vos complémentaires ?
            </h2>
            <p className="text-xs md:text-base text-muted-foreground mb-4 md:mb-6 max-w-xl mx-auto">
              Recevez gratuitement les meilleures offres LCA du marché suisse en 2 minutes.
            </p>
            <Button size="lg" className="gap-2" onClick={goToFunnel}>
              <HeartPulse className="h-5 w-5" />
              Comparer les complémentaires
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceComplementaire;
