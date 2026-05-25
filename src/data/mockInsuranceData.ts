// Mock data for insurance comparison results

export interface InsuranceOffer {
  id: string;
  companyName: string;
  companyLogo?: string;
  coverageType: string;
  monthlyPrice: number;
  yearlyPrice: number;
  franchise?: number;
  mainFeatures: string[];
  badge?: "bestPrice" | "recommended" | "bestValue";
  rating: number;
}

// Health Insurance (LAMal) offers
export const mockHealthInsuranceOffers: InsuranceOffer[] = [
  {
    id: "assura-standard",
    companyName: "Assura",
    coverageType: "LAMal Standard",
    monthlyPrice: 298.50,
    yearlyPrice: 3582,
    franchise: 2500,
    mainFeatures: ["Couverture de base LAMal", "Libre choix du médecin", "Couverture accidents incluse"],
    badge: "bestPrice",
    rating: 4.2,
  },
  {
    id: "css-telmed",
    companyName: "CSS",
    coverageType: "LAMal Télémédecine",
    monthlyPrice: 312.80,
    yearlyPrice: 3753.60,
    franchise: 2500,
    mainFeatures: ["Télémédecine 24/7", "App mobile complète", "Rabais fitness"],
    badge: "recommended",
    rating: 4.5,
  },
  {
    id: "helsana-family",
    companyName: "Helsana",
    coverageType: "LAMal Médecin de famille",
    monthlyPrice: 325.40,
    yearlyPrice: 3904.80,
    franchise: 2500,
    mainFeatures: ["Réseau médecins partenaires", "Coaching santé inclus", "Programmes prévention"],
    badge: "bestValue",
    rating: 4.4,
  },
  {
    id: "swica-favorit",
    companyName: "SWICA",
    coverageType: "LAMal HMO",
    monthlyPrice: 289.90,
    yearlyPrice: 3478.80,
    franchise: 2500,
    mainFeatures: ["Centre médical dédié", "Gestion intégrée", "Réductions exclusives"],
    rating: 4.3,
  },
  {
    id: "groupe-mutuel",
    companyName: "Groupe Mutuel",
    coverageType: "LAMal Standard",
    monthlyPrice: 305.20,
    yearlyPrice: 3662.40,
    franchise: 2500,
    mainFeatures: ["Service client primé", "Application intuitive", "Partenariats fitness"],
    rating: 4.1,
  },
];

// Car Insurance offers
export const mockCarInsuranceOffers: InsuranceOffer[] = [
  {
    id: "mobiliere-rc",
    companyName: "La Mobilière",
    coverageType: "RC + Casco partielle",
    monthlyPrice: 89.50,
    yearlyPrice: 1074,
    mainFeatures: ["RC illimitée", "Vol et incendie", "Bris de glace", "Assistance 24/7"],
    badge: "recommended",
    rating: 4.6,
  },
  {
    id: "axa-smart",
    companyName: "AXA",
    coverageType: "RC + Casco complète",
    monthlyPrice: 125.80,
    yearlyPrice: 1509.60,
    mainFeatures: ["Protection totale", "Véhicule remplacement", "0 franchise collision", "App tracking"],
    badge: "bestValue",
    rating: 4.5,
  },
  {
    id: "zurich-eco",
    companyName: "Zurich",
    coverageType: "RC seule",
    monthlyPrice: 52.40,
    yearlyPrice: 628.80,
    mainFeatures: ["RC légale Suisse", "Assistance de base", "Couverture Europe"],
    badge: "bestPrice",
    rating: 4.2,
  },
  {
    id: "tcs-premium",
    companyName: "TCS Assurance",
    coverageType: "RC + Casco complète",
    monthlyPrice: 145.60,
    yearlyPrice: 1747.20,
    mainFeatures: ["Assistance TCS incluse", "Bonus protection", "Valeur à neuf 5 ans", "Dépannage illimité"],
    rating: 4.7,
  },
  {
    id: "baloise-flex",
    companyName: "Baloise",
    coverageType: "RC + Casco partielle",
    monthlyPrice: 78.90,
    yearlyPrice: 946.80,
    mainFeatures: ["Formule flexible", "Paiement au km", "Eco-bonus", "Digital first"],
    rating: 4.3,
  },
];

// 3rd Pillar offers
export const mockPillar3Offers: InsuranceOffer[] = [
  {
    id: "swisslife-3a",
    companyName: "Swiss Life",
    coverageType: "3a Mixte",
    monthlyPrice: 580,
    yearlyPrice: 6960,
    mainFeatures: ["Épargne + prévoyance", "Capital décès garanti", "Exonération primes IPT", "Rendement garanti 0.5%"],
    badge: "recommended",
    rating: 4.5,
  },
  {
    id: "viac-3a",
    companyName: "VIAC",
    coverageType: "3a Bancaire",
    monthlyPrice: 580,
    yearlyPrice: 6960,
    mainFeatures: ["100% épargne", "Frais 0.44%", "Stratégies ESG", "App mobile top"],
    badge: "bestPrice",
    rating: 4.8,
  },
  {
    id: "generali-3a",
    companyName: "Generali",
    coverageType: "3a Assurance",
    monthlyPrice: 580,
    yearlyPrice: 6960,
    mainFeatures: ["Protection famille", "Rente invalidité", "Capital flexible", "Conseiller dédié"],
    badge: "bestValue",
    rating: 4.4,
  },
  {
    id: "postfinance-3a",
    companyName: "PostFinance",
    coverageType: "3a Bancaire",
    monthlyPrice: 580,
    yearlyPrice: 6960,
    mainFeatures: ["Simplicité", "Pas de frais cachés", "Agences partout", "Digital + physique"],
    rating: 4.2,
  },
];

