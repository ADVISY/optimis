import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  User,
  Stethoscope,
  HeartPulse,
  Baby,
  Landmark,
  BadgePercent,
  PiggyBank,
  Car,
  Home,
  Scale,
  Briefcase,
  FileText,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import mascotHead from "@/assets/mascotte-optimis-hd.png";
import mascotExplaining from "@/assets/mascot-explaining.png";
import mascotPointing from "@/assets/mascot-pointing.png";
import mascotArmsCrossed from "@/assets/mascot-arms-crossed.png";

// ----------------------------------------------------------------------------
// FormGuide — le "conseiller Optimis" (mascotte lama) qui accompagne le client
// tout au long du formulaire, à la manière de l'expérience Intimy.
//   • deux avatars appariés : Optimis + le client ("Optimis avec le client")
//   • une bulle de dialogue qui change selon l'étape (et le prénom si connu)
//   • la pose de la mascotte évolue selon la phase du parcours
// Ce composant est piloté par FormContainer, donc TOUS les formulaires en
// héritent automatiquement. i18n-ready (fr/de/it) avec repli sur le français.
// ----------------------------------------------------------------------------

type Phase = "intro" | "middle" | "almost" | "final";
type Lang = "fr" | "de" | "it";

interface FormGuideProps {
  currentStep: number;
  totalSteps: number;
  /** Prénom du client — dès qu'il est connu, l'avatar s'appaire ("Optimis & Camille"). */
  clientName?: string;
  /** Messages personnalisés par étape (index 0 = étape 1). Sinon message par défaut. */
  messages?: (string | null | undefined)[];
  /**
   * Produit comparé — donne une "tenue" à la mascotte (emblème métier + art dédié
   * si disponible). Ex. "sante" → stéthoscope, "hypotheque" → banque, etc.
   */
  product?: ProductKey;
  /** Rendu barre compacte (mobile) ou colonne latérale (desktop). */
  variant?: "sidebar" | "bar";
  className?: string;
}

const phaseFor = (currentStep: number, totalSteps: number): Phase => {
  if (currentStep <= 1) return "intro";
  if (currentStep >= totalSteps) return "final";
  if (currentStep >= totalSteps - 1) return "almost";
  return "middle";
};

const MASCOT_BY_PHASE: Record<Phase, string> = {
  intro: mascotExplaining,
  middle: mascotExplaining,
  almost: mascotPointing,
  final: mascotArmsCrossed,
};

// ----------------------------------------------------------------------------
// "Tenues" de la mascotte par produit.
//   • `icon`  : emblème métier affiché en pastille sur la mascotte (dispo tout de
//               suite, sans nouvel artwork). C'est la différenciation visuelle par
//               produit demandée ("santé = docteur, hypothèque = banque…").
//   • `tint`  : couleur de la pastille emblème (marque Optimis par défaut).
//   • `art`   : (OPTIONNEL) illustration de mascotte costumée dédiée. Dès qu'un
//               PNG "tenue" est fourni (ex. mascot-sante-docteur.png), on l'importe
//               et on le branche ici : il remplacera alors les poses génériques.
// Ajouter un produit = ajouter une entrée ici + passer `product="…"` au formulaire.
// ----------------------------------------------------------------------------
export type ProductKey =
  | "sante"
  | "complementaire"
  | "prenatale"
  | "hypotheque"
  | "subside"
  | "auto"
  | "menage"
  | "protectionJuridique"
  | "resiliation"
  | "pilier3"
  | "entreprise"
  | "lpp"
  | "immobilier";

interface ProductCostume {
  icon: LucideIcon;
  /** Libellé accessible de l'emblème (fr/de/it). */
  label: Record<Lang, string>;
  tint?: string;
  /** Illustration costumée dédiée (à brancher quand l'artwork existe). */
  art?: string;
}

