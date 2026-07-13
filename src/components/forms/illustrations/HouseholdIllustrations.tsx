import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// Illustrations "situation familiale" — silhouettes plates, sobres et de marque.
//   • Adultes en vert (emerald), enfant en ambre (accent Optimis).
//   • Utilisées dans les cartes de choix (santé, complémentaire, subside…).
// Style volontairement minimaliste & inclusif (silhouettes, pas de tons de peau).
// ----------------------------------------------------------------------------

export type HouseholdType =
  | "single"
  | "couple"
  | "coupleWithChildren"
  | "singleWithChildren";

const ADULT = "#047857"; // emerald-700
const CHILD = "#f59e0b"; // amber-500

/** Une personne (tête + buste) dessinée en silhouette. */
const Person = ({
  cx,
  cy,
  r,
  fill,
}: {
  cx: number;
  cy: number;
  r: number;
  fill: string;
}) => {
  const topY = cy + r * 0.9; // départ des épaules (léger recouvrement de la tête)
  const botY = cy + r * 3.2; // bas du buste
  const hw = r * 1.75; // demi-largeur épaules
  const nw = r * 0.7; // demi-largeur au niveau du cou
  const shoulder = topY + (botY - topY) * 0.35;
  const d = [
    `M ${cx - hw} ${botY}`,
    `L ${cx - hw} ${shoulder}`,
    `Q ${cx - hw} ${topY} ${cx - nw} ${topY}`,
    `L ${cx + nw} ${topY}`,
    `Q ${cx + hw} ${topY} ${cx + hw} ${shoulder}`,
    `L ${cx + hw} ${botY}`,
    "Z",
  ].join(" ");
  return (
    <g fill={fill}>
      <circle cx={cx} cy={cy} r={r} />
      <path d={d} />
    </g>
  );
};

const SCENES: Record<HouseholdType, JSX.Element> = {
  single: <Person cx={50} cy={22} r={12} fill={ADULT} />,
  couple: (
    <>
      <Person cx={34} cy={22} r={12} fill={ADULT} />
      <Person cx={66} cy={22} r={12} fill={ADULT} />
    </>
  ),
  coupleWithChildren: (
    <>
      <Person cx={28} cy={20} r={12} fill={ADULT} />
      <Person cx={56} cy={20} r={12} fill={ADULT} />
      <Person cx={78} cy={32} r={8} fill={CHILD} />
    </>
  ),
  singleWithChildren: (
    <>
      <Person cx={38} cy={20} r={12} fill={ADULT} />
      <Person cx={64} cy={32} r={8} fill={CHILD} />
    </>
  ),
};

interface HouseholdIllustrationProps {
  type: HouseholdType;
  className?: string;
}

const HouseholdIllustration = ({ type, className }: HouseholdIllustrationProps) => (
  <svg
    viewBox="0 0 100 72"
    role="presentation"
    aria-hidden
    className={cn("h-full w-full", className)}
  >
    {SCENES[type]}
  </svg>
);

export default HouseholdIllustration;
