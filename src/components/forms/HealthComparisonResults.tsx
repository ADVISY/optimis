import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, Check, Phone, Mail, ArrowRight, Info, ChevronDown, ChevronUp, 
  Award, ThumbsUp, Sparkles, Shield, TrendingDown, Eye
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { InsuranceOffer, getBadgeLabel } from "@/data/mockInsuranceData";
import { 
  ComplementaryOptions, 
  ComplementaryTier,
  calculateComplementaryPrice, 
  getSelectedComplementaryDetails,
  getComplementaryLabel,
  getTierLabel
} from "@/data/complementaryInsuranceData";
import { getInsurerInfo, getInsurerInitials } from "@/data/insurerLogos";
import { motion, AnimatePresence } from "framer-motion";
import ContactOfferModal from "./ContactOfferModal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HealthComparisonResultsProps {
  offers: InsuranceOffer[];
  formData: {
    canton?: string;
    postalCode?: string;
    lamalModel?: string;
    franchise?: number;
    accidentCoverage?: boolean;
    complementaryTier?: ComplementaryTier | null;
    complementary?: ComplementaryOptions;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    [key: string]: unknown;
  };
}

const HealthComparisonResults = ({
  offers,
  formData,
}: HealthComparisonResultsProps) => {
  const { t, i18n } = useTranslation();
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);
  const [showComplementary, setShowComplementary] = useState(true);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    offer: InsuranceOffer | null;
    type: "call" | "email" | "offer";
  }>({
    isOpen: false,
    offer: null,
    type: "offer",
  });

  const complementaryOptions = formData.complementary || {
    dental: false,
    hospitalization: false,
    glasses: false,
    alternativeMedicine: false,
    worldwide: false,
  };

  const complementaryTier: ComplementaryTier = formData.complementaryTier || "premium";
  const hasComplementary = Object.values(complementaryOptions).some(Boolean) && formData.complementaryTier;
  const complementaryPrice = hasComplementary ? calculateComplementaryPrice(complementaryOptions, complementaryTier) : 0;
  const selectedComplementaryDetails = hasComplementary ? getSelectedComplementaryDetails(complementaryOptions, complementaryTier) : [];

  // Sort offers: recommended first, then by badge, then by price
  const sortedOffers = [...offers].sort((a, b) => {
    if (a.badge === "recommended" && b.badge !== "recommended") return -1;
    if (b.badge === "recommended" && a.badge !== "recommended") return 1;
    if (a.badge === "bestPrice" && b.badge !== "bestPrice") return -1;
    if (b.badge === "bestPrice" && a.badge !== "bestPrice") return 1;
    if (a.badge === "bestValue" && b.badge !== "bestValue") return -1;
    if (b.badge === "bestValue" && a.badge !== "bestValue") return 1;
    return a.monthlyPrice - b.monthlyPrice;
  });

  const lowestPrice = Math.min(...offers.map(o => o.monthlyPrice));

  const handleSelectOffer = (offer: InsuranceOffer) => {
    setModalState({ isOpen: true, offer, type: "offer" });
  };

  const handleContactRequest = (offer: InsuranceOffer, type: "call" | "email") => {
    setModalState({ isOpen: true, offer, type });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const toggleExpand = (offerId: string) => {
    setExpandedOfferId(expandedOfferId === offerId ? null : offerId);
  };

  const getBenefits = (offer: InsuranceOffer): string[] => {
    const benefits: string[] = [];
    if (offer.badge === "bestPrice") benefits.push("Prime la plus attractive pour votre profil");
    if (offer.badge === "recommended") benefits.push("Recommandé selon votre situation");
    if (offer.badge === "bestValue") benefits.push("Bon rapport qualité / prix");
    if (offer.rating >= 4.3) benefits.push("Assureur très bien noté en Suisse");
    if (offer.coverageType.includes("Télémédecine")) benefits.push("Modèle économique avec télémédecine");
    if (offer.coverageType.includes("HMO")) benefits.push("Modèle économique HMO");
    if (offer.monthlyPrice <= lowestPrice * 1.05) benefits.push("L'une des offres les plus avantageuses");
    if (benefits.length < 2) benefits.push("Solution adaptée à votre franchise");
    return benefits.slice(0, 3);
  };

  const getSavings = (offer: InsuranceOffer) => {
    const maxPrice = Math.max(...offers.map(o => o.monthlyPrice));
    const monthlySaving = maxPrice - offer.monthlyPrice;
    const yearlySaving = monthlySaving * 12;
    return { monthly: monthlySaving, yearly: yearlySaving };
  };

  const getBadgeStyles = (badge: string) => {
    switch (badge) {
      case "bestPrice":
        return "bg-primary/10 text-primary border-primary/30 shadow-sm";
      case "recommended":
        return "bg-primary/15 text-primary border-primary/30 shadow-sm";
      case "bestValue":
        return "bg-secondary/80 text-secondary-foreground border-secondary shadow-sm";
      default:
        return "";
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "bestPrice":
        return <Sparkles className="h-3.5 w-3.5" />;
      case "recommended":
        return <ThumbsUp className="h-3.5 w-3.5" />;
      case "bestValue":
        return <Award className="h-3.5 w-3.5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {t("comparison.resultsTitle")}
        </h2>
        <p className="text-muted-foreground text-base">
          {t("comparison.resultsSubtitle", { count: offers.length })}
        </p>
      </div>

      {/* Summary of selected options */}
      <Card className="bg-muted/30 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">
              {t("comparison.yourSelection", "Votre sélection")}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">{t("forms.healthInsurance.lamalModel")}:</span>
              <p className="font-medium">{formData.lamalModel || "Standard"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("forms.healthInsurance.franchise")}:</span>
              <p className="font-medium">CHF {formData.franchise || 2500}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("forms.healthInsurance.accidentCoverage")}:</span>
              <p className="font-medium">{formData.accidentCoverage ? t("common.yes") : t("common.no")}</p>
            </div>
            <div>
              <span className="text-muted-foreground">{t("forms.healthInsurance.complementaryLabel", "Complémentaires")}:</span>
              <p className="font-medium">
                {hasComplementary 
                  ? getTierLabel(complementaryTier, i18n.language) 
                  : t("common.no", "Non")}
              </p>
            </div>
          </div>
          
          {hasComplementary && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                {t("comparison.selectedComplementary", "Package")} {getTierLabel(complementaryTier, i18n.language)} :
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedComplementaryDetails.map((comp) => (
                  <TooltipProvider key={comp.type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs cursor-help">
                          {getComplementaryLabel(comp.type, i18n.language)} (~CHF {comp.selectedPrice}/mois)
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{comp.descriptions[complementaryTier]}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View toggle: LAMal only vs LAMal + Complémentaires */}
      {hasComplementary && (
        <div className="flex items-center justify-center gap-1 p-1 bg-muted/50 rounded-xl max-w-md mx-auto">
          <button
            onClick={() => setShowComplementary(false)}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              !showComplementary
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
            LAMal seule
          </button>
          <button
            onClick={() => setShowComplementary(true)}
            className={cn(
              "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              showComplementary
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="h-4 w-4 inline-block mr-1.5 -mt-0.5" />
            LAMal + Complémentaires
          </button>
        </div>
      )}

      {/* Results */}
      <div className="space-y-5">
        {sortedOffers.map((offer, index) => {
          const displayComplementary = showComplementary && hasComplementary;
          const totalMonthly = offer.monthlyPrice + (displayComplementary ? complementaryPrice : 0);
          const totalYearly = totalMonthly * 12;
          const isExpanded = expandedOfferId === offer.id;
          const insurerInfo = getInsurerInfo(offer.companyName);
          const isRecommended = offer.badge === "recommended";
          const isHighlighted = isRecommended || index === 0;
          const benefits = getBenefits(offer);
          const savings = getSavings(offer);

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "overflow-hidden transition-all duration-300",
                  isRecommended 
                    ? "border-2 border-primary shadow-xl ring-2 ring-primary/10 relative" 
                    : isHighlighted
                    ? "border-2 border-primary/40 shadow-lg"
                    : "border border-border hover:border-primary/30 hover:shadow-md"
                )}
              >
                {/* Recommended ribbon */}
                {isRecommended && (
                  <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    {t("comparison.recommendedForYou", "Recommandé pour votre profil")}
                  </div>
                )}

                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* LEFT: Insurer info + coverage + benefits */}
                    <div className="p-5 md:p-6 flex-1 border-b lg:border-b-0 lg:border-r border-border/50">
                      {/* Insurer identity */}
                      <div className="flex items-start gap-4 mb-4">
                        <div 
                          className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center overflow-hidden border border-border/60 bg-white shadow-sm"
                        >
                          {insurerInfo.logo ? (
                            <img 
                              src={insurerInfo.logo} 
                              alt={`Logo ${offer.companyName}`}
                              className="w-full h-full object-contain p-1.5"
                            />
                          ) : (
                            <span 
                              className="text-lg md:text-xl font-bold"
                              style={{ color: insurerInfo.color }}
                            >
                              {getInsurerInitials(offer.companyName)}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <h3 className="font-bold text-lg md:text-xl leading-tight">{offer.companyName}</h3>
                            {offer.badge && (
                              <span className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                                getBadgeStyles(offer.badge)
                              )}>
                                {getBadgeIcon(offer.badge)}
                                {getBadgeLabel(offer.badge, i18n.language)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            {offer.coverageType}
                          </p>
                          {/* Rating */}
                          <div className="flex items-center gap-1 mt-1.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={cn(
                                  "h-4 w-4",
                                  i < Math.floor(offer.rating)
                                    ? "text-amber-400 fill-amber-400"
                                    : i < offer.rating
                                    ? "text-amber-400 fill-amber-400/50"
                                    : "text-muted-foreground/30"
                                )}
                              />
                            ))}
                            <span className="ml-1 text-sm font-semibold text-foreground">
                              {offer.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Coverage details grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>{formData.accidentCoverage ? "Avec couverture accident" : "Sans couverture accident"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span>Franchise CHF {offer.franchise || formData.franchise || 2500}</span>
                        </div>
                        {offer.mainFeatures.slice(0, 1).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2 col-span-2">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>Produit: {feature.includes("Télémédecine") ? offer.coverageType.replace("LAMal ", "") : feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Expand / collapse details */}
                      <button
                        className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                        onClick={() => toggleExpand(offer.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4" />
                            Masquer le détail
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" />
                            Voir le détail de l'offre
                          </>
                        )}
                      </button>

                      {/* "Pourquoi cette offre" section */}
                      <div className="mt-4 pt-3 border-t border-border/40">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Pourquoi cette offre
                        </p>
                        <div className="space-y-1.5">
                          {benefits.map((benefit, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                              <span className="text-foreground/80">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT: Price hierarchy + CTA */}
                    <div className={cn(
                      "p-5 md:p-6 flex flex-col justify-between min-w-[280px] lg:min-w-[310px]",
                      isRecommended ? "bg-primary/[0.03]" : "bg-muted/20"
                    )}>
                      {/* Price hierarchy */}
                      <div className="space-y-4 mb-5">
                        {/* LAMal - HERO price */}
                        <div className="text-center">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                            LAMal obligatoire
                          </p>
                          <div className="text-4xl md:text-[2.75rem] font-extrabold text-primary leading-none">
                            CHF {offer.monthlyPrice.toFixed(2)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">/ mois</p>
                        </div>

                        {/* Complémentaires - secondary */}
                        {displayComplementary && (
                          <div className="bg-background/60 rounded-lg px-4 py-2.5 border border-border/50 text-center">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Complémentaires sélectionnées
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              +CHF {complementaryPrice.toFixed(2)}
                              <span className="text-sm font-normal text-muted-foreground"> / mois</span>
                            </p>
                          </div>
                        )}

                        {/* Total - summary */}
                        {displayComplementary && (
                          <div className="border-t-2 border-dashed border-primary/20 pt-3 text-center">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              Total mensuel estimé
                            </p>
                            <p className="text-2xl font-bold text-foreground">
                              CHF {totalMonthly.toFixed(2)}
                              <span className="text-sm font-normal text-muted-foreground"> / mois</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              (Par an: CHF {totalYearly.toFixed(2)})
                            </p>
                          </div>
                        )}

                        {!displayComplementary && (
                          <p className="text-xs text-muted-foreground text-center">
                            (Par an: CHF {(offer.monthlyPrice * 12).toFixed(2)})
                          </p>
                        )}

                        {/* Savings indicator */}
                        {savings.monthly > 1 && (
                          <div className="flex items-center justify-center gap-1.5 text-primary bg-primary/10 rounded-lg py-1.5 px-3 text-sm font-medium">
                            <TrendingDown className="h-4 w-4" />
                            <span>Économie de CHF {savings.yearly.toFixed(0)} / an</span>
                          </div>
                        )}
                      </div>

                      {/* CTA section */}
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleSelectOffer(offer)}
                          className={cn(
                            "w-full gap-2 h-12 text-base font-semibold shadow-md",
                            isRecommended && "shadow-lg"
                          )}
                          size="lg"
                        >
                          {t("comparison.selectOffer")}
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                        
                        {/* Reassurance line */}
                        <p className="text-center text-xs text-muted-foreground">
                          ✓ Sans engagement · Demande gratuite · Réponse rapide
                        </p>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 text-xs"
                            onClick={() => handleContactRequest(offer, "call")}
                          >
                            <Phone className="h-3.5 w-3.5" />
                            {t("comparison.callBack")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1.5 text-xs"
                            onClick={() => handleContactRequest(offer, "email")}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {t("comparison.email")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 md:p-6 bg-muted/10 border-t">
                          <h4 className="font-semibold mb-4 text-base">
                            {t("comparison.priceDetails", "Détail du prix mensuel")}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* LAMal details */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold text-primary flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                {t("comparison.lamalSection", "Assurance de base (LAMal)")}
                              </h5>
                              <div className="text-sm space-y-1.5 pl-6">
                                <div className="flex justify-between">
                                  <span>{offer.coverageType}</span>
                                  <span className="font-medium">CHF {offer.monthlyPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>{t("forms.healthInsurance.franchise")}:</span>
                                  <span>CHF {offer.franchise || formData.franchise || 2500}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                  <span>{t("forms.healthInsurance.accidentCoverage")}:</span>
                                  <span>{formData.accidentCoverage ? t("common.included") : t("common.excluded")}</span>
                                </div>
                              </div>
                            </div>

                            {/* Complementary details */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-semibold text-primary flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                {t("comparison.complementarySection", "Assurances complémentaires (LCA)")}
                                {hasComplementary && (
                                  <span className="text-xs font-normal text-muted-foreground">
                                    - {getTierLabel(complementaryTier, i18n.language)}
                                  </span>
                                )}
                              </h5>
                              {hasComplementary ? (
                                <div className="text-sm space-y-1.5 pl-6">
                                  {selectedComplementaryDetails.map((comp) => (
                                    <div key={comp.type} className="flex justify-between">
                                      <span>{getComplementaryLabel(comp.type, i18n.language)}</span>
                                      <span className="font-medium">~CHF {comp.selectedPrice.toFixed(2)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t pt-1.5 mt-2 flex justify-between font-medium">
                                    <span>{t("comparison.subtotal", "Sous-total")}:</span>
                                    <span>CHF {complementaryPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic pl-6">
                                  {t("comparison.noComplementarySelected", "Aucune complémentaire sélectionnée")}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="mt-5 pt-4 border-t flex justify-between items-center">
                            <span className="font-semibold">{t("comparison.totalMonthly", "Total mensuel")}:</span>
                            <span className="text-2xl font-bold text-primary">
                              CHF {(offer.monthlyPrice + (hasComplementary ? complementaryPrice : 0)).toFixed(2)}
                            </span>
                          </div>

                          {/* Pedagogical explanation */}
                          <div className="mt-4 bg-primary/[0.04] rounded-lg p-4 space-y-2 text-xs text-muted-foreground">
                            <p className="font-semibold text-foreground text-sm">Comprendre votre prix</p>
                            <div className="flex items-start gap-2">
                              <Shield className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
                              <span>La <strong>LAMal</strong> est l'assurance maladie <strong>obligatoire</strong> en Suisse. Chaque résident doit y souscrire.</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Sparkles className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
                              <span>Les <strong>complémentaires</strong> sont <strong>facultatives</strong> et couvrent des prestations supplémentaires (dentaire, hospitalisation, etc.).</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Info className="h-3.5 w-3.5 mt-0.5 text-primary flex-shrink-0" />
                              <span>Le <strong>total</strong> correspond à la combinaison LAMal + complémentaires choisies.</span>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mt-3">
                            * {t("comparison.priceNote", "Les prix des complémentaires sont indicatifs et peuvent varier selon l'assureur choisi.")}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* CTA Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <h3 className="font-bold text-lg mb-2">{t("comparison.needHelp")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("comparison.expertAdvice")}
          </p>
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setModalState({ isOpen: true, offer: null, type: "call" })}
          >
            <Phone className="h-4 w-4" />
            {t("comparison.talkToExpert")}
          </Button>
        </CardContent>
      </Card>

      {/* Contact Modal */}
      <ContactOfferModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        offer={modalState.offer}
        contactType={modalState.type}
        formData={formData as Record<string, unknown>}
      />
    </div>
  );
};

export default HealthComparisonResults;
