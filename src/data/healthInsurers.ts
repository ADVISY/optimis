import assuraLogo from "@/assets/insurers/assura-logo.svg";
import cssLogo from "@/assets/insurers/css-logo.svg";
import groupeMutuelLogo from "@/assets/insurers/groupe-mutuel-logo.svg";
import helsanaLogo from "@/assets/insurers/helsana-logo.svg";
import sanitasLogo from "@/assets/insurers/sanitas-logo.svg";
import swicaLogo from "@/assets/insurers/swica-logo.svg";
import visanaLogo from "@/assets/insurers/visana-logo.svg";
import concordiaLogo from "@/assets/insurers/concordia-logo.svg";
import kptLogo from "@/assets/insurers/kpt-logo.svg";
import atupriLogo from "@/assets/insurers/atupri-logo.svg";
import sympanyLogo from "@/assets/insurers/sympany-logo.svg";

export interface HealthInsurerOption {
  /** Valeur stockée dans le lead (inchangée vs l'ancien <select>). */
  value: string;
  /** Nom affiché en repli (aria-label / tuile "Autre"). */
  label: string;
  /** URL du logo (import Vite). `null` pour la tuile "Autre". */
  logo: string | null;
}

// 11 assureurs suisses + 1 tuile "Autre" = 12 tuiles → grille 4 × 3 (façon Neokare).
export const healthInsurers: HealthInsurerOption[] = [
  { value: "assura", label: "Assura", logo: assuraLogo },
  { value: "css", label: "CSS", logo: cssLogo },
  { value: "groupe-mutuel", label: "Groupe Mutuel", logo: groupeMutuelLogo },
  { value: "helsana", label: "Helsana", logo: helsanaLogo },
  { value: "sanitas", label: "Sanitas", logo: sanitasLogo },
  { value: "swica", label: "Swica", logo: swicaLogo },
  { value: "visana", label: "Visana", logo: visanaLogo },
  { value: "concordia", label: "Concordia", logo: concordiaLogo },
  { value: "kpt", label: "KPT", logo: kptLogo },
  { value: "atupri", label: "Atupri", logo: atupriLogo },
  { value: "sympany", label: "Sympany", logo: sympanyLogo },
  { value: "other", label: "Autre", logo: null },
];
