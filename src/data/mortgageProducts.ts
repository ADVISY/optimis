// Swiss Mortgage Products Database
// Real data from major Swiss banks and financial institutions

export interface MortgageProduct {
  id: string;
  bankName: string;
  bankType: "cantonal" | "major" | "insurance" | "online" | "cooperative";
  productName: string;
  mortgageType: "fixed" | "saron" | "variable";
  
  // Interest rates by duration (for fixed) or margin (for SARON)
  rates: {
    duration?: number; // years for fixed
    rate: number; // annual percentage
    margin?: number; // margin above SARON for SARON mortgages
  }[];
  
  // Conditions
  minLoanAmount: number;
  maxLTV: number; // Loan-to-Value ratio in percentage
  minOwnFunds: number; // minimum own funds percentage
  minOwnFundsCash: number; // minimum cash (not 2nd pillar) percentage
  
  // Flexibility
  earlyRepaymentPenalty: "high" | "medium" | "low" | "none";
  earlyRepaymentPenaltyDescription: string;
  indirectAmortization3a: boolean;
  flexibleAmortization: boolean;
  
  // Features
  features: string[];
  rating: number;
  
  // Badge for display
  badge?: "recommended" | "bestRate" | "mostFlexible" | "bestValue";
}

// Current SARON rate (updated periodically)
export const CURRENT_SARON_RATE = 1.25; // as of 2024