// Mortgage offers
export const mockMortgageOffers: InsuranceOffer[] = [
  {
    id: "ubs-fixed",
    companyName: "UBS",
    coverageType: "Taux fixe 10 ans",
    monthlyPrice: 1250,
    yearlyPrice: 15000,
    mainFeatures: ["Taux: 1.85%", "Durée flexible", "Conseiller dédié", "Amortissement libre"],
    badge: "recommended",
    rating: 4.4,
  },
  {
    id: "credit-suisse-saron",
    companyName: "Credit Suisse",
    coverageType: "SARON",
    monthlyPrice: 980,
    yearlyPrice: 11760,
    mainFeatures: ["Taux: SARON + 0.65%", "Flexibilité max", "Cap rate optionnel", "Remboursement libre"],
    badge: "bestPrice",
    rating: 4.3,
  },
  {
    id: "raiffeisen-combi",
    companyName: "Raiffeisen",
    coverageType: "Combiné fixe/SARON",
    monthlyPrice: 1120,
    yearlyPrice: 13440,
    mainFeatures: ["50% fixe + 50% SARON", "Risque équilibré", "Expertise locale", "Réseau coopératif"],
    badge: "bestValue",
    rating: 4.5,
  },
  {
    id: "bcv-eco",
    companyName: "BCV",
    coverageType: "Taux fixe 5 ans",
    monthlyPrice: 1050,
    yearlyPrice: 12600,
    mainFeatures: ["Taux: 1.65%", "Bonus écologique", "Assurance incluse", "Proximité romande"],
    rating: 4.2,
  },
];

// Household insurance offers
export const mockHouseholdInsuranceOffers: InsuranceOffer[] = [
  {
    id: "mobiliere-menage",
    companyName: "La Mobilière",
    coverageType: "Ménage + RC",
    monthlyPrice: 28.50,
    yearlyPrice: 342,
    mainFeatures: ["Mobilier jusqu'à 80k", "RC privée 5M", "Vol hors domicile", "Électronique incluse"],
    badge: "recommended",
    rating: 4.6,
  },
  {
    id: "axa-home",
    companyName: "AXA",
    coverageType: "Ménage Premium",
    monthlyPrice: 35.80,
    yearlyPrice: 429.60,
    mainFeatures: ["Valeur à neuf", "Cyber-protection", "Objets de valeur", "Assistance juridique"],
    badge: "bestValue",
    rating: 4.5,
  },
  {
    id: "smile-basic",
    companyName: "Smile",
    coverageType: "Ménage Essentiel",
    monthlyPrice: 18.90,
    yearlyPrice: 226.80,
    mainFeatures: ["Mobilier standard", "RC de base", "100% digital", "Prix imbattable"],
    badge: "bestPrice",
    rating: 4.1,
  },
  {
    id: "generali-flex",
    companyName: "Generali",
    coverageType: "Ménage Modulable",
    monthlyPrice: 32.40,
    yearlyPrice: 388.80,
    mainFeatures: ["Modules à la carte", "RC familiale", "Animaux inclus", "Protection voyage"],
    rating: 4.3,
  },
];

// Legal protection offers
export const mockLegalProtectionOffers: InsuranceOffer[] = [
  {
    id: "dextra-premium",
    companyName: "Dextra",
    coverageType: "Protection Complète",
    monthlyPrice: 42.50,
    yearlyPrice: 510,
    mainFeatures: ["Tous domaines droit", "Médiation incluse", "Hotline 24/7", "Litiges consommation"],
    badge: "recommended",
    rating: 4.6,
  },
  {
    id: "arag-family",
    companyName: "ARAG",
    coverageType: "Famille & Travail",
    monthlyPrice: 35.80,
    yearlyPrice: 429.60,
    mainFeatures: ["Droit famille", "Conflits employeur", "Successions", "Conseil préventif"],
    badge: "bestValue",
    rating: 4.4,
  },
  {
    id: "cap-basic",
    companyName: "CAP",
    coverageType: "Protection Standard",
    monthlyPrice: 24.90,
    yearlyPrice: 298.80,
    mainFeatures: ["Circulation", "Location", "Contrats simples", "Téléphone gratuit"],
    badge: "bestPrice",
    rating: 4.0,
  },
  {
    id: "tcs-juridique",
    companyName: "TCS Protection",
    coverageType: "Auto & Mobilité",
    monthlyPrice: 28.40,
    yearlyPrice: 340.80,
    mainFeatures: ["Litiges circulation", "Amendes contestées", "Permis défendu", "Accidents route"],
    rating: 4.3,
  },
];

export const getBadgeLabel = (badge: string, language: string): string => {
  const labels: Record<string, Record<string, string>> = {
    bestPrice: {
      fr: "Meilleur prix",
      de: "Bester Preis",
      it: "Miglior prezzo",
    },
    recommended: {
      fr: "Recommandé",
      de: "Empfohlen",
      it: "Consigliato",
    },
    bestValue: {
      fr: "Meilleur rapport qualité/prix",
      de: "Bestes Preis-Leistungs-Verhältnis",
      it: "Miglior rapporto qualità/prezzo",
    },
  };

  return labels[badge]?.[language] || labels[badge]?.fr || badge;
};
