// ============================================================================
// Configuration des filtres avancés par type de formulaire
// ============================================================================
// Chaque formType a sa propre liste de critères de filtrage, dérivée des
// champs Zapier réels (cf donnees_produit JSONB).
// ============================================================================

export type FilterType = "text" | "select" | "boolean" | "yesno";

export interface LeadFilter {
  key: string;                    // clé dans donnees_produit (json) ou colonne BD
  label: string;                  // label affiché
  source: "bd" | "json";
  type: FilterType;
  options?: string[];             // pour type select (premier élément = "Tous")
  placeholder?: string;
  width?: string;                 // tailwind class
}

// Cantons suisses
export const CANTONS = [
  "AG", "AR", "AI", "BL", "BS", "BE", "FR", "GE", "GL", "GR",
  "JU", "LU", "NE", "NW", "OW", "SH", "SZ", "SO", "SG", "TG",
  "TI", "UR", "VD", "VS", "ZG", "ZH",
];

const ASSUREURS_SANTE = [
  "CSS", "Helsana", "Sanitas", "Groupe Mutuel", "Assura", "Visana",
  "Concordia", "SWICA", "Sympany", "ÖKK", "Atupri", "Mutuel", "EGK",
  "Autre",
];

// ============================================================================
const FILTERS_HEALTH: LeadFilter[] = [
  { key: "Canton", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "Langue", label: "Langue", source: "json", type: "select", options: ["fr", "de", "it", "en"], width: "w-20" },
  { key: "Modèle LAMal", label: "Modèle LAMal", source: "json", type: "select", options: ["Standard", "HMO", "Hausarztmodell", "Telmed", "Telemedizin", "Médecin de famille"], width: "w-36" },
  { key: "Franchise", label: "Franchise", source: "json", type: "select", options: ["CHF 300", "CHF 500", "CHF 1000", "CHF 1500", "CHF 2000", "CHF 2500"], width: "w-28" },
  { key: "Situation familiale", label: "Situation", source: "json", type: "select", options: ["Seul(e)", "Allein", "Couple", "Paar", "Couple + enfant(s)", "Paar mit Kindern", "Seul + enfant(s)"], width: "w-36" },
  { key: "Assurance actuelle", label: "Assuré", source: "json", type: "select", options: ["Oui", "Non", "Ja", "Nein"], width: "w-20" },
  { key: "Assureur actuel", label: "Assureur", source: "json", type: "select", options: ASSUREURS_SANTE, width: "w-32" },
  { key: "Couverture accident", label: "Accident", source: "json", type: "select", options: ["Oui", "Non", "Ja", "Nein"], width: "w-20" },
  { key: "Niveau complémentaire", label: "Niveau compl.", source: "json", type: "select", options: ["basic", "premium", "diamond", "Aucune"], width: "w-28" },
];

const FILTERS_SUBSIDY: LeadFilter[] = [
  { key: "Canton", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "Composition du foyer", label: "Foyer", source: "json", type: "select", options: ["Seul", "Couple", "Seul + enfant(s)", "Couple + enfant(s)"], width: "w-36" },
  { key: "Assurance actuelle", label: "Assuré", source: "json", type: "select", options: ["Oui", "Non"], width: "w-20" },
  { key: "Nom de l'assureur", label: "Assureur", source: "json", type: "select", options: ASSUREURS_SANTE, width: "w-32" },
  { key: "Franchise actuelle", label: "Franchise", source: "json", type: "select", options: ["CHF 300", "CHF 500", "CHF 1000", "CHF 1500", "CHF 2000", "CHF 2500"], width: "w-28" },
  { key: "Situation particulière", label: "Situation", source: "json", type: "select", options: ["Aucune situation particulière", "Étudiant", "Au chômage", "Retraité", "Autre"], width: "w-40" },
];

const FILTERS_PILLAR3: LeadFilter[] = [
  { key: "CANTON", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "LANGUE", label: "Langue", source: "json", type: "select", options: ["fr", "de", "it", "en"], width: "w-20" },
  { key: "3ème pilier existant", label: "3e pilier", source: "json", type: "select", options: ["Oui", "Non", "Ja", "Nein"], width: "w-20" },
  { key: "OBJECTIF", label: "Objectif", source: "json", type: "select", options: ["Économie d'impôt", "Steuerersparnis", "Préparer la retraite", "Investir", "Acheter un bien", "Autre"], width: "w-40" },
  { key: "STATUT", label: "Statut pro", source: "json", type: "select", options: ["Salarié", "Selbstständig", "Indépendant", "Führungskraft", "Cadre", "Étudiant", "Sans emploi", "Retraité"], width: "w-32" },
  { key: "PROFIL", label: "Profil risque", source: "json", type: "select", options: ["Prudent", "Moderat", "Modéré", "Dynamique", "Agressif"], width: "w-28" },
  { key: "HORIZON", label: "Horizon", source: "json", type: "select", options: ["< 10 ans", "10 – 20 Jahre", "10 – 20 ans", "20 – 30 Jahre", "20 – 30 ans", "> 30 ans"], width: "w-32" },
];

