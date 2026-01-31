// Pillar 3a products data for Swiss insurance companies
// Based on real product characteristics from Swiss insurers

export interface Pillar3aProduct {
  id: string;
  companyName: string;
  productName: string;
  productType: "guaranteed" | "mixed" | "fund-linked";
  riskProfile: "conservative" | "moderate" | "dynamic" | "aggressive";
  
  // Return estimates (annual %)
  estimatedReturn: {
    conservative: number;
    moderate: number;
    dynamic: number;
    aggressive: number;
  };
  
  // Fees (annual %)
  managementFee: number;
  riskFee: number;
  
  // Protection benefits (as % of insured capital or annual contribution)
  disabilityBenefitAccident: number; // % of insured capital as annual pension
  disabilityBenefitIllness: number;  // % of insured capital as annual pension
  deathBenefit: number;              // % of contributions returned + bonus
  
  // Additional info
  minContribution: number;  // CHF/month
  maxContribution: number;  // CHF/year (legal maximum)
  flexibility: "low" | "medium" | "high";
  rating: number;
  
  // Unique selling points
  highlights: string[];
}

// Swiss tax marginal rates by canton (approximate for average income)
export const cantonTaxRates: Record<string, number> = {
  "ZH": 0.23,   // Zurich
  "BE": 0.24,   // Bern
  "LU": 0.18,   // Lucerne
  "UR": 0.17,   // Uri
  "SZ": 0.14,   // Schwyz
  "OW": 0.16,   // Obwalden
  "NW": 0.15,   // Nidwalden
  "GL": 0.19,   // Glarus
  "ZG": 0.12,   // Zug
  "FR": 0.23,   // Fribourg
  "SO": 0.22,   // Solothurn
  "BS": 0.26,   // Basel-Stadt
  "BL": 0.25,   // Basel-Landschaft
  "SH": 0.21,   // Schaffhausen
  "AR": 0.20,   // Appenzell Ausserrhoden
  "AI": 0.16,   // Appenzell Innerrhoden
  "SG": 0.21,   // St. Gallen
  "GR": 0.20,   // Graubünden
  "AG": 0.21,   // Aargau
  "TG": 0.20,   // Thurgau
  "TI": 0.22,   // Ticino
  "VD": 0.25,   // Vaud
  "VS": 0.20,   // Valais
  "NE": 0.26,   // Neuchâtel
  "GE": 0.27,   // Geneva
  "JU": 0.25,   // Jura
};

// Legal maximum 3a contribution 2024/2025
export const MAX_PILLAR3A_CONTRIBUTION_EMPLOYED = 7056; // CHF/year
export const MAX_PILLAR3A_CONTRIBUTION_SELF_EMPLOYED = 35280; // CHF/year (20% of net income, max)

// Retirement age in Switzerland
export const RETIREMENT_AGE_MALE = 65;
export const RETIREMENT_AGE_FEMALE = 64; // Will increase to 65 by 2028

