// ============================================================================
// Configuration des colonnes Leads par type de formulaire
// ============================================================================
// Pour chaque formType, on définit les colonnes affichées dans la table Sheet-like.
// - source: "bd" → lit la colonne directement dans la table leads
// - source: "json" → lit dans le champ JSONB donnees_produit (clés en français
//   exactement comme Zapier les reçoit)
// ============================================================================

export type LeadColumnSource = "bd" | "json";

export interface LeadColumn {
  key: string;
  label: string;
  source: LeadColumnSource;
  width?: string; // classe Tailwind par défaut (ex: "w-24") — override possible via columnWidths state
  align?: "left" | "right" | "center";
  format?: "date" | "datetime" | "bool" | "default";
  sticky?: boolean; // sticky à gauche
}

// Colonnes communes affichées partout (ordre : début de table)
const COMMON_START: LeadColumn[] = [
  { key: "cree_le", label: "Reçu", source: "bd", width: "w-32", format: "datetime", sticky: true },
  { key: "prenom", label: "Prénom", source: "bd", width: "w-24" },
  { key: "nom", label: "Nom", source: "bd", width: "w-28" },
  { key: "email", label: "Email", source: "bd", width: "w-48" },
  { key: "telephone", label: "Téléphone", source: "bd", width: "w-32" },
  { key: "canton", label: "Canton", source: "bd", width: "w-16" },
  { key: "langue", label: "Langue", source: "bd", width: "w-16" },
];

// Colonnes de fin (statut, courtier destinataire, actions)
const COMMON_END: LeadColumn[] = [
  { key: "age", label: "Âge", source: "bd", width: "w-14", align: "center" },
  { key: "statut", label: "Statut", source: "bd", width: "w-32" },
  { key: "courtier_destinataire", label: "Courtier", source: "bd", width: "w-40" },
];

// Helper pour étendre les communes avec les champs spécifiques
const withCommons = (specific: LeadColumn[]): LeadColumn[] => [
  ...COMMON_START,
  ...specific,
  ...COMMON_END,
];