const FILTERS_LPP: LeadFilter[] = [
  { key: "Objectif", label: "Objectif", source: "json", type: "select", options: ["🔍 Retrouver mes fonds LPP", "Consolider mes avoirs LPP"], width: "w-56" },
  { key: "Situation actuelle", label: "Situation", source: "json", type: "select", options: ["Salarié", "Indépendant", "Sans emploi", "Autre"], width: "w-28" },
  { key: "Années travaillées en Suisse", label: "Ans en CH", source: "json", type: "select", options: ["Moins de 10 ans", "Plus de 10 ans", "Plus de 20 ans", "Plus de 30 ans"], width: "w-36" },
];

const FILTERS_MORTGAGE: LeadFilter[] = [
  { key: "Canton", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "Type de projet", label: "Projet", source: "json", type: "select", options: ["Acquisition", "Renouvellement", "Refinancement"], width: "w-32" },
  { key: "Type de bien", label: "Bien", source: "json", type: "select", options: ["Appartement", "Maison", "Immeuble", "Autre"], width: "w-28" },
  { key: "Situation professionnelle", label: "Sit. pro", source: "json", type: "select", options: ["Salarié", "Indépendant", "Cadre dirigeant", "Retraité"], width: "w-32" },
  { key: "Revenu annuel", label: "Revenu", source: "json", type: "select", options: ["50000-80000", "80000-120000", "120000-150000", "150000-200000", "200000+"], width: "w-32" },
  { key: "Fonds propres", label: "Fonds propres", source: "json", type: "select", options: ["0-50000", "50000-100000", "100000-200000", "200000-500000", "500000+"], width: "w-32" },
];

const FILTERS_CAR: LeadFilter[] = [
  { key: "Canton", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "Type de couverture", label: "Couverture", source: "json", type: "select", options: ["Responsabilité civile", "Casco partielle", "Casco complète", "Casco partielle + Vol", "Casco complète + Vol"], width: "w-40" },
  { key: "Année du véhicule", label: "Année véh.", source: "json", type: "text", width: "w-20" },
  { key: "Marque du véhicule", label: "Marque", source: "json", type: "text", width: "w-28" },
  { key: "Accidents (5 dernières années)", label: "Accidents", source: "json", type: "select", options: ["0", "1", "2", "3+"], width: "w-20" },
];

const FILTERS_HOUSEHOLD: LeadFilter[] = [
  { key: "Canton", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "Type de bien", label: "Bien", source: "json", type: "select", options: ["Appartement", "Maison", "Villa", "Studio"], width: "w-28" },
  { key: "Statut de propriété", label: "Propriété", source: "json", type: "select", options: ["Locataire", "Propriétaire"], width: "w-28" },
  { key: "Nombre de pièces", label: "Pièces", source: "json", type: "select", options: ["1-2", "3", "4", "5", "6+"], width: "w-20" },
];

const FILTERS_LEGAL: LeadFilter[] = [
  { key: "Canton", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "Type de couverture", label: "Couverture", source: "json", type: "select", options: ["Protection circulation", "Protection privée", "Protection complète"], width: "w-36" },
  { key: "Couverture circulation", label: "Circulation", source: "json", type: "select", options: ["Oui", "Non"], width: "w-24" },
  { key: "Couverture privée", label: "Privée", source: "json", type: "select", options: ["Oui", "Non"], width: "w-24" },
  { key: "Couverture travail", label: "Travail", source: "json", type: "select", options: ["Oui", "Non"], width: "w-24" },
  { key: "Couverture propriété", label: "Propriété", source: "json", type: "select", options: ["Oui", "Non"], width: "w-24" },
  { key: "Taille du ménage", label: "Foyer", source: "json", type: "select", options: ["Seul(e)", "Couple", "Famille"], width: "w-28" },
];

const FILTERS_PRO: LeadFilter[] = [
  { key: "Forme juridique", label: "Forme jur.", source: "json", type: "select", options: ["Indépendant", "Sàrl", "SA", "SNC", "Autre"], width: "w-28" },
  { key: "Nombre d'employés", label: "Employés", source: "json", type: "select", options: ["0", "1-5", "6-10", "11-20", "20+"], width: "w-24" },
  { key: "Chiffre d'affaires annuel", label: "CA", source: "json", type: "text", placeholder: "Recherche CA", width: "w-32" },
  { key: "Type d'activité", label: "Activité", source: "json", type: "text", placeholder: "Recherche activité", width: "w-32" },
];

