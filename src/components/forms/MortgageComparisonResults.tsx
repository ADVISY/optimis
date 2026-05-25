import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Building2,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Banknote,
  PiggyBank,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Star,
} from "lucide-react";
import { MortgageSimulationResult, formatCHF, formatPercent } from "@/utils/mortgageCalculations";
import { getBadgeLabel, getPenaltyLabel } from "@/data/mortgageProducts";
import { insurerLogos } from "@/data/insurerLogos";
import ContactOfferModal from "./ContactOfferModal";

interface MortgageComparisonResultsProps {
  results: MortgageSimulationResult[];
  loanAmount: number;
  propertyValue: number;
  duration: number;
}

const MortgageComparisonResults = ({
  results,
  loanAmount,
  propertyValue,
  duration,
}: MortgageComparisonResultsProps) => {
  const { t, i18n } = useTranslation();
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<MortgageSimulationResult | null>(null);
  const [contactType, setContactType] = useState<"call" | "email">("call");

  // Sort results by total cost
  const sortedResults = [...results].sort((a, b) => a.totalCost - b.totalCost);

  const handleContactRequest = (result: MortgageSimulationResult, type: "call" | "email") => {
    setSelectedOffer(result);
    setContactType(type);
    setContactModalOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case "recommended":
        return "bg-primary text-primary-foreground";
      case "bestRate":
        return "bg-green-500 text-white";
      case "mostFlexible":
        return "bg-blue-500 text-white";
      case "bestValue":
        return "bg-amber-500 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPenaltyColor = (penalty: string) => {
    switch (penalty) {
      case "none":
        return "text-green-600";
      case "low":
        return "text-green-500";
      case "medium":
        return "text-amber-500";
      case "high":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  // Get bank logo or fallback
  const getBankLogo = (bankName: string) => {
    const logoKey = bankName.toLowerCase().replace(/\s+/g, "-");
    const logoData = insurerLogos[logoKey as keyof typeof insurerLogos];
    
    if (logoData?.logo) {
      return (
        <img 
          src={logoData.logo} 
          alt={bankName} 
          className="h-10 w-auto object-contain"
        />
      );
    }
    
    // Fallback with initials
    const initials = bankName.split(" ").map(w => w[0]).join("").slice(0, 2);
    return (
      <div 
        className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
        style={{ backgroundColor: logoData?.color || "#6366f1" }}
      >
        {initials}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="grid gap-4 md:grid-cols-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("forms.mortgage.results.loanAmount", "Montant emprunté")}</p>
              <p className="text-2xl font-bold text-primary">{formatCHF(loanAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("forms.mortgage.results.propertyValue", "Valeur du bien")}</p>
              <p className="text-2xl font-bold">{formatCHF(propertyValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("forms.mortgage.results.duration", "Durée")}</p>
              <p className="text-2xl font-bold">{duration} {t("forms.mortgage.years", "ans")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("forms.mortgage.results.ltv", "Ratio d'endettement")}</p>
              <p className="text-2xl font-bold">{formatPercent((loanAmount / propertyValue) * 100, 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {sortedResults.map((result, index) => {
          const isExpanded = expandedCard === result.product.id;
          const isCheapest = index === 0;

          return (
            <Card 
              key={result.product.id}
              className={`overflow-hidden transition-all duration-300 ${
                isCheapest ? "ring-2 ring-primary shadow-lg" : ""
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {getBankLogo(result.product.bankName)}
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {result.product.bankName}
                        {result.product.badge && (
                          <Badge className={getBadgeColor(result.product.badge)}>
                            {getBadgeLabel(result.product.badge, i18n.language)}
                          </Badge>
                        )}
                        {isCheapest && !result.product.badge && (
                          <Badge className="bg-green-500 text-white">
                            {t("forms.mortgage.results.lowestCost", "Coût le plus bas")}
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {result.product.productName} • {result.product.mortgageType === "saron" ? "SARON" : t("forms.mortgage.results.fixedRate", "Taux fixe")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(result.product.rating) ? "text-amber-400 fill-amber-400" : "text-muted"}`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground ml-1">{result.product.rating}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Main Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t("forms.mortgage.results.rate", "Taux")}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{formatPercent(result.applicableRate)}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t("forms.mortgage.results.monthly", "Mensualité")}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{formatCHF(result.monthlyPayment)}</p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Banknote className="h-4 w-4 text-amber-500" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t("forms.mortgage.results.totalInterest", "Intérêts totaux")}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-amber-600">{formatCHF(result.totalInterest)}</p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">
                        {t("forms.mortgage.results.totalCost", "Coût total")}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{formatCHF(result.totalCost)}</p>
                  </div>
                </div>

                {/* Affordability Check */}
                <div className={`flex items-center gap-2 p-3 rounded-lg ${result.isAffordable ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {result.isAffordable ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">{t("forms.mortgage.results.affordable", "Financement viable")}</span>
                      <span className="text-sm">— {t("forms.mortgage.results.debtRatio", "Taux d'effort")}: {formatPercent(result.debtRatio * 100, 1)}</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">{t("forms.mortgage.results.notAffordable", "Financement à risque")}</span>
                      <span className="text-sm">— {t("forms.mortgage.results.debtRatio", "Taux d'effort")}: {formatPercent(result.debtRatio * 100, 1)} (&gt;33%)</span>
                    </>
                  )}
                </div>

                {/* Expand Button */}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => toggleExpand(result.product.id)}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      {t("forms.mortgage.results.seeLess", "Voir moins")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      {t("forms.mortgage.results.seeMore", "Voir le détail complet")}
                    </>
                  )}
                </Button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="space-y-6 pt-4 border-t">
                    <Tabs defaultValue="evolution" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="evolution">{t("forms.mortgage.results.evolution", "Évolution")}</TabsTrigger>
                        <TabsTrigger value="conditions">{t("forms.mortgage.results.conditions", "Conditions")}</TabsTrigger>
                        <TabsTrigger value="savings">{t("forms.mortgage.results.optimization", "Optimisation")}</TabsTrigger>
                      </TabsList>

                      <TabsContent value="evolution" className="space-y-4 mt-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {t("forms.mortgage.results.capitalEvolution", "Évolution du capital restant dû")}
                        </h4>
                        
                        <div className="space-y-3">
                          {[5, 10, 15].map((year) => {
                            const balance = year === 5 ? result.balanceAfter5Years 
                              : year === 10 ? result.balanceAfter10Years 
                              : result.balanceAfter15Years;
                            const interest = year === 5 ? result.interestAfter5Years
                              : year === 10 ? result.interestAfter10Years
                              : result.interestAfter15Years;
                            const progress = 100 - (balance / loanAmount) * 100;

                            if (year > duration) return null;

                            return (
                              <div key={year} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span>{t("forms.mortgage.results.after", "Après")} {year} {t("forms.mortgage.years", "ans")}</span>
                                  <span className="font-medium">{formatCHF(balance)} {t("forms.mortgage.results.remaining", "restant")}</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>{t("forms.mortgage.results.paidInterest", "Intérêts payés")}: {formatCHF(interest)}</span>
                                  <span>{formatPercent(progress, 0)} {t("forms.mortgage.results.repaid", "remboursé")}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Interest vs Principal breakdown */}
                        <div className="bg-muted/50 rounded-lg p-4 mt-4">
                          <h5 className="font-medium mb-3">{t("forms.mortgage.results.breakdown", "Répartition sur la durée totale")}</h5>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>{t("forms.mortgage.results.principal", "Capital")}</span>
                                <span>{formatCHF(loanAmount)}</span>
                              </div>
                              <Progress value={(loanAmount / result.totalCost) * 100} className="h-3 bg-muted" />
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>{t("forms.mortgage.results.interest", "Intérêts")}</span>
                                <span>{formatCHF(result.totalInterest)}</span>
                              </div>
                              <Progress value={(result.totalInterest / result.totalCost) * 100} className="h-3 bg-amber-200" />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="conditions" className="space-y-4 mt-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          {t("forms.mortgage.results.contractConditions", "Conditions contractuelles")}
                        </h4>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">
                              {t("forms.mortgage.results.earlyExitPenalty", "Pénalité de sortie anticipée")}
                            </p>
                            <p className={`font-semibold ${getPenaltyColor(result.product.earlyRepaymentPenalty)}`}>
                              {getPenaltyLabel(result.product.earlyRepaymentPenalty, i18n.language)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {result.product.earlyRepaymentPenaltyDescription}
                            </p>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">
                              {t("forms.mortgage.results.earlyExitEstimate", "Estimation sortie après 5 ans")}
                            </p>
                            <p className="font-semibold">
                              {result.earlyExitPenaltyEstimate > 0 
                                ? formatCHF(result.earlyExitPenaltyEstimate)
                                : t("forms.mortgage.results.noPenalty", "Aucune pénalité")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("forms.mortgage.results.totalWithEarlyExit", "Coût total si sortie à 5 ans")}: {formatCHF(result.earlyExitTotalCost)}
                            </p>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">
                              {t("forms.mortgage.results.indirectAmortization", "Amortissement indirect 3a")}
                            </p>
                            <p className={`font-semibold ${result.product.indirectAmortization3a ? "text-green-600" : "text-muted-foreground"}`}>
                              {result.product.indirectAmortization3a 
                                ? t("common.included", "Inclus")
                                : t("common.excluded", "Non inclus")}
                            </p>
                          </div>

                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="text-sm text-muted-foreground mb-1">
                              {t("forms.mortgage.results.flexibleAmortization", "Amortissement flexible")}
                            </p>
                            <p className={`font-semibold ${result.product.flexibleAmortization ? "text-green-600" : "text-muted-foreground"}`}>
                              {result.product.flexibleAmortization 
                                ? t("common.yes", "Oui")
                                : t("common.no", "Non")}
                            </p>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">{t("forms.mortgage.results.features", "Avantages inclus")}</p>
                          <div className="flex flex-wrap gap-2">
                            {result.product.features.map((feature, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="savings" className="space-y-4 mt-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <PiggyBank className="h-4 w-4 text-primary" />
                          {t("forms.mortgage.results.fiscalOptimization", "Optimisation fiscale avec le 3ème pilier")}
                        </h4>

                        {result.product.indirectAmortization3a ? (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {t("forms.mortgage.results.potential3a", "Versements 3a possibles")}
                                </p>
                                <p className="text-xl font-bold text-green-700">
                                  {formatCHF(result.potential3aSavings)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t("forms.mortgage.results.over", "sur")} {duration} {t("forms.mortgage.years", "ans")}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  {t("forms.mortgage.results.taxSavings", "Économie d'impôts estimée")}
                                </p>
                                <p className="text-xl font-bold text-green-700">
                                  {formatCHF(result.potential3aTaxSavings)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {t("forms.mortgage.results.basedOnRate", "basé sur un taux marginal de 30%")}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-green-700 mt-3 flex items-start gap-2">
                              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              {t("forms.mortgage.results.3aExplanation", "L'amortissement indirect via le 3ème pilier vous permet de maintenir votre dette hypothécaire tout en constituant un capital et en réduisant vos impôts.")}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-muted/50 rounded-lg p-4 text-muted-foreground">
                            <p>{t("forms.mortgage.results.no3aOption", "Cette offre ne propose pas l'amortissement indirect via le 3ème pilier.")}</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => handleContactRequest(result, "call")}
                  >
                    <Phone className="h-4 w-4" />
                    {t("forms.results.callMe", "Être rappelé")}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={() => handleContactRequest(result, "email")}
                  >
                    <Mail className="h-4 w-4" />
                    {t("forms.results.byEmail", "Par email")}
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="flex-1 gap-2"
                    onClick={() => handleContactRequest(result, "call")}
                  >
                    <ArrowRight className="h-4 w-4" />
                    {t("forms.results.chooseOffer", "Choisir cette offre")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Modal */}
      {selectedOffer && (
        <ContactOfferModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          offer={{
            id: selectedOffer.product.id,
            companyName: selectedOffer.product.bankName,
            coverageType: selectedOffer.product.productName,
            monthlyPrice: selectedOffer.monthlyPayment,
            yearlyPrice: selectedOffer.yearlyPayment,
            mainFeatures: selectedOffer.product.features,
            rating: selectedOffer.product.rating,
          }}
          contactType={contactType}
        />
      )}
    </div>
  );
};

export default MortgageComparisonResults;
