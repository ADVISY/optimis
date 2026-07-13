import { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// IllustratedChoice — cartes de choix "premium" avec illustration ou logo.
//   • Chaque option : une illustration (SVG) OU un logo (image) + un libellé.
//   • État sélectionné : bordure emerald + fond léger + pastille de validation.
//   • Accessibilité : role="radiogroup" / role="radio" + aria-checked.
// Remplace les listes radio "texte brut" pour donner de la valeur au formulaire.
// ----------------------------------------------------------------------------

export interface IllustratedOption {
  value: string;
  label: string;
  sublabel?: string;
  /** Illustration vectorielle (ex. <HouseholdIllustration type="couple" />). */
  illustration?: ReactNode;
  /** Ou un logo image (ex. logo d'une caisse maladie). */
  logo?: string;
}

interface IllustratedChoiceProps {
  value: string;
  onValueChange: (value: string) => void;
  options: IllustratedOption[];
  columns?: 2 | 3 | 4;
  ariaLabel?: string;
  className?: string;
}

const COLS: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

const IllustratedChoice = ({
  value,
  onValueChange,
  options,
  columns = 2,
  ariaLabel,
  className,
}: IllustratedChoiceProps) => {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn("grid gap-2.5 md:gap-3.5", COLS[columns], className)}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              "group relative flex flex-col items-center gap-2 rounded-2xl border-2 bg-white p-3 text-center transition-all duration-200 md:p-4",
              "hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
              selected
                ? "border-emerald-600 bg-emerald-50 shadow-sm ring-2 ring-emerald-500/20"
                : "border-emerald-100 hover:border-emerald-300",
            )}
          >
            {/* Pastille de validation */}
            <span
              aria-hidden
              className={cn(
                "absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full transition-all",
                selected
                  ? "scale-100 bg-emerald-600 text-white"
                  : "scale-0 bg-transparent",
              )}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>

            {/* Illustration ou logo */}
            <span
              className={cn(
                "flex h-14 w-full items-center justify-center md:h-16",
                selected ? "opacity-100" : "opacity-90 group-hover:opacity-100",
              )}
            >
              {opt.logo ? (
                <img
                  src={opt.logo}
                  alt=""
                  aria-hidden
                  className="max-h-10 w-auto max-w-[80%] object-contain md:max-h-12"
                />
              ) : (
                <span className="h-full w-auto max-w-[70%]">{opt.illustration}</span>
              )}
            </span>

            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-emerald-900 md:text-base">
                {opt.label}
              </span>
              {opt.sublabel && (
                <span className="mt-0.5 text-xs text-emerald-600">{opt.sublabel}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default IllustratedChoice;