const FILTERS_ESTIMATION: LeadFilter[] = [
  { key: "Type de bien", label: "Bien", source: "json", type: "select", options: ["Appartement", "Maison", "Villa", "Commercial", "Terrain"], width: "w-28" },
  { key: "Délai de vente", label: "Délai", source: "json", type: "select", options: ["Urgent", "Le plus vite possible", "3 mois", "6 mois", "Pas pressé"], width: "w-40" },
  { key: "Mandat agence signé", label: "Mandat", source: "json", type: "select", options: ["Oui", "Non"], width: "w-20" },
];

const FILTERS_TERMINATION: LeadFilter[] = [
  { key: "Type de contrat", label: "Contrat", source: "json", type: "select", options: ["Assurance maladie", "Assurance voiture", "Assurance ménage", "Protection juridique", "Assurance vie", "Autre"], width: "w-36" },
  { key: "Assureur actuel", label: "Assureur", source: "json", type: "text", placeholder: "Recherche assureur", width: "w-32" },
];

const FILTERS_PRENATAL: LeadFilter[] = [
  { key: "Canton", label: "Canton", source: "json", type: "select", options: CANTONS, width: "w-24" },
  { key: "Maman a déjà une assurance", label: "Ass. maman", source: "json", type: "select", options: ["Oui", "Non"], width: "w-24" },
  { key: "Franchise enfant", label: "Franchise enf.", source: "json", type: "select", options: ["CHF 0", "CHF 100", "CHF 200", "CHF 300", "CHF 400", "CHF 500", "CHF 600"], width: "w-28" },
  { key: "Soins dentaires enfant", label: "Dentaire enf.", source: "json", type: "select", options: ["Oui", "Non"], width: "w-24" },
];

const FILTERS_PARTNER: LeadFilter[] = [
  { key: "Budget mensuel", label: "Budget", source: "json", type: "select", options: ["Moins de CHF 3'000", "CHF 3'000 – 5'000", "CHF 5'000 – 10'000", "Plus de CHF 10'000"], width: "w-44" },
  { key: "Secteur d'activité", label: "Secteur", source: "json", type: "select", options: ["Assurance", "Immobilier", "Finance", "Télécom", "Autre"], width: "w-28" },
  { key: "Force de vente", label: "Force vente", source: "json", type: "select", options: ["1 commercial", "2 – 5 commerciaux", "6 – 10 commerciaux", "11 – 20 commerciaux", "20+ commerciaux"], width: "w-40" },
];

// Filtres communs (onglet "Tous")
const FILTERS_ALL: LeadFilter[] = [
  { key: "canton", label: "Canton", source: "bd", type: "select", options: CANTONS, width: "w-24" },
  { key: "langue", label: "Langue", source: "bd", type: "select", options: ["fr", "de", "it", "en"], width: "w-20" },
];

// ============================================================================
// Mapping formType → filtres
// ============================================================================
export const LEAD_FILTERS: Record<string, LeadFilter[]> = {
  all: FILTERS_ALL,
  "health-insurance": FILTERS_HEALTH,
  subsidy: FILTERS_SUBSIDY,
  "pillar-3a": FILTERS_PILLAR3,
  "lpp-libre-passage": FILTERS_LPP,
  mortgage: FILTERS_MORTGAGE,
  "car-insurance": FILTERS_CAR,
  "household-insurance": FILTERS_HOUSEHOLD,
  "legal-protection": FILTERS_LEGAL,
  "professional-insurance": FILTERS_PRO,
  "estimation-immobiliere": FILTERS_ESTIMATION,
  termination: FILTERS_TERMINATION,
  "prenatal-insurance": FILTERS_PRENATAL,
  partner: FILTERS_PARTNER,
};

export function getFiltersFor(formType: string): LeadFilter[] {
  return LEAD_FILTERS[formType] ?? LEAD_FILTERS.all;
}

// ============================================================================
// Application des filtres côté client
// ============================================================================
export function applyFilters(
  leads: any[],
  filters: LeadFilter[],
  values: Record<string, string>,
): any[] {
  return leads.filter((lead) => {
    for (const f of filters) {
      const filterValue = values[f.key];
      if (!filterValue || filterValue === "all" || filterValue === "") continue;

      const leadValue = f.source === "bd" ? lead[f.key] : lead.donnees_produit?.[f.key];
      if (leadValue === null || leadValue === undefined) return false;

      if (f.type === "text") {
        if (!String(leadValue).toLowerCase().includes(filterValue.toLowerCase())) return false;
      } else {
        if (String(leadValue) !== filterValue) return false;
      }
    }
    return true;
  });
}