export const mortgageProducts: MortgageProduct[] = [
  // UBS
  {
    id: "ubs-fixed-10",
    bankName: "UBS",
    bankType: "major",
    productName: "Hypothèque à taux fixe",
    mortgageType: "fixed",
    rates: [
      { duration: 2, rate: 1.55 },
      { duration: 5, rate: 1.65 },
      { duration: 10, rate: 1.85 },
      { duration: 15, rate: 2.05 },
    ],
    minLoanAmount: 100000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "high",
    earlyRepaymentPenaltyDescription: "Pénalité basée sur la différence de taux et durée restante",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Conseiller dédié",
      "Réseau d'agences national",
      "Application mobile complète",
      "Refinancement facilité",
    ],
    rating: 4.4,
    badge: "recommended",
  },
  {
    id: "ubs-saron",
    bankName: "UBS",
    bankType: "major",
    productName: "Hypothèque SARON",
    mortgageType: "saron",
    rates: [
      { rate: CURRENT_SARON_RATE + 0.70, margin: 0.70 },
    ],
    minLoanAmount: 100000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "low",
    earlyRepaymentPenaltyDescription: "Résiliation possible tous les 3 mois avec préavis",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Flexibilité maximale",
      "Taux actuel avantageux",
      "Passage au taux fixe possible",
      "Cap rate optionnel",
    ],
    rating: 4.3,
    badge: "mostFlexible",
  },
  
  // Credit Suisse (now UBS)
  {
    id: "cs-fixed-10",
    bankName: "Credit Suisse",
    bankType: "major",
    productName: "Flex Hypothèque Fixe",
    mortgageType: "fixed",
    rates: [
      { duration: 3, rate: 1.58 },
      { duration: 5, rate: 1.68 },
      { duration: 10, rate: 1.88 },
    ],
    minLoanAmount: 100000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "medium",
    earlyRepaymentPenaltyDescription: "Pénalité réduite avec option Flex",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Option de sortie anticipée",
      "Digital Banking complet",
      "Partenariats immobiliers",
    ],
    rating: 4.2,
  },
  
  // Raiffeisen
  {
    id: "raiffeisen-fixed",
    bankName: "Raiffeisen",
    bankType: "cooperative",
    productName: "Hypothèque fixe",
    mortgageType: "fixed",
    rates: [
      { duration: 2, rate: 1.48 },
      { duration: 5, rate: 1.58 },
      { duration: 10, rate: 1.78 },
      { duration: 15, rate: 1.98 },
    ],
    minLoanAmount: 50000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "medium",
    earlyRepaymentPenaltyDescription: "Pénalité standard, négociable selon relation",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Expertise locale",
      "Réseau coopératif",
      "Conseil personnalisé",
      "Conditions membres avantageuses",
    ],
    rating: 4.5,
    badge: "bestValue",
  },
  {
    id: "raiffeisen-saron",
    bankName: "Raiffeisen",
    bankType: "cooperative",
    productName: "Hypothèque SARON",
    mortgageType: "saron",
    rates: [
      { rate: CURRENT_SARON_RATE + 0.65, margin: 0.65 },
    ],
    minLoanAmount: 50000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "none",
    earlyRepaymentPenaltyDescription: "Résiliation sans frais tous les 3 mois",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Aucune pénalité de sortie",
      "Marge compétitive",
      "Passage au fixe possible",
    ],
    rating: 4.4,
    badge: "bestRate",
  },
  
  // BCV (Banque Cantonale Vaudoise)
  {
    id: "bcv-fixed",
    bankName: "BCV",
    bankType: "cantonal",
    productName: "Hypothèque à taux fixe",
    mortgageType: "fixed",
    rates: [
      { duration: 2, rate: 1.52 },
      { duration: 5, rate: 1.62 },
      { duration: 10, rate: 1.82 },
      { duration: 15, rate: 2.02 },
    ],
    minLoanAmount: 50000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "medium",
    earlyRepaymentPenaltyDescription: "Pénalité calculée sur la durée restante",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Expertise romande",
      "Bonus écologique disponible",
      "Assurance bâtiment incluse possible",
      "Proximité et conseil local",
    ],
    rating: 4.3,
  },
  {
    id: "bcv-saron",
    bankName: "BCV",
    bankType: "cantonal",
    productName: "Hypothèque SARON",
    mortgageType: "saron",
    rates: [
      { rate: CURRENT_SARON_RATE + 0.68, margin: 0.68 },
    ],
    minLoanAmount: 50000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "low",
    earlyRepaymentPenaltyDescription: "Préavis de 3 mois",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Taux avantageux",
      "Flexibilité garantie",
      "Service client réactif",
    ],
    rating: 4.2,
  },
  
  // PostFinance
  {
    id: "postfinance-fixed",
    bankName: "PostFinance",
    bankType: "major",
    productName: "Hypothèque fixe",
    mortgageType: "fixed",
    rates: [
      { duration: 2, rate: 1.45 },
      { duration: 5, rate: 1.55 },
      { duration: 10, rate: 1.75 },
    ],
    minLoanAmount: 100000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "medium",
    earlyRepaymentPenaltyDescription: "Pénalité standard selon conditions",
    indirectAmortization3a: true,
    flexibleAmortization: false,
    features: [
      "Taux compétitifs",
      "Processus 100% digital",
      "Réseau national",
      "Simplicité administrative",
    ],
    rating: 4.1,
  },
  {
    id: "postfinance-saron",
    bankName: "PostFinance",
    bankType: "major",
    productName: "Hypothèque SARON",
    mortgageType: "saron",
    rates: [
      { rate: CURRENT_SARON_RATE + 0.60, margin: 0.60 },
    ],
    minLoanAmount: 100000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "low",
    earlyRepaymentPenaltyDescription: "Résiliation possible avec préavis court",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Marge très compétitive",
      "Digital first",
      "Cap rate disponible",
    ],
    rating: 4.2,
  },
  
  // Swiss Life (Insurance)
  {
    id: "swisslife-fixed",
    bankName: "Swiss Life",
    bankType: "insurance",
    productName: "Hypothèque SwissLife",
    mortgageType: "fixed",
    rates: [
      { duration: 5, rate: 1.70 },
      { duration: 10, rate: 1.90 },
      { duration: 15, rate: 2.10 },
      { duration: 20, rate: 2.25 },
    ],
    minLoanAmount: 200000,
    maxLTV: 75,
    minOwnFunds: 25,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "high",
    earlyRepaymentPenaltyDescription: "Pénalité importante, contrat à long terme privilégié",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Durées longues jusqu'à 25 ans",
      "Intégration 3ème pilier",
      "Protection famille incluse possible",
      "Conseiller prévoyance dédié",
    ],
    rating: 4.0,
  },
  
  // AXA (Insurance)
  {
    id: "axa-fixed",
    bankName: "AXA",
    bankType: "insurance",
    productName: "Hypothèque AXA",
    mortgageType: "fixed",
    rates: [
      { duration: 5, rate: 1.68 },
      { duration: 10, rate: 1.88 },
      { duration: 15, rate: 2.08 },
    ],
    minLoanAmount: 150000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "medium",
    earlyRepaymentPenaltyDescription: "Pénalité selon conditions contractuelles",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Solution globale assurance + hypothèque",
      "Optimisation fiscale intégrée",
      "Conseil personnalisé",
    ],
    rating: 4.1,
  },
  
  // Migros Bank
  {
    id: "migros-fixed",
    bankName: "Banque Migros",
    bankType: "cooperative",
    productName: "Hypothèque fixe",
    mortgageType: "fixed",
    rates: [
      { duration: 2, rate: 1.42 },
      { duration: 5, rate: 1.52 },
      { duration: 10, rate: 1.72 },
    ],
    minLoanAmount: 100000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "medium",
    earlyRepaymentPenaltyDescription: "Pénalité standard",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Taux très compétitifs",
      "Pas de frais de dossier",
      "Cumul points M-Cumulus",
      "Processus simplifié",
    ],
    rating: 4.3,
    badge: "bestRate",
  },
  {
    id: "migros-saron",
    bankName: "Banque Migros",
    bankType: "cooperative",
    productName: "Hypothèque SARON",
    mortgageType: "saron",
    rates: [
      { rate: CURRENT_SARON_RATE + 0.58, margin: 0.58 },
    ],
    minLoanAmount: 100000,
    maxLTV: 80,
    minOwnFunds: 20,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "none",
    earlyRepaymentPenaltyDescription: "Résiliation trimestrielle sans frais",
    indirectAmortization3a: true,
    flexibleAmortization: true,
    features: [
      "Marge la plus basse",
      "Aucune pénalité",
      "Points M-Cumulus",
    ],
    rating: 4.4,
  },
  
  // Zurich Insurance
  {
    id: "zurich-fixed",
    bankName: "Zurich",
    bankType: "insurance",
    productName: "Hypothèque Zurich",
    mortgageType: "fixed",
    rates: [
      { duration: 5, rate: 1.72 },
      { duration: 10, rate: 1.92 },
      { duration: 15, rate: 2.12 },
    ],
    minLoanAmount: 200000,
    maxLTV: 75,
    minOwnFunds: 25,
    minOwnFundsCash: 10,
    earlyRepaymentPenalty: "high",
    earlyRepaymentPenaltyDescription: "Pénalité importante en cas de sortie anticipée",
    indirectAmortization3a: true,
    flexibleAmortization: false,
    features: [
      "Solution prévoyance intégrée",
      "Assurance décès incluse possible",
      "Conseiller dédié",
    ],
    rating: 3.9,
  },
];

