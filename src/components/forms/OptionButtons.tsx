import { cn } from "@/lib/utils";

export interface OptionButtonItem {
  value: string;
  label: string;
}

interface OptionButtonsProps {
  /** Valeur actuellement sélectionnée. */
  value: string;
  /** Callback appelé avec la nouvelle valeur au clic. */
  onValueChange: (value: string) => void;
  /** Liste des options (valeur + libellé affiché). */
  options: OptionButtonItem[];
  /** Nombre de colonnes de la grille (défaut 3). */
  columns?: 2 | 3 | 4;
  /** Libellé accessible du groupe. */
  ariaLabel?: string;
}

const colClass: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

/**
 * Groupe de petits boutons pour remplacer un <select> à choix restreint.
 * Utilisé dans tous les tunnels afin de réduire au maximum les sélecteurs
 * déroulants (franchise, tranches, oui/non enrichi, etc.).
 */
export function OptionButtons({
  value,
  onValueChange,
  options,
  columns = 3,
  ariaLabel,
}: OptionButtonsProps) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("grid gap-2 md:gap-2.5", colClass[columns])}
    >
      {options.map((opt) => {
        const isSelected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "flex h-11 md:h-14 items-center justify-center rounded-xl border-2 bg-white px-2 text-center text-sm md:text-base font-medium leading-tight transition-all duration-200 hover:border-emerald-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1",
              isSelected
                ? "border-primary ring-2 ring-primary/30 shadow-md text-primary"
                : "border-emerald-100 text-gray-900",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default OptionButtons;
