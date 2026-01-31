// Mock data for complementary insurance (LCA) pricing

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

// Average monthly prices for complementary insurance by type (CHF)
export const complementaryPricing: Record<keyof ComplementaryOptions, ComplementaryPricing> = {
  dental: {
    type: "dental",
    name: "Soins dentaires",
    minPrice: 15,
    maxPrice: 45,
    averagePrice: 28,
    description: "Couverture des soins dentaires (orthodontie, implants, couronnes)",
  },
  hospitalization: {
    type: "hospitalization",
    name: "Hospitalisation",
    minPrice: 35,
    maxPrice: 120,
    averagePrice: 65,
    description: "Chambre privée/semi-privée, libre choix du médecin à l'hôpital",
  },
  glasses: {
    type: "glasses",
    name: "Lunettes & lentilles",
    minPrice: 8,
    maxPrice: 25,
    averagePrice: 15,
    description: "Participation aux frais de lunettes et lentilles de contact",
  },
  alternativeMedicine: {
    type: "alternativeMedicine",
    name: "Médecines alternatives",
    minPrice: 12,
    maxPrice: 35,
    averagePrice: 22,
    description: "Acupuncture, homéopathie, ostéopathie, naturopathie",
  },
  worldwide: {
    type: "worldwide",
    name: "Couverture mondiale",
    minPrice: 20,
    maxPrice: 60,
    averagePrice: 35,
    description: "Assistance et soins médicaux à l'étranger, rapatriement",
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