const PRODUCT_COSTUMES: Record<ProductKey, ProductCostume> = {
  sante: { icon: Stethoscope, label: { fr: "Santé", de: "Gesundheit", it: "Salute" } },
  complementaire: { icon: HeartPulse, label: { fr: "Complémentaire", de: "Zusatz", it: "Complementare" } },
  prenatale: { icon: Baby, label: { fr: "Prénatale", de: "Pränatal", it: "Prenatale" } },
  hypotheque: { icon: Landmark, label: { fr: "Hypothèque", de: "Hypothek", it: "Ipoteca" } },
  subside: { icon: BadgePercent, label: { fr: "Subside", de: "Verbilligung", it: "Sussidio" } },
  auto: { icon: Car, label: { fr: "Auto", de: "Auto", it: "Auto" } },
  menage: { icon: Home, label: { fr: "Ménage", de: "Hausrat", it: "Economia" } },
  protectionJuridique: { icon: Scale, label: { fr: "Protection juridique", de: "Rechtsschutz", it: "Protezione giuridica" } },
  resiliation: { icon: FileText, label: { fr: "Résiliation", de: "Kündigung", it: "Disdetta" } },
  pilier3: { icon: PiggyBank, label: { fr: "3e pilier", de: "3. Säule", it: "3° pilastro" } },
  entreprise: { icon: Briefcase, label: { fr: "Entreprise", de: "Unternehmen", it: "Impresa" } },
  lpp: { icon: ShieldCheck, label: { fr: "LPP", de: "BVG", it: "LPP" } },
  immobilier: { icon: Home, label: { fr: "Immobilier", de: "Immobilien", it: "Immobiliare" } },
};

/** Pastille "tenue métier" posée sur la mascotte (épaule gauche). */
const CostumeBadge = ({
  costume,
  lang,
  size,
}: {
  costume: ProductCostume;
  lang: Lang;
  size: "sm" | "md";
}) => {
  const Icon = costume.icon;
  const dim = size === "md" ? "h-9 w-9" : "h-7 w-7";
  const iconDim = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span
      aria-label={costume.label[lang]}
      title={costume.label[lang]}
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow ring-1 ring-emerald-200",
        dim,
      )}
      style={costume.tint ? { backgroundColor: costume.tint } : undefined}
    >
      <Icon className={iconDim} strokeWidth={2.5} />
    </span>
  );
};

// Gabarits par langue. {name} est remplacé par ", Prénom" (ou "" si inconnu).
const TEMPLATES: Record<Lang, Record<Phase, string>> = {
  fr: {
    intro:
      "Ravi de t'accompagner{name} ! Quelques questions simples et je compare pour toi.",
    middle: "Tu avances très bien{name}, on continue !",
    almost: "Presque terminé{name} ! Plus qu'une étape.",
    final:
      "Dernière étape{name} : tes coordonnées pour recevoir ton comparatif gratuit.",
  },
  de: {
    intro:
      "Schön, dass ich dich begleiten darf{name}! Ein paar einfache Fragen und ich vergleiche für dich.",
    middle: "Du machst das super{name}, weiter geht's!",
    almost: "Fast geschafft{name}! Nur noch ein Schritt.",
    final:
      "Letzter Schritt{name}: deine Kontaktdaten für deinen kostenlosen Vergleich.",
  },
  it: {
    intro:
      "Felice di accompagnarti{name}! Poche domande semplici e confronto per te.",
    middle: "Stai andando benissimo{name}, continuiamo!",
    almost: "Quasi finito{name}! Manca solo un passaggio.",
    final:
      "Ultimo passaggio{name}: i tuoi recapiti per ricevere il confronto gratuito.",
  },
};

// Variantes pour la phase "milieu" : évitent une bulle identique à chaque étape
// quand le formulaire ne fournit pas de messages sur-mesure.
const MIDDLE_VARIANTS: Record<Lang, string[]> = {
  fr: [
    "Tu avances très bien{name}, on continue !",
    "C'est noté{name} ! Encore quelques détails.",
    "Parfait{name}, on y est presque.",
  ],
  de: [
    "Du machst das super{name}, weiter geht's!",
    "Notiert{name}! Nur noch ein paar Angaben.",
    "Perfekt{name}, wir sind fast da.",
  ],
  it: [
    "Stai andando benissimo{name}, continuiamo!",
    "Annotato{name}! Ancora qualche dettaglio.",
    "Perfetto{name}, ci siamo quasi.",
  ],
};

const ROLE: Record<Lang, { advisor: string; together: string }> = {
  fr: { advisor: "Ton conseiller", together: "On avance ensemble" },
  de: { advisor: "Dein Berater", together: "Gemeinsam unterwegs" },
  it: { advisor: "Il tuo consulente", together: "Avanziamo insieme" },
};