// Pillar 3a products from major Swiss insurers
export const pillar3aProducts: Pillar3aProduct[] = [
  {
    id: "swisslife-flexsave",
    companyName: "Swiss Life",
    productName: "FlexSave Duo",
    productType: "mixed",
    riskProfile: "moderate",
    estimatedReturn: {
      conservative: 1.5,
      moderate: 3.2,
      dynamic: 4.5,
      aggressive: 5.8,
    },
    managementFee: 0.85,
    riskFee: 0.35,
    disabilityBenefitAccident: 60,
    disabilityBenefitIllness: 40,
    deathBenefit: 105,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.6,
    highlights: [
      "Capital garanti à l'échéance",
      "Flexibilité des versements",
      "Couverture décès et invalidité incluse",
    ],
  },
  {
    id: "swisslife-vitainvest",
    companyName: "Swiss Life",
    productName: "VitaInvest",
    productType: "fund-linked",
    riskProfile: "dynamic",
    estimatedReturn: {
      conservative: 2.0,
      moderate: 4.0,
      dynamic: 5.5,
      aggressive: 7.0,
    },
    managementFee: 1.1,
    riskFee: 0.25,
    disabilityBenefitAccident: 60,
    disabilityBenefitIllness: 40,
    deathBenefit: 100,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.4,
    highlights: [
      "Potentiel de rendement élevé",
      "Large choix de fonds ESG",
      "Switching gratuit",
    ],
  },
  {
    id: "axa-smartflex",
    companyName: "AXA",
    productName: "SmartFlex",
    productType: "mixed",
    riskProfile: "moderate",
    estimatedReturn: {
      conservative: 1.8,
      moderate: 3.5,
      dynamic: 4.8,
      aggressive: 6.2,
    },
    managementFee: 0.90,
    riskFee: 0.30,
    disabilityBenefitAccident: 60,
    disabilityBenefitIllness: 50,
    deathBenefit: 110,
    minContribution: 50,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.5,
    highlights: [
      "Bonus de fidélité après 10 ans",
      "Protection renforcée maladie",
      "Application mobile complète",
    ],
  },
  {
    id: "axa-lifeprotect",
    companyName: "AXA",
    productName: "LifeProtect 3a",
    productType: "guaranteed",
    riskProfile: "conservative",
    estimatedReturn: {
      conservative: 1.0,
      moderate: 1.5,
      dynamic: 2.0,
      aggressive: 2.5,
    },
    managementFee: 0.65,
    riskFee: 0.50,
    disabilityBenefitAccident: 80,
    disabilityBenefitIllness: 60,
    deathBenefit: 150,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "medium",
    rating: 4.3,
    highlights: [
      "Capital 100% garanti",
      "Couverture maximale décès/invalidité",
      "Idéal pour profil prudent",
    ],
  },
  {
    id: "zurich-vita",
    companyName: "Zurich",
    productName: "Zurich Vita Invest",
    productType: "fund-linked",
    riskProfile: "dynamic",
    estimatedReturn: {
      conservative: 1.5,
      moderate: 3.8,
      dynamic: 5.2,
      aggressive: 6.8,
    },
    managementFee: 1.0,
    riskFee: 0.30,
    disabilityBenefitAccident: 60,
    disabilityBenefitIllness: 40,
    deathBenefit: 100,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.4,
    highlights: [
      "Fonds durables Zurich",
      "Gestion dynamique automatique",
      "Réduction des risques à l'approche de la retraite",
    ],
  },
  {
    id: "zurich-capital",
    companyName: "Zurich",
    productName: "Zurich Capital",
    productType: "guaranteed",
    riskProfile: "conservative",
    estimatedReturn: {
      conservative: 1.2,
      moderate: 1.8,
      dynamic: 2.2,
      aggressive: 2.8,
    },
    managementFee: 0.70,
    riskFee: 0.40,
    disabilityBenefitAccident: 70,
    disabilityBenefitIllness: 50,
    deathBenefit: 120,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "medium",
    rating: 4.2,
    highlights: [
      "Garantie du capital versé",
      "Taux technique garanti",
      "Stabilité et sécurité",
    ],
  },
  {
    id: "helvetia-smart3a",
    companyName: "Helvetia",
    productName: "Smart 3a",
    productType: "mixed",
    riskProfile: "moderate",
    estimatedReturn: {
      conservative: 1.6,
      moderate: 3.3,
      dynamic: 4.6,
      aggressive: 5.9,
    },
    managementFee: 0.88,
    riskFee: 0.32,
    disabilityBenefitAccident: 60,
    disabilityBenefitIllness: 45,
    deathBenefit: 105,
    minContribution: 80,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.3,
    highlights: [
      "Combinaison épargne et protection",
      "Frais compétitifs",
      "Service client primé",
    ],
  },
  {
    id: "generali-perform3a",
    companyName: "Generali",
    productName: "Perform 3a",
    productType: "fund-linked",
    riskProfile: "aggressive",
    estimatedReturn: {
      conservative: 2.0,
      moderate: 4.2,
      dynamic: 6.0,
      aggressive: 7.5,
    },
    managementFee: 1.15,
    riskFee: 0.20,
    disabilityBenefitAccident: 50,
    disabilityBenefitIllness: 35,
    deathBenefit: 100,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.1,
    highlights: [
      "Rendement potentiel maximum",
      "Fonds actions monde",
      "Pour investisseurs avertis",
    ],
  },
  {
    id: "baloise-safe3a",
    companyName: "Baloise",
    productName: "Safe Invest 3a",
    productType: "guaranteed",
    riskProfile: "conservative",
    estimatedReturn: {
      conservative: 1.1,
      moderate: 1.6,
      dynamic: 2.0,
      aggressive: 2.4,
    },
    managementFee: 0.68,
    riskFee: 0.45,
    disabilityBenefitAccident: 75,
    disabilityBenefitIllness: 55,
    deathBenefit: 130,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "medium",
    rating: 4.2,
    highlights: [
      "Capital garanti",
      "Protection familiale renforcée",
      "Idéal jeunes familles",
    ],
  },
  {
    id: "baloise-mix3a",
    companyName: "Baloise",
    productName: "Mix Invest 3a",
    productType: "mixed",
    riskProfile: "moderate",
    estimatedReturn: {
      conservative: 1.5,
      moderate: 3.0,
      dynamic: 4.2,
      aggressive: 5.5,
    },
    managementFee: 0.82,
    riskFee: 0.35,
    disabilityBenefitAccident: 60,
    disabilityBenefitIllness: 45,
    deathBenefit: 110,
    minContribution: 80,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.3,
    highlights: [
      "Équilibre rendement/sécurité",
      "Gestion automatisée",
      "Frais transparents",
    ],
  },
  {
    id: "vaudoise-prevoyance3a",
    companyName: "Vaudoise",
    productName: "Prévoyance 3a",
    productType: "mixed",
    riskProfile: "moderate",
    estimatedReturn: {
      conservative: 1.4,
      moderate: 2.9,
      dynamic: 4.0,
      aggressive: 5.2,
    },
    managementFee: 0.80,
    riskFee: 0.38,
    disabilityBenefitAccident: 65,
    disabilityBenefitIllness: 45,
    deathBenefit: 108,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "medium",
    rating: 4.2,
    highlights: [
      "Assureur régional de confiance",
      "Conseiller dédié",
      "Produit suisse",
    ],
  },
  {
    id: "viac-global",
    companyName: "VIAC",
    productName: "VIAC Global 100",
    productType: "fund-linked",
    riskProfile: "aggressive",
    estimatedReturn: {
      conservative: 2.5,
      moderate: 4.5,
      dynamic: 6.5,
      aggressive: 8.0,
    },
    managementFee: 0.44,
    riskFee: 0.0,
    disabilityBenefitAccident: 0,
    disabilityBenefitIllness: 0,
    deathBenefit: 100,
    minContribution: 1,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.7,
    highlights: [
      "Frais les plus bas du marché",
      "100% digital",
      "Investissement durable",
    ],
  },
  {
    id: "viac-balanced",
    companyName: "VIAC",
    productName: "VIAC Global 60",
    productType: "fund-linked",
    riskProfile: "moderate",
    estimatedReturn: {
      conservative: 1.8,
      moderate: 3.5,
      dynamic: 4.8,
      aggressive: 6.0,
    },
    managementFee: 0.40,
    riskFee: 0.0,
    disabilityBenefitAccident: 0,
    disabilityBenefitIllness: 0,
    deathBenefit: 100,
    minContribution: 1,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.6,
    highlights: [
      "Frais ultra-compétitifs",
      "Allocation équilibrée actions/obligations",
      "Application intuitive",
    ],
  },
  {
    id: "postfinance-3a",
    companyName: "PostFinance",
    productName: "Fonds de prévoyance 75",
    productType: "fund-linked",
    riskProfile: "dynamic",
    estimatedReturn: {
      conservative: 1.5,
      moderate: 3.2,
      dynamic: 4.5,
      aggressive: 5.8,
    },
    managementFee: 0.89,
    riskFee: 0.0,
    disabilityBenefitAccident: 0,
    disabilityBenefitIllness: 0,
    deathBenefit: 100,
    minContribution: 50,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "high",
    rating: 4.1,
    highlights: [
      "Réseau PostFinance",
      "Sans engagement long terme",
      "Versements flexibles",
    ],
  },
  {
    id: "allianz-prevoyance3a",
    companyName: "Allianz",
    productName: "Allianz Prévoyance 3a",
    productType: "mixed",
    riskProfile: "moderate",
    estimatedReturn: {
      conservative: 1.6,
      moderate: 3.2,
      dynamic: 4.4,
      aggressive: 5.6,
    },
    managementFee: 0.92,
    riskFee: 0.35,
    disabilityBenefitAccident: 60,
    disabilityBenefitIllness: 45,
    deathBenefit: 105,
    minContribution: 100,
    maxContribution: MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
    flexibility: "medium",
    rating: 4.3,
    highlights: [
      "Solidité financière mondiale",
      "Protection complète",
      "Expertise assurance-vie",
    ],
  },
];

