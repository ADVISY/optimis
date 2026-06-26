import Layout from "@/components/layout/Layout";
import ComplementaryInsuranceForm from "@/components/forms/ComplementaryInsuranceForm";
import { useTranslation } from "react-i18next";
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

type Lang = "fr" | "de" | "it" | "en";

const CONTENT = {
  fr: {
    h1: "ASSURANCE COMPLÉMENTAIRE : COMPAREZ ET ÉCONOMISEZ JUSQU'À 40%",
    sub: "Hospitalisation, dentaire, fitness, médecine alternative… Recevez une offre LCA sur mesure et optimisez vos primes.",
    badge1: "En 2 minutes",
    badge2: "Jusqu'à 40% d'économies sur vos primes",
    badge3: "Toutes les caisses comparées",
    sectionBadge: "Assurances complémentaires LCA",
    whyTitle: "Pourquoi souscrire une assurance complémentaire ?",
    whyText:
      "La LAMal couvre uniquement le strict minimum. Les complémentaires LCA vous permettent d'accéder à des soins de meilleure qualité, à plus de confort et à des prestations exclusives selon vos besoins et ceux de votre famille.",
    benefits: [
      { icon: Shield, title: "Comblez les lacunes de la LAMal", text: "Hospitalisation, dentaire, médecines douces, lunettes : couvrez tout ce que l'assurance de base ne prend pas en charge." },
      { icon: BadgePercent, title: "Jusqu'à 40% d'économies", text: "Notre comparateur identifie les meilleures offres LCA du marché suisse adaptées à votre profil." },
      { icon: FileCheck2, title: "Conseil 100% indépendant", text: "Nous comparons toutes les caisses partenaires pour vous proposer la couverture la plus pertinente." },
      { icon: Sparkles, title: "Offres exclusives", text: "Profitez de rabais négociés et de conditions préférentielles réservées à nos clients." },
    ],
    diffTitle: "LAMal ou LCA : quelle différence ?",
    obligatoire: "Obligatoire",
    recommande: "Recommandée",
    lamalTitle: "Assurance de base (LAMal)",
    lamalText: "Obligatoire pour toute personne domiciliée en Suisse. Elle couvre les soins essentiels mais laisse de nombreuses lacunes : dentaire, médecines douces, confort hospitalier, lunettes, etc.",
    lcaTitle: "Complémentaires (LCA)",
    lcaText: "Facultatives, elles comblent les lacunes de la LAMal et vous offrent un meilleur confort, le libre choix du médecin, l'accès aux cliniques privées et bien plus encore.",
    modulesTitle: "Composez votre couverture idéale",
    modulesSub: "6 modules complémentaires pour adapter votre protection santé à votre mode de vie.",
    modules: [
      { icon: Stethoscope, title: "Soins ambulatoires", text: "Médicaments hors-liste, lunettes, transports d'urgence, psychologue, moyens auxiliaires : les premières lacunes comblées." },
      { icon: Leaf, title: "Médecines douces", text: "Ostéopathie, homéopathie, acupuncture, médecines chinoises : un accès complet aux thérapies naturelles." },
      { icon: Smile, title: "Soins dentaires & orthodontie", text: "Contrôles, caries, détartrage, appareils dentaires : préservez votre budget santé familial." },
      { icon: Plane, title: "Vacances & voyages à l'étranger", text: "Frais médicaux, hospitalisation et rapatriement en Suisse : voyagez l'esprit tranquille." },
      { icon: AlertTriangle, title: "Assurance accident", text: "Chambre privée, libre choix du médecin et capital invalidité : une protection essentielle au quotidien." },
      { icon: BedDouble, title: "Hospitalisation privée", text: "Accès aux meilleurs spécialistes, cliniques privées, chambre individuelle et prise en charge rapide." },
    ],
    disclaimer: "* Les prestations octroyées dépendent des conditions d'assurance de chaque caisse maladie.",
    trust1: "100% gratuit",
    trust2: "Sans engagement",
    trust3: "Données protégées (nLPD)",
  },
  de: {
    h1: "ZUSATZVERSICHERUNG: VERGLEICHEN UND BIS ZU 40% SPAREN",
    sub: "Spital, Zahn, Fitness, Alternativmedizin… Erhalten Sie ein massgeschneidertes VVG-Angebot und optimieren Sie Ihre Prämien.",
    badge1: "In 2 Minuten",
    badge2: "Bis zu 40% Ersparnis auf Ihren Prämien",
    badge3: "Alle Kassen verglichen",
    sectionBadge: "Zusatzversicherungen VVG",
    whyTitle: "Warum eine Zusatzversicherung abschliessen?",
    whyText:
      "Die KVG deckt nur das absolute Minimum. Die VVG-Zusatzversicherungen ermöglichen Ihnen Zugang zu besserer Pflege, mehr Komfort und exklusiven Leistungen, angepasst an Ihre Bedürfnisse und die Ihrer Familie.",
    benefits: [
      { icon: Shield, title: "Schliessen Sie KVG-Lücken", text: "Spital, Zahn, Alternativmedizin, Brillen: Deckung all dessen, was die Grundversicherung nicht übernimmt." },
      { icon: BadgePercent, title: "Bis zu 40% Ersparnis", text: "Unser Vergleicher identifiziert die besten VVG-Angebote des Schweizer Marktes für Ihr Profil." },
      { icon: FileCheck2, title: "100% unabhängige Beratung", text: "Wir vergleichen alle Partnerkassen, um Ihnen die passendste Deckung anzubieten." },
      { icon: Sparkles, title: "Exklusive Angebote", text: "Profitieren Sie von ausgehandelten Rabatten und Vorzugskonditionen, die unseren Kunden vorbehalten sind." },
    ],
    diffTitle: "KVG oder VVG: Was ist der Unterschied?",
    obligatoire: "Obligatorisch",
    recommande: "Empfohlen",
    lamalTitle: "Grundversicherung (KVG)",
    lamalText: "Obligatorisch für jede in der Schweiz wohnhafte Person. Sie deckt die wesentliche Pflege ab, lässt jedoch zahlreiche Lücken: Zahn, Alternativmedizin, Spitalkomfort, Brillen usw.",
    lcaTitle: "Zusatzversicherungen (VVG)",
    lcaText: "Freiwillig: Sie schliessen die Lücken der KVG und bieten Ihnen mehr Komfort, freie Arztwahl, Zugang zu Privatkliniken und vieles mehr.",
    modulesTitle: "Stellen Sie Ihre ideale Deckung zusammen",
    modulesSub: "6 Zusatzmodule, um Ihren Gesundheitsschutz an Ihren Lebensstil anzupassen.",
    modules: [
      { icon: Stethoscope, title: "Ambulante Pflege", text: "Nicht-Liste-Medikamente, Brillen, Notfalltransporte, Psychologe, Hilfsmittel: die ersten geschlossenen Lücken." },
      { icon: Leaf, title: "Alternativmedizin", text: "Osteopathie, Homöopathie, Akupunktur, chinesische Medizin: voller Zugang zu naturheilkundlichen Therapien." },
      { icon: Smile, title: "Zahnpflege & Kieferorthopädie", text: "Kontrollen, Karies, Zahnsteinentfernung, Zahnspangen: schonen Sie Ihr Familien-Gesundheitsbudget." },
      { icon: Plane, title: "Ferien & Reisen im Ausland", text: "Medizinische Kosten, Spital und Rücktransport in die Schweiz: reisen Sie sorgenfrei." },
      { icon: AlertTriangle, title: "Unfallversicherung", text: "Privatzimmer, freie Arztwahl und Invaliditätskapital: ein essenzieller Schutz im Alltag." },
      { icon: BedDouble, title: "Privatabteilung Spital", text: "Zugang zu den besten Spezialisten, Privatkliniken, Einzelzimmer und schnelle Behandlung." },
    ],
    disclaimer: "* Die gewährten Leistungen hängen von den Versicherungsbedingungen jeder Krankenkasse ab.",
    trust1: "100% kostenlos",
    trust2: "Unverbindlich",
    trust3: "Daten geschützt (revDSG)",
  },
  it: {
    h1: "ASSICURAZIONE COMPLEMENTARE: CONFRONTA E RISPARMIA FINO AL 40%",
    sub: "Ospedalizzazione, dentale, fitness, medicina alternativa… Ricevi un'offerta LCA su misura e ottimizza i tuoi premi.",
    badge1: "In 2 minuti",
    badge2: "Fino al 40% di risparmio sui premi",
    badge3: "Tutte le casse confrontate",
    sectionBadge: "Assicurazioni complementari LCA",
    whyTitle: "Perché sottoscrivere un'assicurazione complementare?",
    whyText:
      "La LAMal copre solo lo stretto necessario. Le complementari LCA vi permettono di accedere a cure di migliore qualità, più comfort e prestazioni esclusive in base alle vostre esigenze e a quelle della vostra famiglia.",
    benefits: [
      { icon: Shield, title: "Colmate le lacune della LAMal", text: "Ospedalizzazione, dentale, medicine dolci, occhiali: coprite tutto ciò che l'assicurazione di base non prevede." },
      { icon: BadgePercent, title: "Fino al 40% di risparmio", text: "Il nostro comparatore identifica le migliori offerte LCA del mercato svizzero adatte al vostro profilo." },
      { icon: FileCheck2, title: "Consulenza 100% indipendente", text: "Confrontiamo tutte le casse partner per proporvi la copertura più pertinente." },
      { icon: Sparkles, title: "Offerte esclusive", text: "Approfittate di sconti negoziati e condizioni preferenziali riservate ai nostri clienti." },
    ],
    diffTitle: "LAMal o LCA: qual è la differenza?",
    obligatoire: "Obbligatoria",
    recommande: "Raccomandata",
    lamalTitle: "Assicurazione di base (LAMal)",
    lamalText: "Obbligatoria per ogni persona domiciliata in Svizzera. Copre le cure essenziali ma lascia numerose lacune: dentale, medicine dolci, comfort ospedaliero, occhiali, ecc.",
    lcaTitle: "Complementari (LCA)",
    lcaText: "Facoltative, colmano le lacune della LAMal e vi offrono maggiore comfort, libera scelta del medico, accesso alle cliniche private e molto altro.",
    modulesTitle: "Componete la vostra copertura ideale",
    modulesSub: "6 moduli complementari per adattare la vostra protezione sanitaria al vostro stile di vita.",
    modules: [
      { icon: Stethoscope, title: "Cure ambulatoriali", text: "Farmaci fuori lista, occhiali, trasporti d'urgenza, psicologo, mezzi ausiliari: le prime lacune colmate." },
      { icon: Leaf, title: "Medicine dolci", text: "Osteopatia, omeopatia, agopuntura, medicine cinesi: accesso completo alle terapie naturali." },
      { icon: Smile, title: "Cure dentali & ortodonzia", text: "Controlli, carie, detartrasi, apparecchi dentali: preservate il budget sanitario familiare." },
      { icon: Plane, title: "Vacanze & viaggi all'estero", text: "Spese mediche, ospedalizzazione e rimpatrio in Svizzera: viaggiate con la mente tranquilla." },
      { icon: AlertTriangle, title: "Assicurazione infortuni", text: "Camera privata, libera scelta del medico e capitale invalidità: una protezione essenziale ogni giorno." },
      { icon: BedDouble, title: "Ospedalizzazione privata", text: "Accesso ai migliori specialisti, cliniche private, camera singola e presa in carico rapida." },
    ],
    disclaimer: "* Le prestazioni concesse dipendono dalle condizioni assicurative di ciascuna cassa malati.",
    trust1: "100% gratuito",
    trust2: "Senza impegno",
    trust3: "Dati protetti (nLPD)",
  },
  en: {
    h1: "SUPPLEMENTARY INSURANCE: COMPARE AND SAVE UP TO 40%",
    sub: "Hospitalization, dental, fitness, alternative medicine… Get a tailored LCA offer and optimize your premiums.",
    badge1: "In 2 minutes",
    badge2: "Up to 40% savings on your premiums",
    badge3: "All insurers compared",
    sectionBadge: "LCA supplementary insurance",
    whyTitle: "Why take out supplementary insurance?",
    whyText:
      "LAMal (basic health insurance) only covers the bare minimum. LCA supplementary plans give you access to higher-quality care, more comfort and exclusive benefits tailored to you and your family.",
    benefits: [
      { icon: Shield, title: "Fill the gaps in LAMal", text: "Hospital, dental, alternative medicine, glasses: cover everything basic insurance doesn't." },
      { icon: BadgePercent, title: "Up to 40% savings", text: "Our comparator finds the best LCA offers on the Swiss market for your profile." },
      { icon: FileCheck2, title: "100% independent advice", text: "We compare all partner insurers to recommend the most relevant coverage." },
      { icon: Sparkles, title: "Exclusive offers", text: "Enjoy negotiated discounts and preferred conditions reserved for our clients." },
    ],
    diffTitle: "LAMal or LCA: what's the difference?",
    obligatoire: "Mandatory",
    recommande: "Recommended",
    lamalTitle: "Basic insurance (LAMal)",
    lamalText: "Mandatory for anyone residing in Switzerland. It covers essential care but leaves many gaps: dental, alternative medicine, hospital comfort, glasses, etc.",
    lcaTitle: "Supplementary (LCA)",
    lcaText: "Optional, they fill the gaps in LAMal and give you more comfort, free choice of doctor, access to private clinics and much more.",
    modulesTitle: "Build your ideal coverage",
    modulesSub: "6 supplementary modules to tailor your health protection to your lifestyle.",
    modules: [
      { icon: Stethoscope, title: "Outpatient care", text: "Off-list medication, glasses, emergency transport, psychologist, medical aids: the first gaps filled." },
      { icon: Leaf, title: "Alternative medicine", text: "Osteopathy, homeopathy, acupuncture, Chinese medicine: full access to natural therapies." },
      { icon: Smile, title: "Dental care & orthodontics", text: "Check-ups, cavities, scaling, braces: protect your family health budget." },
      { icon: Plane, title: "Holidays & travel abroad", text: "Medical costs, hospital stays and repatriation to Switzerland: travel with peace of mind." },
      { icon: AlertTriangle, title: "Accident insurance", text: "Private room, free choice of doctor and disability capital: essential everyday protection." },
      { icon: BedDouble, title: "Private hospitalization", text: "Access to top specialists, private clinics, single room and fast care." },
    ],
    disclaimer: "* The benefits granted depend on each insurer's terms and conditions.",
    trust1: "100% free",
    trust2: "No commitment",
    trust3: "Data protected (nFADP)",
  },
} as const;

