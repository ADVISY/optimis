// Realistic data for complementary insurance (LCA) pricing in Switzerland
// Based on market research 2024-2025: packages range from ~CHF 30-180/month
// depending on coverage level (commune, semi-privée, privée) and reimbursement rates

export interface ComplementaryPricing {
  type: keyof ComplementaryOptions;
  name: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  description: string;
}

export interface ComplementaryOptions {
  dental: boolean;
  hospitalization: boolean;
  glasses: boolean;
  alternativeMedicine: boolean;
  worldwide: boolean;
}

// Realistic monthly prices for complementary insurance by type (CHF)
// Sources: Comparis, Helsana COMPLETA, CSS PLUS, Groupe Mutuel Premium, SWICA Optima
export const complementaryPricing: Record<keyof ComplementaryOptions, ComplementaryPricing> = {
  dental: {
    type: "dental",
    name: "Soins dentaires",
    minPrice: 8,      // Basic coverage 50%
    maxPrice: 25,     // Premium coverage 75%
    averagePrice: 15, // Standard 50-75% up to CHF 2000/year
    description: "Couverture des soins dentaires (contrôles, détartrages, petites caries). Orthodontie enfants souvent en option.",
  },
  hospitalization: {
    type: "hospitalization",
    name: "Hospitalisation",
    minPrice: 15,     // Division commune flex
    maxPrice: 95,     // Division privée tout hôpital Suisse
    averagePrice: 45, // Semi-privée standard
    description: "Chambre semi-privée ou privée, libre choix du médecin. Prix varie selon division et âge.",
  },
  glasses: {
    type: "glasses",
    name: "Lunettes & lentilles",
    minPrice: 3,      // CHF 150/an
    maxPrice: 12,     // CHF 300/an + lentilles
    averagePrice: 6,  // CHF 200/an standard
    description: "Participation aux frais de lunettes et lentilles de contact (CHF 150-300/an typiquement).",
  },
  alternativeMedicine: {
    type: "alternativeMedicine",
    name: "Médecines alternatives",
    minPrice: 5,      // CHF 500/an 50%
    maxPrice: 18,     // CHF 3000/an 75%
    averagePrice: 10, // CHF 1500/an 75% standard
    description: "Ostéopathie, acupuncture, homéopathie, naturopathie, massage thérapeutique.",
  },
  worldwide: {
    type: "worldwide",
    name: "Couverture monde & fitness",
    minPrice: 8,      // Fitness seulement ~CHF 300/an
    maxPrice: 25,     // Couverture monde + fitness + prévention
    averagePrice: 12, // Fitness + couverture vacances
    description: "Abonnement fitness (CHF 300-600/an), soins à l'étranger, rapatriement, prévention santé.",
  },
};

// Calculate complementary insurance price for selected options
export const calculateComplementaryPrice = (
  selectedOptions: ComplementaryOptions,
  variant: "min" | "average" | "max" = "average"
): number => {
  let total = 0;
  
  (Object.keys(selectedOptions) as Array<keyof ComplementaryOptions>).forEach((key) => {
    if (selectedOptions[key]) {
      const pricing = complementaryPricing[key];
      switch (variant) {
        case "min":
          total += pricing.minPrice;
          break;
        case "max":
          total += pricing.maxPrice;
          break;
        default:
          total += pricing.averagePrice;
      }
    }
  });
  
  return total;
};

// Get list of selected complementary options with details
export const getSelectedComplementaryDetails = (
  selectedOptions: ComplementaryOptions
): ComplementaryPricing[] => {
  return (Object.keys(selectedOptions) as Array<keyof ComplementaryOptions>)
    .filter((key) => selectedOptions[key])
    .map((key) => complementaryPricing[key]);
};

// Translations for complementary insurance types
export const getComplementaryLabel = (
  type: keyof ComplementaryOptions,
  language: string
): string => {
  const labels: Record<keyof ComplementaryOptions, Record<string, string>> = {
    dental: {
      fr: "Soins dentaires",
      de: "Zahnpflege",
      it: "Cure dentarie",
    },
    hospitalization: {
      fr: "Hospitalisation",
      de: "Hospitalisation",
      it: "Ospedalizzazione",
    },
    glasses: {
      fr: "Lunettes & lentilles",
      de: "Brillen & Linsen",
      it: "Occhiali & lenti",
    },
    alternativeMedicine: {
      fr: "Médecines alternatives",
      de: "Alternativmedizin",
      it: "Medicine alternative",
    },
    worldwide: {
      fr: "Couverture mondiale",
      de: "Weltweite Deckung",
      it: "Copertura mondiale",
    },
  };

  return labels[type]?.[language] || labels[type]?.fr || type;
};
