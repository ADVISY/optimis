import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Star,
  TrendingUp,
  Shield,
  PiggyBank,
  Phone,
  Mail,
  ArrowRight,
  Award,
  ThumbsUp,
  Sparkles,
  Info,
  ChevronDown,
  Wallet,
  HeartPulse,
  Skull,
  Calendar,
  Percent,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getInsurerInfo, getInsurerInitials } from "@/data/insurerLogos";
import {
  Pillar3aProjection,
  formatCHF,
  formatPercent,
  getProductTypeLabel,
  getRiskLevelLabel,
} from "@/utils/pillar3aCalculations";

interface Pillar3ComparisonResultsProps {
  projections: Pillar3aProjection[];
  onSelectOffer: (projection: Pillar3aProjection) => void;
  onContactRequest: (projection: Pillar3aProjection, type: "call" | "email") => void;
}

const Pillar3ComparisonResults = ({
  projections,
  onSelectOffer,
  onContactRequest,
}: Pillar3ComparisonResultsProps) => {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getBadgeInfo = (badge: string) => {
    switch (badge) {
      case "recommended":
        return {
          label: "Recommandé pour vous",
          icon: <ThumbsUp className="h-3 w-3" />,
          variant: "default" as const,
        };
      case "bestReturn":
        return {
          label: "Meilleur rendement",
          icon: <TrendingUp className="h-3 w-3" />,
          variant: "secondary" as const,
        };
      case "lowestFees":
        return {
          label: "Frais les plus bas",
          icon: <Sparkles className="h-3 w-3" />,
          variant: "outline" as const,
        };
      case "bestProtection":
        return {
          label: "Meilleure protection",
          icon: <Shield className="h-3 w-3" />,
          variant: "outline" as const,
        };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Votre simulation 3ᵉ pilier personnalisée
        </h2>
        <p className="text-muted-foreground">
          {projections.length} solutions adaptées à votre profil
        </p>
      </div>

      {/* Summary Card */}
      {projections.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Durée d'épargne</div>
                <div className="text-2xl font-bold text-primary">
                  {projections[0].retirement.yearsToRetirement} ans
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Versement mensuel</div>
                <div className="text-2xl font-bold text-primary">
                  {formatCHF(projections[0].retirement.monthlyContribution)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Économie fiscale/an</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCHF(projections[0].taxSavings.annualSaving)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Économie fiscale totale</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCHF(projections[0].taxSavings.cumulativeSaving)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <div className="flex items-start gap-2 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          Ces projections sont des estimations basées sur les rendements historiques et les caractéristiques 
          des produits. Les performances passées ne préjugent pas des performances futures. 
          L'économie d'impôt dépend de votre situation fiscale personnelle.
        </p>
      </div>

      {/* Results List */}
      <div className="space-y-4">
        {projections.map((projection, index) => {
          const insurerInfo = getInsurerInfo(projection.product.companyName);
          const isRecommended = projection.badges.includes("recommended");
          const isExpanded = expandedId === projection.product.id;

          return (
            <motion.div
              key={projection.product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "overflow-hidden border-2 transition-all duration-300",
                  isRecommended
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "hover:border-primary/50"
                )}
              >
                {/* Recommended Banner */}
                {isRecommended && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    Recommandé pour votre profil
                  </div>
                )}

                <CardContent className="p-0">
                  {/* Main Content */}
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-start gap-4 mb-6">
                      {/* Logo */}
                      <div
                        className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border-2 border-muted"
                        style={{
                          backgroundColor: insurerInfo.logo ? "white" : `${insurerInfo.color}15`,
                        }}
                      >
                        {insurerInfo.logo ? (
                          <img
                            src={insurerInfo.logo}
                            alt={`Logo ${projection.product.companyName}`}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xl font-bold" style={{ color: insurerInfo.color }}>
                            {getInsurerInitials(projection.product.companyName)}
                          </span>
                        )}
                      </div>

                      {/* Company & Product Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <h3 className="font-bold text-xl">{projection.product.companyName}</h3>
                            <p className="text-muted-foreground">{projection.product.productName}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {projection.badges.map((badge) => {
                              const info = getBadgeInfo(badge);
                              if (!info) return null;
                              return (
                                <Badge key={badge} variant={info.variant} className="gap-1 text-xs">
                                  {info.icon}
                                  {info.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>

                        {/* Rating & Product Type */}
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(projection.product.rating)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                            <span className="ml-1 font-medium">
                              {projection.product.rating.toFixed(1)}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {getProductTypeLabel(projection.productInfo.type)}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getRiskLevelLabel(projection.productInfo.riskLevel)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {/* Retirement Capital */}
                      <div className="bg-primary/5 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <PiggyBank className="h-4 w-4" />
                          Capital retraite
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-primary">
                          {formatCHF(projection.retirement.estimatedCapital)}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          +{formatCHF(projection.retirement.estimatedGain)} de gains
                        </div>
                      </div>

                      {/* Total Contributions */}
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Wallet className="h-4 w-4" />
                          Total versé
                        </div>
                        <div className="text-xl md:text-2xl font-bold">
                          {formatCHF(projection.retirement.totalContributions)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          sur {projection.retirement.yearsToRetirement} ans
                        </div>
                      </div>

                      {/* Estimated Return */}
                      <div className="bg-muted/50 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <TrendingUp className="h-4 w-4" />
                          Rendement estimé
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-blue-600">
                          {formatPercent(projection.productInfo.estimatedReturn)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Frais: {formatPercent(projection.productInfo.totalFees)}/an
                        </div>
                      </div>

                      {/* Tax Savings */}
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                          <Percent className="h-4 w-4" />
                          Économie fiscale
                        </div>
                        <div className="text-xl md:text-2xl font-bold text-green-600">
                          {formatCHF(projection.taxSavings.cumulativeSaving)}
                        </div>
                        <div className="text-xs text-green-600">
                          {formatCHF(projection.taxSavings.annualSaving)}/an
                        </div>
                      </div>
                    </div>

                    {/* Protection Benefits (if available) */}
                    {(projection.protection.disabilityPensionAccident > 0 ||
                      projection.protection.deathCapital > 0) && (
                      <div className="bg-muted/30 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          Protection incluse
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          {projection.protection.disabilityPensionAccident > 0 && (
                            <div className="flex items-start gap-2">
                              <HeartPulse className="h-4 w-4 text-orange-500 mt-0.5" />
                              <div>
                                <div className="font-medium">Invalidité accident</div>
                                <div className="text-muted-foreground">
                                  {formatCHF(projection.protection.disabilityPensionAccident)}/an
                                </div>
                              </div>
                            </div>
                          )}
                          {projection.protection.disabilityPensionIllness > 0 && (
                            <div className="flex items-start gap-2">
                              <HeartPulse className="h-4 w-4 text-red-500 mt-0.5" />
                              <div>
                                <div className="font-medium">Invalidité maladie</div>
                                <div className="text-muted-foreground">
                                  {formatCHF(projection.protection.disabilityPensionIllness)}/an
                                </div>
                              </div>
                            </div>
                          )}
                          {projection.protection.deathCapital > 0 && (
                            <div className="flex items-start gap-2">
                              <Skull className="h-4 w-4 text-gray-500 mt-0.5" />
                              <div>
                                <div className="font-medium">Capital décès</div>
                                <div className="text-muted-foreground">
                                  {formatCHF(projection.protection.deathCapital)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Product Highlights */}
                    <div className="mb-6">
                      <ul className="flex flex-wrap gap-2">
                        {projection.product.highlights.map((highlight, i) => (
                          <li
                            key={i}
                            className="inline-flex items-center gap-1.5 text-sm bg-muted/50 px-3 py-1.5 rounded-full"
                          >
                            <Award className="h-3.5 w-3.5 text-primary" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => onSelectOffer(projection)}
                        className="flex-1 gap-2"
                        size="lg"
                      >
                        Demander une offre détaillée
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-1"
                        onClick={() => onContactRequest(projection, "call")}
                      >
                        <Phone className="h-4 w-4" />
                        Être rappelé
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="gap-1"
                        onClick={() => onContactRequest(projection, "email")}
                      >
                        <Mail className="h-4 w-4" />
                        Par email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-bold text-lg mb-2">Besoin d'un conseil personnalisé ?</h3>
          <p className="text-muted-foreground mb-4">
            Nos conseillers experts en prévoyance sont à votre disposition pour analyser votre situation.
          </p>
          <Button variant="outline" className="gap-2">
            <Phone className="h-4 w-4" />
            Parler à un expert
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pillar3ComparisonResults;
