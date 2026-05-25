import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import PrenatalInsuranceForm from "@/components/forms/PrenatalInsuranceForm";
import {
  Shield,
  CheckCircle,
  Clock,
  Baby,
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
} from "lucide-react";

const ComparateurPrenatal = () => {
  const { t } = useTranslation();

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
                {t("comparators.prenatal.heroTitle", "ASSURANCE PRÉNATALE : PROTÉGEZ VOTRE BÉBÉ AVANT LA NAISSANCE")}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-3 max-w-xl mx-auto">
                {t("comparators.prenatal.heroSubtitle", "Souscrivez une assurance complémentaire pour votre bébé avant sa naissance et garantissez sa couverture santé sans questions médicales.")}
              </p>
              <div className="flex flex-col items-start gap-1.5 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  {t("comparators.prenatal.bullet1", "En 2 minutes")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Baby className="h-4 w-4 shrink-0" />
                  {t("comparators.prenatal.bullet2", "Aucune question médicale pour bébé")}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <HeartPulse className="h-4 w-4 shrink-0" />
                  {t("comparators.prenatal.bullet3", "Couverture complète dès la naissance")}
                </div>
              </div>
            </div>

            <PrenatalInsuranceForm />

            {/* Pourquoi c'est important */}
            <div className="max-w-5xl mx-auto mt-16">
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

            {/* LAMal vs LCA */}
            <div className="max-w-5xl mx-auto mt-16">
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

            {/* Baby Package - 6 modules */}
            <div className="max-w-6xl mx-auto mt-16">
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

            {/* Trust footer */}
            <div className="max-w-3xl mx-auto text-center mt-16 pt-8 border-t border-border/50">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("comparators.trust.free")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("comparators.trust.noCommitment")}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {t("comparators.trust.dataProtected")}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ComparateurPrenatal;
