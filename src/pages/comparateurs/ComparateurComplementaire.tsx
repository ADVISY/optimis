import Layout from "@/components/layout/Layout";
import ComplementaryInsuranceForm from "@/components/forms/ComplementaryInsuranceForm";
import {
  Shield,
  CheckCircle,
  Clock,
  HeartPulse,
  Stethoscope,
  Leaf,
  Smile,
  Plane,
  AlertTriangle,
  BedDouble,
  Wallet,
  FileCheck2,
  Sparkles,
  BadgePercent,
} from "lucide-react";

const ComparateurComplementaire = () => {
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
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-background">
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-5 md:mb-8">
              <div className="flex gap-1 justify-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-accent text-lg md:text-xl drop-shadow-sm">★</span>
                ))}
              </div>
              <h1 className="font-heading text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-foreground tracking-tight uppercase mb-2">
                ASSURANCE COMPLÉMENTAIRE : COMPAREZ ET ÉCONOMISEZ JUSQU'À 40%
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-3 max-w-xl mx-auto">
                Hospitalisation, dentaire, fitness, médecine alternative… Recevez une offre LCA sur mesure et optimisez vos primes.
              </p>
              <div className="flex flex-col items-start gap-1.5 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  En 2 minutes
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <BadgePercent className="h-4 w-4 shrink-0" />
                  Jusqu'à 40% d'économies sur vos primes
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <HeartPulse className="h-4 w-4 shrink-0" />
                  Toutes les caisses comparées
                </div>
              </div>
            </div>

            <ComplementaryInsuranceForm />

            {/* Pourquoi c'est important */}
            <div className="max-w-5xl mx-auto mt-16">
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

            {/* LAMal vs LCA */}
            <div className="max-w-5xl mx-auto mt-16">
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

            {/* 6 modules */}
            <div className="max-w-6xl mx-auto mt-16">
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

            {/* Trust footer */}
            <div className="max-w-3xl mx-auto text-center mt-16 pt-8 border-t border-border/50">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  100% gratuit
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Sans engagement
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Données protégées (nLPD)
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparateurComplementaire;