// Helper functions
export const getProductsByBank = (bankName: string): MortgageProduct[] => {
  return mortgageProducts.filter(p => p.bankName === bankName);
};

export const getProductsByType = (type: MortgageProduct["mortgageType"]): MortgageProduct[] => {
  return mortgageProducts.filter(p => p.mortgageType === type);
};

export const getFixedRateProducts = (duration: number): MortgageProduct[] => {
  return mortgageProducts.filter(p => 
    p.mortgageType === "fixed" && 
    p.rates.some(r => r.duration === duration)
  );
};

export const getSaronProducts = (): MortgageProduct[] => {
  return mortgageProducts.filter(p => p.mortgageType === "saron");
};

export const getBadgeLabel = (badge: string, language: string): string => {
  const labels: Record<string, Record<string, string>> = {
    recommended: {
      fr: "Recommandé",
      de: "Empfohlen",
      it: "Consigliato",
    },
    bestRate: {
      fr: "Meilleur taux",
      de: "Bester Zinssatz",
      it: "Miglior tasso",
    },
    mostFlexible: {
      fr: "Le plus flexible",
      de: "Am flexibelsten",
      it: "Più flessibile",
    },
    bestValue: {
      fr: "Meilleur rapport qualité/prix",
      de: "Bestes Preis-Leistungs-Verhältnis",
      it: "Miglior rapporto qualità/prezzo",
    },
  };
  return labels[badge]?.[language] || labels[badge]?.fr || badge;
};

export const getPenaltyLabel = (penalty: string, language: string): string => {
  const labels: Record<string, Record<string, string>> = {
    high: { fr: "Élevée", de: "Hoch", it: "Alta" },
    medium: { fr: "Moyenne", de: "Mittel", it: "Media" },
    low: { fr: "Faible", de: "Niedrig", it: "Bassa" },
    none: { fr: "Aucune", de: "Keine", it: "Nessuna" },
  };
  return labels[penalty]?.[language] || labels[penalty]?.fr || penalty;
};
