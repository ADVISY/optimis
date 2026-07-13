import { ReactNode, useRef, useCallback } from "react";
import FormProgress from "./FormProgress";
import FormGuide, { type ProductKey } from "./FormGuide";

interface FormContainerProps {
  title: string;
  description?: string;
  currentStep: number;
  totalSteps: number;
  children: ReactNode;
  size?: "default" | "large";
  // --- Accompagnement "app" par la mascotte Optimis (façon Intimy) ---
  /** Prénom du client : dès qu'il est saisi, l'avatar s'appaire ("Optimis & Camille"). */
  clientName?: string;
  /** Messages de la mascotte personnalisés par étape (index 0 = étape 1). Optionnel. */
  guideMessages?: (string | null | undefined)[];
  /** Produit comparé : donne une "tenue" métier à la mascotte (emblème + art dédié). */
  product?: ProductKey;
  /**
   * Barre de navigation (Précédent / Continuer). Fournie ici, elle est ÉPINGLÉE
   * en bas de l'écran (toujours visible), tandis que seules les questions défilent.
   * Si absente, la nav peut rester en dernier enfant de `children` (repli).
   */
  navigation?: ReactNode;
}

// ----------------------------------------------------------------------------
// FormContainer — scène "app" épurée façon Intimy.
//   • PAS de carte / encadré : les questions respirent directement sur le fond.
//   • Mascotte Optimis en colonne (desktop) ou barre compacte (mobile).
//   • Progression discrète + titre d'étape, puis les questions.
// Les badges de réassurance ne sont plus ici : ils vivent dans la ligne de
// pied de FormAppShell ("Confidentiel · 100% gratuit · Sans engagement").
// ----------------------------------------------------------------------------

const FormContainer = ({
  title,
  description,
  currentStep,
  totalSteps,
  children,
  size = "default",
  clientName,
  guideMessages,
  product,
  navigation,
}: FormContainerProps) => {
  const scopeRef = useRef<HTMLDivElement>(null);

  // Mobile : quand un champ prend le focus, on le centre pour que le clavier ne le masque pas.
  const handleFocusIn = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    const tag = target.tagName;
    if (tag !== "INPUT" && tag !== "SELECT" && tag !== "TEXTAREA") return;
    window.setTimeout(() => {
      try {
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch {
        target.scrollIntoView();
      }
    }, 250);
  }, []);

  const isLarge = size === "large";

  return (
    <div className={`relative w-full mx-auto flex min-h-0 flex-1 flex-col ${isLarge ? "max-w-6xl" : "max-w-5xl"}`}>
      {/* Halo de marque flottant (décoratif) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-10 top-8 h-40 w-40 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-32 w-32 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-36 w-36 rounded-full bg-emerald-200/30 blur-3xl" />
      </div>

      {/* Mascotte compacte au-dessus des questions (mobile) */}
      <div className="md:hidden shrink-0 mb-2">
        <FormGuide
          currentStep={currentStep}
          totalSteps={totalSteps}
          clientName={clientName}
          messages={guideMessages}
          product={product}
          variant="bar"
        />
      </div>

      <div className="grid min-h-0 flex-1 items-stretch gap-4 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 lg:gap-10">
        {/* Colonne mascotte (desktop) — alignée en haut, ne s'étire pas */}
        <div className="hidden md:block md:self-start">
          <FormGuide
            currentStep={currentStep}
            totalSteps={totalSteps}
            clientName={clientName}
            messages={guideMessages}
            product={product}
            variant="sidebar"
          />
        </div>

        {/* Colonne questions — en-tête figé, questions défilantes, nav épinglée en bas */}
        <div className="flex min-h-0 flex-col">
          {/* Progression discrète (figée) */}
          <FormProgress
            currentStep={currentStep}
            totalSteps={totalSteps}
            className="shrink-0 mb-2 md:mb-3 [&_*]:text-[11px] md:[&_*]:text-sm [&_.h-2]:h-1 md:[&_.h-2]:h-1.5 [&_.h-3]:h-1 md:[&_.h-3]:h-1.5"
          />

          {/* Titre de l'étape (figé) */}
          <div className="shrink-0 mb-2 md:mb-4 space-y-1">
            <h2
              className={`font-heading font-black leading-tight text-emerald-950 ${
                isLarge
                  ? "text-lg md:text-2xl lg:text-3xl"
                  : "text-base md:text-xl lg:text-2xl"
              }`}
            >
              {title}
            </h2>
            {description && (
              <p className="text-xs md:text-base leading-snug text-emerald-700/80">
                {description}
              </p>
            )}
          </div>

          {/* Zone questions — SEULE partie défilante (sans carte, façon Intimy) */}
          <div
            ref={scopeRef}
            data-form-container
            onFocus={handleFocusIn}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden animate-fade-in text-emerald-900"
          >
            {children}
          </div>

          {/* Barre de navigation épinglée (toujours visible) */}
          {navigation && (
            <div className="shrink-0 border-t border-emerald-100/70 pt-2 md:pt-3">
              {navigation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormContainer;