const ComparateurComplementaire = () => {
  const { i18n } = useTranslation();
  const lang = (["fr", "de", "it", "en"].includes(i18n.language) ? i18n.language : "fr") as Lang;
  const c = CONTENT[lang];

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
                {c.h1}
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mb-3 max-w-xl mx-auto">
                {c.sub}
              </p>
              <div className="flex flex-col items-start gap-1.5 max-w-md mx-auto text-left">
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <Clock className="h-4 w-4 shrink-0" />
                  {c.badge1}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <BadgePercent className="h-4 w-4 shrink-0" />
                  {c.badge2}
                </div>
                <div className="flex items-center gap-2 text-primary font-semibold text-xs md:text-sm">
                  <HeartPulse className="h-4 w-4 shrink-0" />
                  {c.badge3}
                </div>
              </div>
            </div>

            <ComplementaryInsuranceForm />

            <div className="max-w-5xl mx-auto mt-16">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
                  <Shield className="h-4 w-4" />
                  {c.sectionBadge}
                </div>
                <h2 className="font-heading text-2xl md:text-4xl font-black mb-4 text-foreground">
                  {c.whyTitle}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                  {c.whyText}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {c.benefits.map(({ icon: Icon, title, text }, i) => (
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

            <div className="max-w-5xl mx-auto mt-16">
              <div className="text-center mb-8">
                <h2 className="font-heading text-2xl md:text-4xl font-black mb-3 text-foreground">
                  {c.diffTitle}
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-primary/5 border-2 border-primary/20 rounded-2xl p-6">
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">
                    {c.obligatoire}
                  </div>
                  <h3 className="font-heading font-black text-xl mb-3 text-foreground">
                    {c.lamalTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.lamalText}
                  </p>
                </div>
                <div className="bg-background border-2 border-accent/30 rounded-2xl p-6">
                  <div className="text-xs font-bold text-accent uppercase tracking-wider mb-2">
                    {c.recommande}
                  </div>
                  <h3 className="font-heading font-black text-xl mb-3 text-foreground">
                    {c.lcaTitle}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {c.lcaText}
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto mt-16">
              <div className="text-center mb-10">
                <h2 className="font-heading text-2xl md:text-4xl font-black mb-3 text-foreground">
                  {c.modulesTitle}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  {c.modulesSub}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {c.modules.map(({ icon: Icon, title, text }, i) => (
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
                {c.disclaimer}
              </p>
            </div>

            <div className="max-w-3xl mx-auto text-center mt-16 pt-8 border-t border-border/50">
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {c.trust1}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {c.trust2}
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {c.trust3}
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
