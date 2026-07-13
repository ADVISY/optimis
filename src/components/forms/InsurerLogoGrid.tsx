import { useTranslation } from "react-i18next";
import { healthInsurers } from "@/data/healthInsurers";

interface InsurerLogoGridProps {
  /** Valeur actuellement sélectionnée (ex. "assura", "css", "other"). */
  value: string;
  /** Callback appelé avec la nouvelle valeur au clic sur une tuile. */
  onValueChange: (value: string) => void;
}

/**
 * Grille de logos d'assureurs santé (4 colonnes × 3 lignes = 12 tuiles, façon Neokare).
 * Partagée entre les formulaires santé, complémentaire et subside afin que
 * l'utilisateur sélectionne son assureur actuel via un vrai logo plutôt qu'un
 * champ texte ou un <select>.
 */
export function InsurerLogoGrid({ value, onValueChange }: InsurerLogoGridProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-4 gap-1.5 md:gap-2.5">
      {healthInsurers.map((insurer) => {
        const isSelected = value === insurer.value;
        return (
          <button
            key={insurer.value}
            type="button"
            aria-pressed={isSelected}
            aria-label={insurer.label}
            onClick={() => onValueChange(insurer.value)}
            className={`group flex h-11 md:h-16 items-center justify-center rounded-xl border-2 bg-white p-1 md:p-2 transition-all duration-200 hover:border-emerald-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1 ${
              isSelected
                ? "border-primary ring-2 ring-primary/30 shadow-md"
                : "border-emerald-100"
            }`}
          >
            {insurer.logo ? (
              <img
                src={insurer.logo}
                alt={insurer.label}
                loading="lazy"
                className="max-h-6 md:max-h-9 w-auto max-w-full object-contain"
              />
            ) : (
              <span className="text-xs md:text-sm font-semibold text-emerald-800">
                {t("forms.healthInsurance.otherShort", { defaultValue: "Autre" })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default InsurerLogoGrid;
