// Pillar 3a calculation utilities for retirement projections, tax savings, and protection benefits

import {
  Pillar3aProduct,
  cantonTaxRates,
  MAX_PILLAR3A_CONTRIBUTION_EMPLOYED,
  RETIREMENT_AGE_MALE,
} from "@/data/pillar3aProducts";

export interface Pillar3aProjection {
  product: Pillar3aProduct;
  
  // Retirement projections
  retirement: {
    totalContributions: number;      // Total amount paid over time
    estimatedCapital: number;        // Final capital at retirement
    estimatedGain: number;           // Capital - contributions
    yearsToRetirement: number;
    monthlyContribution: number;
    annualContribution: number;
  };
  
  // Protection benefits
  protection: {
    disabilityPensionAccident: number;  // Annual pension in case of disability from accident
    disabilityPensionIllness: number;   // Annual pension in case of disability from illness
    deathCapital: number;               // Capital paid in case of death
  };
  
  // Tax savings
  taxSavings: {
    annualSaving: number;            // Annual tax saving
    cumulativeSaving: number;        // Total tax savings until retirement
    marginalRate: number;            // Canton tax rate used
  };
  
  // Product info
  productInfo: {
    type: string;
    riskLevel: string;
    estimatedReturn: number;
    totalFees: number;
  };
  
  // Recommendation score (0-100)
  score: number;
  badges: ("recommended" | "bestReturn" | "lowestFees" | "bestProtection")[];
}

// Parse savings amount range to get average monthly contribution
const parseSavingsAmount = (savingsRange: string): number => {
  switch (savingsRange) {
    case "100-300":
      return 200;
    case "300-500":
      return 400;
    case "500-max":
      return 588; // Max annual / 12
    default:
      return 300;
  }
};

// Parse income range to get estimated annual income
const parseIncomeRange = (incomeRange: string): number => {
  switch (incomeRange) {
    case "0-50000":
      return 40000;
    case "50000-80000":
      return 65000;
    case "80000-120000":
      return 100000;
    case "120000-200000":
      return 160000;
    case "200000+":
      return 250000;
    default:
      return 80000;
  }
};

// Calculate compound growth with regular contributions
const calculateFutureValue = (
  monthlyContribution: number,
  annualReturnRate: number,
  years: number,
  annualFeeRate: number
): number => {
  const netAnnualRate = (annualReturnRate - annualFeeRate) / 100;
  const monthlyRate = netAnnualRate / 12;
  const months = years * 12;
  
  if (monthlyRate === 0) {
    return monthlyContribution * months;
  }
  
  // Future value of annuity formula
  const fv = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  return Math.round(fv);
};

// Get tax rate for canton (default to VD if not found)
export const getCantonTaxRate = (canton: string): number => {
  return cantonTaxRates[canton] || cantonTaxRates["VD"] || 0.25;
};

