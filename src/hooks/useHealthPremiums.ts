import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HealthPremiumParams {
  canton: string;
  postalCode?: string;
  birthYear: number;
  franchise: number;
  model: "base" | "standard" | "family-doctor" | "ham" | "hmo" | "telemed" | "div" | "all";
  withAccident: boolean;
  language?: string;
}

export interface PremiumResult {
  insurerId: string;
  insurerName: string;
  premium: number;
  model: string;
  modelName: string;
  franchise: number;
  withAccident: boolean;
  region: string;
  tarifId: string;
  tarifName: string;
}

export interface HealthPremiumResponse {
  success: boolean;
  params: HealthPremiumParams;
  count: number;
  premiums: PremiumResult[];
  source: string;
  year: number;
}

// Map form model values to API model values
const mapFormModelToApiModel = (formModel: string): string => {
  const mapping: Record<string, string> = {
    "standard": "base",
    "family-doctor": "ham",
    "hmo": "hmo",
    "telemed": "div",
  };
  return mapping[formModel] || formModel;
};

// Convert API premium result to InsuranceOffer format
export const premiumToInsuranceOffer = (
  premium: PremiumResult,
  index: number
): {
  id: string;
  companyName: string;
  coverageType: string;
  monthlyPrice: number;
  yearlyPrice: number;
  franchise: number;
  mainFeatures: string[];
  badge?: "bestPrice" | "recommended" | "bestValue";
  rating: number;
} => {
  // Determine badge based on position
  let badge: "bestPrice" | "recommended" | "bestValue" | undefined;
  if (index === 0) badge = "bestPrice";
  else if (index === 1) badge = "recommended";
  else if (index === 2) badge = "bestValue";

  // Generate features based on model and tariff
  const features: string[] = [];
  
  if (premium.withAccident) {
    features.push("Couverture accident incluse");
  } else {
    features.push("Sans couverture accident");
  }
  
  features.push(`Franchise CHF ${premium.franchise}`);
  
  if (premium.tarifName) {
    features.push(`Produit: ${premium.tarifName}`);
  }

  // Add model-specific features
  switch (premium.model) {
    case "TAR-BASE":
      features.push("Libre choix du médecin");
      break;
    case "TAR-HAM":
      features.push("Médecin de famille obligatoire");
      break;
    case "TAR-HMO":
      features.push("Centre médical HMO");
      break;
    case "TAR-DIV":
      features.push("Téléconsultation en premier");
      break;
  }

  // Generate a pseudo-random rating based on insurer (for consistency)
  const ratingBase = parseInt(premium.insurerId) % 10;
  const rating = 3.8 + (ratingBase / 15);

  return {
    id: `${premium.insurerId}-${premium.tarifId}-${premium.model}`,
    companyName: premium.insurerName,
    coverageType: `LAMal ${premium.modelName}`,
    monthlyPrice: premium.premium,
    yearlyPrice: premium.premium * 12,
    franchise: premium.franchise,
    mainFeatures: features.slice(0, 4),
    badge,
    rating: Math.min(rating, 4.9),
  };
};

export const useHealthPremiums = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [premiums, setPremiums] = useState<PremiumResult[]>([]);

  const fetchPremiums = async (params: Omit<HealthPremiumParams, "model"> & { model: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiModel = mapFormModelToApiModel(params.model);
      
      const { data, error: fnError } = await supabase.functions.invoke<HealthPremiumResponse>(
        "get-health-premiums",
        {
          body: {
            canton: params.canton,
            postalCode: params.postalCode,
            birthYear: params.birthYear,
            franchise: params.franchise,
            model: apiModel,
            withAccident: params.withAccident,
            language: params.language || "fr",
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to fetch premiums");
      }

      if (!data?.premiums) {
        throw new Error("No premium data received");
      }

      setPremiums(data.premiums);
      return data.premiums;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      console.error("Error fetching health premiums:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchPremiums,
    premiums,
    isLoading,
    error,
  };
};
