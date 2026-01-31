// Mortgage Calculation Utilities for Swiss Mortgages

import { MortgageProduct, CURRENT_SARON_RATE } from "@/data/mortgageProducts";

export interface MortgageCalculationInput {
  loanAmount: number;
  propertyValue: number;
  duration: number; // years
  annualIncome: number;
  mortgageType: "fixed" | "saron" | "variable";
}

export interface AmortizationEntry {
  year: number;
  startBalance: number;
  interest: number;
  principal: number;
  endBalance: number;
  cumulativeInterest: number;
}

export interface MortgageSimulationResult {
  product: MortgageProduct;
  applicableRate: number;
  monthlyPayment: number;
  yearlyPayment: number;
  totalInterest: number;
  totalCost: number; // loan + interest
  amortizationSchedule: AmortizationEntry[];
  
  // Milestones
  balanceAfter5Years: number;
  balanceAfter10Years: number;
  balanceAfter15Years: number;
  interestAfter5Years: number;
  interestAfter10Years: number;
  interestAfter15Years: number;
  
  // Early exit scenario
  earlyExitPenaltyEstimate: number;
  earlyExitTotalCost: number;
  
  // Affordability
  debtRatio: number;
  isAffordable: boolean;
  
  // 3a integration
  potential3aSavings: number;
  potential3aTaxSavings: number;
  
  // Comparison metrics
  effectiveRate: number;
  totalCostPercentage: number;
}

// Swiss mortgage affordability rule: max 33% of gross income for housing costs
// Housing costs = mortgage interest + amortization + maintenance (1% of property value)
const MAX_DEBT_RATIO = 0.33;
const MAINTENANCE_RATE = 0.01; // 1% of property value annually
const IMPUTED_RATE = 0.05; // 5% imputed rate for affordability calculation

// Maximum 3a contribution (2024)
const MAX_3A_CONTRIBUTION_EMPLOYED = 7056;
const MAX_3A_CONTRIBUTION_SELF_EMPLOYED = 35280;

// Average marginal tax rate for 3a deduction estimate
const AVG_MARGINAL_TAX_RATE = 0.30;

/**
 * Calculate monthly mortgage payment (interest only for Swiss mortgages)
 * Swiss mortgages are typically interest-only with separate amortization
 */
export function calculateMonthlyInterest(loanAmount: number, annualRate: number): number {
  return (loanAmount * annualRate) / 100 / 12;
}

/**
 * Calculate monthly payment including amortization
 * Standard amortization: reduce to 65% LTV within 15 years, then optional
 */
export function calculateMonthlyPaymentWithAmortization(
  loanAmount: number,
  annualRate: number,
  amortizationYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = amortizationYears * 12;
  
  if (monthlyRate === 0) return loanAmount / numberOfPayments;
  
  const payment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) 
    / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return payment;
}

/**
 * Calculate total interest over the loan duration
 */
export function calculateTotalInterest(
  loanAmount: number,
  annualRate: number,
  years: number,
  withAmortization: boolean = false
): number {
  if (!withAmortization) {
    // Interest-only mortgage
    return loanAmount * (annualRate / 100) * years;
  }
  
  // With amortization
  const monthlyPayment = calculateMonthlyPaymentWithAmortization(loanAmount, annualRate, years);
  const totalPayments = monthlyPayment * years * 12;
  return totalPayments - loanAmount;
}

/**
 * Generate amortization schedule
 */
export function generateAmortizationSchedule(
  loanAmount: number,
  annualRate: number,
  years: number,
  withAmortization: boolean = true
): AmortizationEntry[] {
  const schedule: AmortizationEntry[] = [];
  let balance = loanAmount;
  let cumulativeInterest = 0;
  
  const yearlyRate = annualRate / 100;
  const yearlyAmortization = withAmortization ? loanAmount / years : 0;
  
  for (let year = 1; year <= years; year++) {
    const startBalance = balance;
    const interest = startBalance * yearlyRate;
    const principal = Math.min(yearlyAmortization, balance);
    const endBalance = Math.max(0, startBalance - principal);
    cumulativeInterest += interest;
    
    schedule.push({
      year,
      startBalance: Math.round(startBalance),
      interest: Math.round(interest),
      principal: Math.round(principal),
      endBalance: Math.round(endBalance),
      cumulativeInterest: Math.round(cumulativeInterest),
    });
    
    balance = endBalance;
  }
  
  return schedule;
}

/**
 * Calculate affordability (Swiss rules)
 */
export function calculateAffordability(
  loanAmount: number,
  propertyValue: number,
  annualIncome: number
): { debtRatio: number; isAffordable: boolean } {
  // Use imputed rate (5%) for affordability calculation
  const imputedInterest = loanAmount * IMPUTED_RATE;
  
  // Standard amortization: 1% of loan per year
  const standardAmortization = loanAmount * 0.01;
  
  // Maintenance: 1% of property value
  const maintenance = propertyValue * MAINTENANCE_RATE;
  
  // Total housing costs
  const totalHousingCosts = imputedInterest + standardAmortization + maintenance;
  
  // Debt ratio
  const debtRatio = totalHousingCosts / annualIncome;
  
  return {
    debtRatio,
    isAffordable: debtRatio <= MAX_DEBT_RATIO,
  };
}

