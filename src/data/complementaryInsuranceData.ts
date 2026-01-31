// Realistic data for complementary insurance (LCA) pricing in Switzerland
// Based on market research 2024-2025: packages range from ~CHF 30-180/month
// Three tiers: BASIC, PREMIUM, DIAMOND

export type ComplementaryTier = "basic" | "premium" | "diamond";

export interface TieredPricing {
  basic: number;
  premium: number;
  diamond: number;
}

export interface ComplementaryPricing {
  type: keyof ComplementaryOptions;
  name: string;
  prices: TieredPricing;
  descriptions: {
    basic: string;
    premium: string;
    diamond: string;
  };
}

export interface ComplementaryOptions {
  dental: boolean;
  hospitalization: boolean;
  glasses: boolean;
  alternativeMedicine: boolean;
  worldwide: boolean;
}

// Tier descriptions
export const tierInfo: Record<ComplementaryTier, { name: string; color: string; description: string }> = {
  basic: {
    name: "BASIC",
    color: "#64748b", // slate
    description: "Couverture essentielle à prix économique",
  },
  premium: {
    name: "PREMIUM",
    color: "#8b5cf6", // violet
    description: "Excellent rapport qualité-prix",
  },
  diamond: {
    name: "DIAMOND",
    color: "#f59e0b", // amber
    description: "Couverture maximale et privilèges",
  },
};

// Realistic monthly prices for complementary insurance by type and tier (CHF)
// Sources: Comparis, Helsana COMPLETA, CSS PLUS, Groupe Mutuel Premium, SWICA Optima
export const complementaryPricing: Record<keyof ComplementaryOptions, ComplementaryPricing> = {
  dental: {
    type: "dental",
    name: "Soins dentaires",
    prices: {
      basic: 8,      // 50% jusqu'à CHF 1000/an
      premium: 15,   // 75% jusqu'à CHF 2000/an
      diamond: 25,   // 90% jusqu'à CHF 5000/an + orthodontie
    },
    descriptions: {
      basic: "50% remboursé, max CHF 1'000/an",
      premium: "75% remboursé, max CHF 2'000/an",
      diamond: "90% remboursé, max CHF 5'000/an + orthodontie",
    },
  },
  hospitalization: {
    type: "hospitalization",
    name: "Hospitalisation",
    prices: {
      basic: 15,     // Division commune flex
      premium: 45,   // Semi-privée tout hôpital
      diamond: 95,   // Privée tout hôpital Suisse
    },
    descriptions: {
      basic: "Division commune, libre choix hôpital",
      premium: "Semi-privée, médecin-chef adjoint",
      diamond: "Privée, libre choix du médecin",
    },
  },
  glasses: {
    type: "glasses",
    name: "Lunettes & lentilles",
    prices: {
      basic: 3,      // CHF 150/an
      premium: 6,    // CHF 250/an + lentilles
      diamond: 12,   // CHF 400/an + chirurgie laser partiel
    },
    descriptions: {
      basic: "CHF 150/an pour lunettes",
      premium: "CHF 250/an lunettes + lentilles",
      diamond: "CHF 400/an + participation laser",
    },
  },
  alternativeMedicine: {
    type: "alternativeMedicine",
    name: "Médecines alternatives",
    prices: {
      basic: 5,      // 50% jusqu'à CHF 500/an
      premium: 10,   // 75% jusqu'à CHF 1500/an
      diamond: 18,   // 90% jusqu'à CHF 3000/an
    },
    descriptions: {
      basic: "50% remboursé, max CHF 500/an",
      premium: "75% remboursé, max CHF 1'500/an",
      diamond: "90% remboursé, max CHF 3'000/an",
    },
  },
  worldwide: {
    type: "worldwide",
    name: "Couverture monde & fitness",
    prices: {
      basic: 8,      // Fitness CHF 300/an seulement
      premium: 15,   // Fitness CHF 500/an + urgences monde
      diamond: 25,   // Fitness CHF 800/an + couverture monde complète + prévention
    },
    descriptions: {
      basic: "Fitness CHF 300/an",
      premium: "Fitness CHF 500/an + urgences monde",
      diamond: "Fitness CHF 800/an + couverture monde + prévention",
    },
  },
};

// Calculate complementary insurance price for selected options and tier
export const calculateComplementaryPrice = (
  selectedOptions: ComplementaryOptions,
  tier: ComplementaryTier = "premium"
): number => {
  let total = 0;
  
  (Object.keys(selectedOptions) as Array<keyof ComplementaryOptions>).forEach((key) => {
    if (selectedOptions[key]) {
      const pricing = complementaryPricing[key];
      total += pricing.prices[tier];
    }
  });
  
  return total;
};

// Get list of selected complementary options with details
export const getSelectedComplementaryDetails = (
  selectedOptions: ComplementaryOptions,
  tier: ComplementaryTier = "premium"
): Array<ComplementaryPricing & { selectedTier: ComplementaryTier; selectedPrice: number }> => {
  return (Object.keys(selectedOptions) as Array<keyof ComplementaryOptions>)
    .filter((key) => selectedOptions[key])
    .map((key) => ({
      ...complementaryPricing[key],
      selectedTier: tier,
      selectedPrice: complementaryPricing[key].prices[tier],
    }));
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

// Get tier label translated
export const getTierLabel = (tier: ComplementaryTier, language: string): string => {
  const labels: Record<ComplementaryTier, Record<string, string>> = {
    basic: {
      fr: "BASIC",
      de: "BASIC",
      it: "BASIC",
    },
    premium: {
      fr: "PREMIUM",
      de: "PREMIUM",
      it: "PREMIUM",
    },
    diamond: {
      fr: "DIAMOND",
      de: "DIAMOND",
      it: "DIAMOND",
    },
  };

  return labels[tier]?.[language] || labels[tier]?.fr || tier.toUpperCase();
};

// Get tier description translated
export const getTierDescription = (tier: ComplementaryTier, language: string): string => {
  const descriptions: Record<ComplementaryTier, Record<string, string>> = {
    basic: {
      fr: "Couverture essentielle à prix économique",
      de: "Grundlegende Deckung zu günstigen Preisen",
      it: "Copertura essenziale a prezzo economico",
    },
    premium: {
      fr: "Excellent rapport qualité-prix",
      de: "Ausgezeichnetes Preis-Leistungs-Verhältnis",
      it: "Ottimo rapporto qualità-prezzo",
    },
    diamond: {
      fr: "Couverture maximale et privilèges",
      de: "Maximale Deckung und Privilegien",
      it: "Copertura massima e privilegi",
    },
  };

  return descriptions[tier]?.[language] || descriptions[tier]?.fr || "";
};