// ============================================================================
// Mapping formType → colonnes
// ============================================================================
export const LEAD_COLUMNS: Record<string, LeadColumn[]> = {
  all: [
    { key: "cree_le", label: "Reçu", source: "bd", width: "w-32", format: "datetime", sticky: true },
    { key: "source_formulaire", label: "Type", source: "bd", width: "w-32" },
    { key: "prenom", label: "Prénom", source: "bd", width: "w-24" },
    { key: "nom", label: "Nom", source: "bd", width: "w-28" },
    { key: "email", label: "Email", source: "bd", width: "w-48" },
    { key: "telephone", label: "Téléphone", source: "bd", width: "w-32" },
    { key: "canton", label: "Canton", source: "bd", width: "w-16" },
    { key: "age", label: "Âge", source: "bd", width: "w-14", align: "center" },
    { key: "statut", label: "Statut", source: "bd", width: "w-32" },
    { key: "courtier_destinataire", label: "Courtier", source: "bd", width: "w-40" },
  ],

  "health-insurance": withCommons([
    { key: "Code postal", label: "CP", source: "json", width: "w-16" },
    { key: "Date de naissance", label: "Date naiss.", source: "json", width: "w-24" },
    { key: "Situation familiale", label: "Situation", source: "json", width: "w-28" },
    { key: "Assurance actuelle", label: "Ass. act.", source: "json", width: "w-20" },
    { key: "Assureur actuel", label: "Assureur", source: "json", width: "w-28" },
    { key: "Modèle LAMal", label: "Modèle", source: "json", width: "w-24" },
    { key: "Franchise", label: "Franchise", source: "json", width: "w-20" },
    { key: "Couverture accident", label: "Accident", source: "json", width: "w-20" },
    { key: "Niveau complémentaire", label: "Niveau compl.", source: "json", width: "w-24" },
    { key: "Complémentaire dentaire", label: "Dentaire", source: "json", width: "w-20" },
    { key: "Complémentaire hospitalisation", label: "Hôpital", source: "json", width: "w-20" },
    { key: "Complémentaire lunettes", label: "Lunettes", source: "json", width: "w-20" },
    { key: "Complémentaire médecine alternative", label: "Med. alt.", source: "json", width: "w-20" },
    { key: "Complémentaire monde entier", label: "Monde", source: "json", width: "w-20" },
  ]),

  subsidy: withCommons([
    { key: "Code postal", label: "CP", source: "json", width: "w-16" },
    { key: "Date de naissance", label: "Date naiss.", source: "json", width: "w-24" },
    { key: "Composition du foyer", label: "Foyer", source: "json", width: "w-28" },
    { key: "Assurance actuelle", label: "Ass. act.", source: "json", width: "w-20" },
    { key: "Nom de l'assureur", label: "Assureur", source: "json", width: "w-28" },
    { key: "Franchise actuelle", label: "Franchise", source: "json", width: "w-24" },
    { key: "Revenu annuel", label: "Revenu", source: "json", width: "w-24" },
    { key: "Situation particulière", label: "Situation part.", source: "json", width: "w-32" },
  ]),

  "pillar-3a": withCommons([
    { key: "3ème pilier existant", label: "3e pilier ?", source: "json", width: "w-20" },
    { key: "Prestataire actuel", label: "Prestataire", source: "json", width: "w-28" },
    { key: "OBJECTIF", label: "Objectif", source: "json", width: "w-28" },
    { key: "AGE", label: "Âge (form)", source: "json", width: "w-20" },
    { key: "STATUT", label: "Statut pro", source: "json", width: "w-28" },
    { key: "REVENUS", label: "Revenus", source: "json", width: "w-28" },
    { key: "EPARGNE", label: "Épargne", source: "json", width: "w-28" },
    { key: "HORIZON", label: "Horizon", source: "json", width: "w-24" },
    { key: "PROFIL", label: "Profil risque", source: "json", width: "w-24" },
  ]),

  "lpp-libre-passage": withCommons([
    { key: "Objectif", label: "Objectif", source: "json", width: "w-32" },
    { key: "Situation actuelle", label: "Situation", source: "json", width: "w-24" },
    { key: "Années travaillées en Suisse", label: "Ans en CH", source: "json", width: "w-24" },
    { key: "Date de naissance", label: "Date naiss.", source: "json", width: "w-24" },
  ]),

  mortgage: withCommons([
    { key: "Type de projet", label: "Projet", source: "json", width: "w-28" },
    { key: "Type de bien", label: "Bien", source: "json", width: "w-28" },
    { key: "Valeur du bien", label: "Valeur (CHF)", source: "json", width: "w-28" },
    { key: "Commune", label: "Commune", source: "json", width: "w-28" },
    { key: "Nombre d'emprunteurs", label: "Emprunteurs", source: "json", width: "w-20" },
    { key: "Situation professionnelle", label: "Sit. pro", source: "json", width: "w-28" },
    { key: "Revenu annuel", label: "Revenu", source: "json", width: "w-28" },
    { key: "Fonds propres", label: "Fonds propres", source: "json", width: "w-28" },
  ]),

  "car-insurance": withCommons([
    { key: "Plaque d'immatriculation", label: "Immat.", source: "json", width: "w-24" },
    { key: "Marque du véhicule", label: "Marque", source: "json", width: "w-24" },
    { key: "Modèle du véhicule", label: "Modèle", source: "json", width: "w-28" },
    { key: "Année du véhicule", label: "Année", source: "json", width: "w-20" },
    { key: "Utilisation", label: "Usage", source: "json", width: "w-24" },
    { key: "Km annuels", label: "Km/an", source: "json", width: "w-24" },
    { key: "Date de naissance du conducteur", label: "Naiss. conducteur", source: "json", width: "w-28" },
    { key: "Année du permis", label: "Permis", source: "json", width: "w-20" },
    { key: "Accidents (5 dernières années)", label: "Accidents 5a", source: "json", width: "w-20" },
    { key: "Type de couverture", label: "Couverture", source: "json", width: "w-28" },
    { key: "Option bris de glace", label: "Bris glace", source: "json", width: "w-20" },
    { key: "Option assistance", label: "Assistance", source: "json", width: "w-20" },
    { key: "Option véhicule de remplacement", label: "Remplacement", source: "json", width: "w-20" },
  ]),

  "household-insurance": withCommons([
    { key: "Type de bien", label: "Type bien", source: "json", width: "w-28" },
    { key: "Statut de propriété", label: "Propriété", source: "json", width: "w-24" },
    { key: "Surface habitable", label: "Surface", source: "json", width: "w-20" },
    { key: "Nombre de pièces", label: "Pièces", source: "json", width: "w-20" },
    { key: "Valeur du bien", label: "Valeur", source: "json", width: "w-24" },
    { key: "Code postal", label: "CP", source: "json", width: "w-16" },
  ]),

  "legal-protection": withCommons([
    { key: "Type de couverture", label: "Couverture", source: "json", width: "w-32" },
    { key: "Couverture circulation", label: "Circulation", source: "json", width: "w-20" },
    { key: "Couverture privée", label: "Privée", source: "json", width: "w-20" },
    { key: "Couverture travail", label: "Travail", source: "json", width: "w-20" },
    { key: "Couverture propriété", label: "Propriété", source: "json", width: "w-20" },
    { key: "Couverture locataire", label: "Locataire", source: "json", width: "w-20" },
    { key: "Taille du ménage", label: "Ménage", source: "json", width: "w-24" },
  ]),

  "professional-insurance": withCommons([
    { key: "Type d'activité", label: "Activité", source: "json", width: "w-32" },
    { key: "Forme juridique", label: "Forme jur.", source: "json", width: "w-24" },
    { key: "Nombre d'employés", label: "Employés", source: "json", width: "w-20" },
    { key: "Chiffre d'affaires annuel", label: "CA annuel", source: "json", width: "w-28" },
    { key: "Date de début de contrat", label: "Début contrat", source: "json", width: "w-28" },
    { key: "insuranceTypes", label: "Types d'assurance", source: "json", width: "w-56" },
    { key: "Message", label: "Message", source: "json", width: "w-48" },
  ]),

  "estimation-immobiliere": withCommons([
    { key: "Adresse du bien", label: "Adresse", source: "json", width: "w-48" },
    { key: "Type de bien", label: "Type bien", source: "json", width: "w-28" },
    { key: "Nombre de pièces", label: "Pièces", source: "json", width: "w-20" },
    { key: "Surface (m²)", label: "Surface m²", source: "json", width: "w-24" },
    { key: "Délai de vente", label: "Délai vente", source: "json", width: "w-28" },
    { key: "Mandat agence signé", label: "Mandat", source: "json", width: "w-20" },
  ]),

  termination: withCommons([
    { key: "Type de contrat", label: "Contrat", source: "json", width: "w-32" },
    { key: "Assureur actuel", label: "Assureur", source: "json", width: "w-28" },
    { key: "Numéro de police", label: "N° police", source: "json", width: "w-28" },
    { key: "Date de résiliation souhaitée", label: "Date résil.", source: "json", width: "w-28" },
    { key: "Motif", label: "Motif", source: "json", width: "w-32" },
  ]),

  "prenatal-insurance": withCommons([
    { key: "Date de naissance", label: "Date naiss. maman", source: "json", width: "w-28" },
    { key: "Franchise enfant", label: "Franchise enfant", source: "json", width: "w-28" },
    { key: "Soins dentaires enfant", label: "Dentaire enf.", source: "json", width: "w-24" },
    { key: "Maman a déjà une assurance", label: "Ass. maman", source: "json", width: "w-24" },
    { key: "Assureur actuel de la maman", label: "Assureur maman", source: "json", width: "w-28" },
  ]),

  partner: withCommons([
    { key: "Budget mensuel", label: "Budget", source: "json", width: "w-28" },
    { key: "Secteur d'activité", label: "Secteur", source: "json", width: "w-28" },
    { key: "Entreprise", label: "Entreprise", source: "json", width: "w-32" },
    { key: "Force de vente", label: "Force vente", source: "json", width: "w-28" },
  ]),
};

// Fallback : si formType inconnu, on prend les colonnes "all"
export function getColumnsFor(formType: string): LeadColumn[] {
  return LEAD_COLUMNS[formType] ?? LEAD_COLUMNS.all;
}