/**
 * Estimate early exit penalty
 */
export function estimateEarlyExitPenalty(
  remainingBalance: number,
  remainingYears: number,
  contractRate: number,
  currentMarketRate: number,
  penaltyLevel: MortgageProduct["earlyRepaymentPenalty"]
): number {
  if (penaltyLevel === "none") return 0;
  
  // Rate differential
  const rateDiff = Math.max(0, contractRate - currentMarketRate);
  
  // Base penalty: present value of rate differential
  const basePenalty = remainingBalance * (rateDiff / 100) * remainingYears;
  
  // Apply multiplier based on penalty level
  const multipliers = {
    low: 0.3,
    medium: 0.6,
    high: 1.0,
  };
  
  return Math.round(basePenalty * multipliers[penaltyLevel as keyof typeof multipliers] || 0);
}

/**
 * Calculate potential 3a savings with indirect amortization
 */
export function calculate3aSavings(
  loanAmount: number,
  duration: number,
  annualContribution: number = MAX_3A_CONTRIBUTION_EMPLOYED,
  marginalTaxRate: number = AVG_MARGINAL_TAX_RATE
): { totalContributions: number; taxSavings: number } {
  const totalContributions = annualContribution * duration;
  const taxSavings = totalContributions * marginalTaxRate;
  
  return {
    totalContributions: Math.round(totalContributions),
    taxSavings: Math.round(taxSavings),
  };
}

/**
 * Get applicable rate for a product
 */
export function getApplicableRate(product: MortgageProduct, duration: number): number {
  if (product.mortgageType === "saron") {
    return product.rates[0]?.rate || CURRENT_SARON_RATE + 0.70;
  }
  
  // Find the closest matching duration for fixed rate
  const sortedRates = [...product.rates].sort((a, b) => (a.duration || 0) - (b.duration || 0));
  
  for (const rateInfo of sortedRates) {
    if (rateInfo.duration && rateInfo.duration >= duration) {
      return rateInfo.rate;
    }
  }
  
  // Return the longest duration rate if no match
  return sortedRates[sortedRates.length - 1]?.rate || 2.0;
}

/**
 * Run full mortgage simulation
 */
export function simulateMortgage(
  product: MortgageProduct,
  input: MortgageCalculationInput
): MortgageSimulationResult {
  const { loanAmount, propertyValue, duration, annualIncome } = input;
  
  // Get applicable rate
  const applicableRate = getApplicableRate(product, duration);
  
  // Calculate payments
  const monthlyInterest = calculateMonthlyInterest(loanAmount, applicableRate);
  const monthlyAmortization = loanAmount / (duration * 12);
  const monthlyPayment = monthlyInterest + monthlyAmortization;
  const yearlyPayment = monthlyPayment * 12;
  
  // Calculate total interest
  const amortizationSchedule = generateAmortizationSchedule(loanAmount, applicableRate, duration, true);
  const totalInterest = amortizationSchedule.reduce((sum, entry) => sum + entry.interest, 0);
  const totalCost = loanAmount + totalInterest;
  
  // Get milestone values
  const entry5 = amortizationSchedule.find(e => e.year === 5);
  const entry10 = amortizationSchedule.find(e => e.year === 10);
  const entry15 = amortizationSchedule.find(e => e.year === 15);
  
  // Affordability
  const { debtRatio, isAffordable } = calculateAffordability(loanAmount, propertyValue, annualIncome);
  
  // Early exit estimate (after 5 years)
  const remainingAfter5 = entry5?.endBalance || loanAmount;
  const earlyExitPenalty = estimateEarlyExitPenalty(
    remainingAfter5,
    duration - 5,
    applicableRate,
    applicableRate - 0.3, // Assume market rate dropped
    product.earlyRepaymentPenalty
  );
  const earlyExitTotalCost = (entry5?.cumulativeInterest || 0) + earlyExitPenalty;
  
  // 3a savings
  const { totalContributions: potential3aSavings, taxSavings: potential3aTaxSavings } = 
    product.indirectAmortization3a ? calculate3aSavings(loanAmount, duration) : { totalContributions: 0, taxSavings: 0 };
  
  return {
    product,
    applicableRate,
    monthlyPayment: Math.round(monthlyPayment),
    yearlyPayment: Math.round(yearlyPayment),
    totalInterest: Math.round(totalInterest),
    totalCost: Math.round(totalCost),
    amortizationSchedule,
    
    balanceAfter5Years: entry5?.endBalance || loanAmount,
    balanceAfter10Years: entry10?.endBalance || loanAmount,
    balanceAfter15Years: entry15?.endBalance || 0,
    interestAfter5Years: entry5?.cumulativeInterest || 0,
    interestAfter10Years: entry10?.cumulativeInterest || 0,
    interestAfter15Years: entry15?.cumulativeInterest || 0,
    
    earlyExitPenaltyEstimate: earlyExitPenalty,
    earlyExitTotalCost,
    
    debtRatio,
    isAffordable,
    
    potential3aSavings,
    potential3aTaxSavings,
    
    effectiveRate: applicableRate,
    totalCostPercentage: (totalInterest / loanAmount) * 100,
  };
}

/**
 * Format currency for display
 */
export function formatCHF(amount: number): string {
  return new Intl.NumberFormat('fr-CH', {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
