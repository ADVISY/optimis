// Hiérarchie produits pour les commandes
// Les valeurs des sous-domaines correspondent à l'enum order_domain en DB.

export type OrderDomain =
  | "assurance_maladie"
  | "lpp"
  | "hypotheque"
  | "assurance_non_vie"
  | "assurance_vie"
  | "telecom"
  | "immobilier"
  | "energie"
  | "autre";

export interface SubDomain {
  value: OrderDomain;
  label: string;
}

export interface Category {
  key: string;
  label: string;
  subDomains: SubDomain[];
}

export const PRODUCT_CATEGORIES: Category[] = [
  {
    key: "assurance_finances",
    label: "Assurance / Finances",
    subDomains: [
      { value: "assurance_maladie", label: "Assurance maladie" },
      { value: "lpp", label: "LPP" },
      { value: "hypotheque", label: "Hypothèque" },
      { value: "assurance_non_vie", label: "Assurance non-vie" },
      { value: "assurance_vie", label: "Assurance vie" },
    ],
  },
  {
    key: "telecom",
    label: "Télécom",
    subDomains: [
      { value: "telecom", label: "Forfait télécom" },
    ],
  },
  {
    key: "immobilier",
    label: "Immobilier",
    subDomains: [
      { value: "immobilier", label: "Estimation immobilière" },
    ],
  },
];

export const DOMAIN_LABELS_FULL: Record<string, string> = {
  assurance_maladie: "Assurance maladie",
  lpp: "LPP",
  hypotheque: "Hypothèque",
  assurance_non_vie: "Assurance non-vie",
  assurance_vie: "Assurance vie",
  telecom: "Forfait télécom",
  immobilier: "Estimation immobilière",
  energie: "Énergie",
  autre: "Autre",
};

export function getCategoryForDomain(domain: string): string {
  for (const cat of PRODUCT_CATEGORIES) {
    if (cat.subDomains.some((s) => s.value === domain)) return cat.key;
  }
  return "assurance_finances";
}

export function getCategoryLabel(key: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}