const SpeechBubble = ({
  message,
  stepKey,
  compact,
}: {
  message: string;
  stepKey: number;
  compact?: boolean;
}) => (
  <div
    className={cn(
      "relative rounded-2xl border border-emerald-200 bg-white text-emerald-900 shadow-sm",
      compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-[15px] leading-snug",
    )}
  >
    {/* Petite pointe de la bulle : vers le bas (desktop) ou vers la gauche (mobile) */}
    <span
      aria-hidden
      className={cn(
        "absolute h-3 w-3 rotate-45 border-emerald-200 bg-white",
        compact
          ? "-left-1.5 top-1/2 -translate-y-1/2 border-b border-l"
          : "-top-1.5 left-1/2 -translate-x-1/2 border-l border-t",
      )}
    />
    {/* key={stepKey} => l'animation se rejoue à chaque changement d'étape */}
    <p key={stepKey} className="animate-fade-in m-0">
      {message}
    </p>
  </div>
);

const ClientBadge = ({
  clientName,
  size,
}: {
  clientName?: string;
  size: "sm" | "md";
}) => {
  const initial = clientName?.trim()?.charAt(0)?.toUpperCase();
  const dim = size === "md" ? "h-9 w-9 text-base" : "h-7 w-7 text-xs";
  return (
    <span
      className={cn(
        "flex items-center justify-center rounded-full border-2 border-white font-bold shadow ring-1 ring-emerald-200",
        dim,
        initial ? "bg-accent text-emerald-950" : "bg-emerald-100 text-emerald-700",
      )}
    >
      {initial ?? <User className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} />}
    </span>
  );
};

const FormGuide = ({
  currentStep,
  totalSteps,
  clientName,
  messages,
  product,
  variant = "sidebar",
  className,
}: FormGuideProps) => {
  const { i18n } = useTranslation();
  const lang: Lang = (["fr", "de", "it"].includes(i18n.language?.slice(0, 2))
    ? (i18n.language.slice(0, 2) as Lang)
    : "fr");

  const name = clientName?.trim();
  const phase = phaseFor(currentStep, totalSteps);
  const costume = product ? PRODUCT_COSTUMES[product] : undefined;
  // Art costumé dédié si fourni, sinon pose générique de la phase.
  const mascotSrc = costume?.art ?? MASCOT_BY_PHASE[phase];

  const message = useMemo(() => {
    const override = messages?.[currentStep - 1];
    if (override && override.trim()) return override.trim();
    const suffix = name ? `, ${name}` : "";
    const template =
      phase === "middle"
        ? MIDDLE_VARIANTS[lang][currentStep % MIDDLE_VARIANTS[lang].length]
        : TEMPLATES[lang][phase];
    return template.replace("{name}", suffix);
  }, [messages, currentStep, name, lang, phase]);

  const displayName = name ? `Optimis & ${name}` : "Optimis";
  const role = name ? ROLE[lang].together : ROLE[lang].advisor;

  // ---- Variante mobile : barre horizontale compacte au-dessus de la carte ----
  if (variant === "bar") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-2.5 backdrop-blur",
          className,
        )}
      >
        <div className="relative shrink-0">
          <img
            src={mascotHead}
            alt="Mascotte Optimis"
            className="h-14 w-14 rounded-full bg-white object-cover object-top ring-2 ring-emerald-200"
          />
          {/* Tenue métier (produit comparé) — épaule gauche */}
          {costume && (
            <span className="absolute -bottom-1 -left-1">
              <CostumeBadge costume={costume} lang={lang} size="sm" />
            </span>
          )}
          <span className="absolute -bottom-1 -right-1">
            <ClientBadge clientName={name} size="sm" />
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <SpeechBubble message={message} stepKey={currentStep} compact />
        </div>
      </div>
    );
  }

  // ---- Variante desktop : colonne latérale sticky ----
  return (
    <div className={cn("flex flex-col items-center text-center", className)}>
      <div className="relative">
        <img
          src={mascotSrc}
          alt="Mascotte Optimis, votre conseiller"
          className="h-44 w-auto select-none drop-shadow-[0_10px_20px_rgba(20,83,45,0.18)] transition-all duration-500"
          draggable={false}
        />
        {/* Tenue métier (produit comparé) — épaule gauche */}
        {costume && (
          <span className="absolute bottom-2 left-0">
            <CostumeBadge costume={costume} lang={lang} size="md" />
          </span>
        )}
        {/* Le client, appairé à la mascotte ("Optimis avec le client") */}
        <span className="absolute bottom-2 right-0">
          <ClientBadge clientName={name} size="md" />
        </span>
      </div>

      <p className="mt-1 text-lg font-bold text-emerald-900">{displayName}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
        {role}
      </p>

      <div className="mt-4 w-full max-w-[240px]">
        <SpeechBubble message={message} stepKey={currentStep} />
      </div>
    </div>
  );
};

export default FormGuide;