// Get products matching user's risk profile
export const getMatchingProducts = (
  userRiskProfile: string,
  objective: string
): Pillar3aProduct[] => {
  // Map user objectives to preferred product types
  const objectiveToProductType: Record<string, ("guaranteed" | "mixed" | "fund-linked")[]> = {
    tax: ["guaranteed", "mixed", "fund-linked"], // All products for tax savings
    retirement: ["mixed", "fund-linked"], // Growth-oriented for retirement
    protection: ["guaranteed", "mixed"], // Protection-focused products
    mix: ["mixed"], // Balanced products
  };

  const preferredTypes = objectiveToProductType[objective] || ["mixed"];

  // Filter and sort products
  return pillar3aProducts
    .filter((product) => {
      // Include if product type matches objective preference
      const typeMatch = preferredTypes.includes(product.productType);
      
      // Include if risk profile is compatible (within 1 level)
      const riskLevels = ["conservative", "moderate", "dynamic", "aggressive"];
      const userLevel = riskLevels.indexOf(userRiskProfile);
      const productLevel = riskLevels.indexOf(product.riskProfile);
      const riskMatch = Math.abs(userLevel - productLevel) <= 1;
      
      return typeMatch || riskMatch;
    })
    .sort((a, b) => b.rating - a.rating);
};
