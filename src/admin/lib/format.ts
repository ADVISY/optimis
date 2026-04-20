export const formatCHF = (n: number) =>
  new Intl.NumberFormat("fr-CH", { style: "currency", currency: "CHF", minimumFractionDigits: 2 }).format(n);

export const formatDate = (d: string | Date) =>
  new Intl.DateTimeFormat("fr-CH", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(d));

export const DOMAIN_LABELS: Record<string, string> = {
  assurance_maladie: "Assurance maladie",
  lpp: "LPP",
  hypotheque: "Hypothèque",
  telecom: "Télécom",
  energie: "Énergie",
  autre: "Autre",
};

export const STATUS_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
  en_attente: "En attente",
  actif: "Actif",
  inactif: "Inactif",
};