// Main calculation function
export const calculatePillar3aProjection = (
  product: Pillar3aProduct,
  formData: {
    age: string;
    riskProfile: string;
    savingsAmount: string;
    incomeRange: string;
    objective: string;
    canton?: string;
  }
): Pillar3aProjection => {
  const currentAge = parseInt(formData.age) || 35;
  const yearsToRetirement = Math.max(1, RETIREMENT_AGE_MALE - currentAge);
  const riskProfile = formData.riskProfile as keyof typeof product.estimatedReturn;
  
  // Monthly contribution
  const monthlyContribution = parseSavingsAmount(formData.savingsAmount);
  const annualContribution = Math.min(monthlyContribution * 12, MAX_PILLAR3A_CONTRIBUTION_EMPLOYED);
  
  // Get return rate based on user's risk profile
  const estimatedReturn = product.estimatedReturn[riskProfile] || product.estimatedReturn.moderate;
  const totalFees = product.managementFee + product.riskFee;
  
  // Calculate retirement projections
  const totalContributions = annualContribution * yearsToRetirement;
  const estimatedCapital = calculateFutureValue(
    monthlyContribution,
    estimatedReturn,
    yearsToRetirement,
    totalFees
  );
  const estimatedGain = Math.max(0, estimatedCapital - totalContributions);
  
  // Calculate protection benefits
  // Disability pension is based on a percentage of insured capital (roughly 80% of total contributions)
  const insuredCapital = annualContribution * Math.min(yearsToRetirement, 40);
  const disabilityPensionAccident = Math.round((insuredCapital * product.disabilityBenefitAccident) / 100 / 12) * 12; // Rounded to annual
  const disabilityPensionIllness = Math.round((insuredCapital * product.disabilityBenefitIllness) / 100 / 12) * 12;
  
  // Death capital is total contributions + bonus percentage
  const deathCapital = Math.round((totalContributions * product.deathBenefit) / 100);
  
  // Calculate tax savings
  const canton = formData.canton || "VD";
  const marginalRate = getCantonTaxRate(canton);
  const annualTaxSaving = Math.round(annualContribution * marginalRate);
  const cumulativeTaxSaving = annualTaxSaving * yearsToRetirement;
  
  // Calculate recommendation score (0-100)
  let score = 50;
  
  // Factor 1: Return vs fees ratio (max +20)
  const netReturn = estimatedReturn - totalFees;
  score += Math.min(20, netReturn * 4);
  
  // Factor 2: Protection benefits (max +15)
  if (formData.objective === "protection") {
    score += (product.disabilityBenefitAccident / 80) * 10;
    score += (product.deathBenefit / 150) * 5;
  }
  
  // Factor 3: Risk profile match (max +10)
  if (product.riskProfile === riskProfile) {
    score += 10;
  }
  
  // Factor 4: Rating (max +10)
  score += (product.rating - 4) * 10;
  
  // Factor 5: Flexibility (max +5)
  if (product.flexibility === "high") score += 5;
  else if (product.flexibility === "medium") score += 3;
  
  score = Math.min(100, Math.max(0, Math.round(score)));
  
  // Determine badges
  const badges: ("recommended" | "bestReturn" | "lowestFees" | "bestProtection")[] = [];
  
  return {
    product,
    retirement: {
      totalContributions,
      estimatedCapital,
      estimatedGain,
      yearsToRetirement,
      monthlyContribution,
      annualContribution,
    },
    protection: {
      disabilityPensionAccident,
      disabilityPensionIllness,
      deathCapital,
    },
    taxSavings: {
      annualSaving: annualTaxSaving,
      cumulativeSaving: cumulativeTaxSaving,
      marginalRate,
    },
    productInfo: {
      type: product.productType,
      riskLevel: product.riskProfile,
      estimatedReturn,
      totalFees,
    },
    score,
    badges,
  };
};

// Calculate projections for all matching products
export const calculateAllProjections = (
  products: Pillar3aProduct[],
  formData: {
    age: string;
    riskProfile: string;
    savingsAmount: string;
    incomeRange: string;
    objective: string;
    canton?: string;
  }
): Pillar3aProjection[] => {
  const projections = products.map((product) =>
    calculatePillar3aProjection(product, formData)
  );
  
  // Sort by score descending
  projections.sort((a, b) => b.score - a.score);
  
  // Assign badges based on comparisons
  if (projections.length > 0) {
    // Best recommendation (highest score)
    projections[0].badges.push("recommended");
    
    // Best return
    const bestReturn = [...projections].sort(
      (a, b) => b.productInfo.estimatedReturn - a.productInfo.estimatedReturn
    )[0];
    if (bestReturn) {
      const idx = projections.findIndex((p) => p.product.id === bestReturn.product.id);
      if (idx >= 0 && !projections[idx].badges.includes("recommended")) {
        projections[idx].badges.push("bestReturn");
      }
    }
    
    // Lowest fees
    const lowestFees = [...projections].sort(
      (a, b) => a.productInfo.totalFees - b.productInfo.totalFees
    )[0];
    if (lowestFees) {
      const idx = projections.findIndex((p) => p.product.id === lowestFees.product.id);
      if (idx >= 0) {
        projections[idx].badges.push("lowestFees");
      }
    }
    
    // Best protection
    const bestProtection = [...projections].sort(
      (a, b) =>
        (b.protection.disabilityPensionAccident + b.protection.deathCapital) -
        (a.protection.disabilityPensionAccident + a.protection.deathCapital)
    )[0];
    if (bestProtection && bestProtection.protection.disabilityPensionAccident > 0) {
      const idx = projections.findIndex((p) => p.product.id === bestProtection.product.id);
      if (idx >= 0) {
        projections[idx].badges.push("bestProtection");
      }
    }
  }
  
  return projections;
};

// Format currency for display
export const formatCHF = (amount: number): string => {
  return new Intl.NumberFormat("fr-CH", {
    style: "currency",
    currency: "CHF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage for display
export const formatPercent = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Get product type label in French
export const getProductTypeLabel = (type: string): string => {
  switch (type) {
    case "guaranteed":
      return "Capital garanti";
    case "mixed":
      return "Mixte";
    case "fund-linked":
      return "Lié à des fonds";
    default:
      return type;
  }
};

// Get risk level label in French
export const getRiskLevelLabel = (level: string): string => {
  switch (level) {
    case "conservative":
      return "Conservateur";
    case "moderate":
      return "Modéré";
    case "dynamic":
      return "Dynamique";
    case "aggressive":
      return "Agressif";
    default:
      return level;
  }
};
