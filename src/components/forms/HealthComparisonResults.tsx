import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, Phone, Mail, ArrowRight, Info, ChevronDown, ChevronUp, Award, ThumbsUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InsuranceOffer, getBadgeLabel } from "@/data/mockInsuranceData";
import { 
  ComplementaryOptions, 
  calculateComplementaryPrice, 
  getSelectedComplementaryDetails,
  getComplementaryLabel 
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

  const hasComplementary = Object.values(complementaryOptions).some(Boolean);
  const complementaryPrice = calculateComplementaryPrice(complementaryOptions);
  const selectedComplementaryDetails = getSelectedComplementaryDetails(complementaryOptions);

  const getBadgeVariant = (badge: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (badge) {
      case "bestPrice":
        return "default";
      case "recommended":
        return "secondary";
      case "bestValue":
        return "outline";
      default:
        return "default";
    }
  };

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case "bestPrice":
        return <Sparkles className="h-3 w-3" />;
      case "recommended":
        return <ThumbsUp className="h-3 w-3" />;
      case "bestValue":
        return <Award className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Sort offers: recommended first, then by badge, then by price
  const sortedOffers = [...offers].sort((a, b) => {
    // Prioritize recommended
    if (a.badge === "recommended" && b.badge !== "recommended") return -1;
    if (b.badge === "recommended" && a.badge !== "recommended") return 1;
    
    // Then best price
    if (a.badge === "bestPrice" && b.badge !== "bestPrice") return -1;
    if (b.badge === "bestPrice" && a.badge !== "bestPrice") return 1;
    
    // Then best value
    if (a.badge === "bestValue" && b.badge !== "bestValue") return -1;
    if (b.badge === "bestValue" && a.badge !== "bestValue") return 1;
    
    // Finally by price
    return a.monthlyPrice - b.monthlyPrice;
  });

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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          {t("comparison.resultsTitle")}
        </h2>
        <p className="text-muted-foreground">
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
              <p className="font-medium">{hasComplementary ? selectedComplementaryDetails.length : 0} {t("comparison.options", "option(s)")}</p>
            </div>
          </div>
          
          {hasComplementary && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">{t("comparison.selectedComplementary", "Complémentaires sélectionnées")}:</p>
              <div className="flex flex-wrap gap-2">
                {selectedComplementaryDetails.map((comp) => (
                  <TooltipProvider key={comp.type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs cursor-help">
                          {getComplementaryLabel(comp.type, i18n.language)} (~CHF {comp.averagePrice}/mois)
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{comp.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sortedOffers.map((offer, index) => {
          const totalMonthly = offer.monthlyPrice + (hasComplementary ? complementaryPrice : 0);
          const totalYearly = totalMonthly * 12;
          const isExpanded = expandedOfferId === offer.id;
          const insurerInfo = getInsurerInfo(offer.companyName);
          const isHighlighted = offer.badge === "recommended" || index === 0;

          return (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "overflow-hidden border-2 transition-all duration-300",
                  isHighlighted 
                    ? "border-primary shadow-lg ring-2 ring-primary/20" 
                    : "hover:border-primary/50"
                )}
              >
                {/* Highlighted ribbon for recommended */}
                {offer.badge === "recommended" && (
                  <div className="bg-primary text-primary-foreground text-center py-1.5 text-sm font-semibold flex items-center justify-center gap-2">
                    <ThumbsUp className="h-4 w-4" />
                    {t("comparison.recommendedForYou", "Recommandé pour votre profil")}
                  </div>
                )}

                <CardContent className="p-0">
                  <div className="flex flex-col lg:flex-row">
                    {/* Company Info with Logo */}
                    <div className="p-6 flex-1 border-b lg:border-b-0 lg:border-r">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Logo or Initials */}
                        <div 
                          className="flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden border-2 border-muted"
                          style={{ 
                            backgroundColor: insurerInfo.logo ? 'white' : `${insurerInfo.color}15`
                          }}
                        >
                          {insurerInfo.logo ? (
                            <img 
                              src={insurerInfo.logo} 
                              alt={`Logo ${offer.companyName}`}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <span 
                              className="text-xl font-bold"
                              style={{ color: insurerInfo.color }}
                            >
                              {getInsurerInitials(offer.companyName)}
                            </span>
                          )}
                        </div>

                        {/* Company Name & Coverage */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-bold text-xl">{offer.companyName}</h3>
                            {offer.badge && (
                              <Badge 
                                variant={getBadgeVariant(offer.badge)} 
                                className="gap-1 text-xs font-semibold"
                              >
                                {getBadgeIcon(offer.badge)}
                                {getBadgeLabel(offer.badge, i18n.language)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {offer.coverageType}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(offer.rating)
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-sm font-medium">
                              {offer.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Features */}
                      <ul className="space-y-2">
                        {offer.mainFeatures.slice(0, 3).map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Expand button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-xs text-muted-foreground hover:text-foreground gap-1"
                        onClick={() => toggleExpand(offer.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3" />
                            {t("comparison.showLess", "Voir moins")}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3" />
                            {t("comparison.showDetails", "Voir le détail")}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Price & Actions */}
                    <div className="p-6 bg-muted/30 flex flex-col justify-between min-w-[280px]">
                      {/* Price breakdown */}
                      <div className="space-y-3 mb-4">
                        {/* LAMal price */}
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{t("comparison.lamalPrice", "LAMal (base)")}:</span>
                          <span className="font-medium">CHF {offer.monthlyPrice.toFixed(2)}</span>
                        </div>

                        {/* Complementary price if applicable */}
                        {hasComplementary && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">{t("comparison.complementaryPrice", "Complémentaires")}:</span>
                            <span className="font-medium text-secondary-foreground">+CHF {complementaryPrice.toFixed(2)}</span>
                          </div>
                        )}

                        {/* Divider */}
                        <div className="border-t border-border pt-2">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary">
                              CHF {totalMonthly.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("comparison.perMonth")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              ({t("comparison.perYear")}: CHF {totalYearly.toFixed(2)})
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => handleSelectOffer(offer)}
                          className="w-full gap-2"
                        >
                          {t("comparison.selectOffer")}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => handleContactRequest(offer, "call")}
                          >
                            <Phone className="h-3 w-3" />
                            {t("comparison.callBack")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => handleContactRequest(offer, "email")}
                          >
                            <Mail className="h-3 w-3" />
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
                        <div className="p-6 bg-muted/20 border-t">
                          <h4 className="font-semibold mb-3">
                            {t("comparison.priceDetails", "Détail du prix mensuel")}
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {/* LAMal details */}
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-primary">
                                {t("comparison.lamalSection", "Assurance de base (LAMal)")}
                              </h5>
                              <div className="text-sm space-y-1">
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
                              <h5 className="text-sm font-medium text-primary">
                                {t("comparison.complementarySection", "Assurances complémentaires (LCA)")}
                              </h5>
                              {hasComplementary ? (
                                <div className="text-sm space-y-1">
                                  {selectedComplementaryDetails.map((comp) => (
                                    <div key={comp.type} className="flex justify-between">
                                      <span>{getComplementaryLabel(comp.type, i18n.language)}</span>
                                      <span className="font-medium">~CHF {comp.averagePrice.toFixed(2)}</span>
                                    </div>
                                  ))}
                                  <div className="border-t pt-1 mt-2 flex justify-between font-medium">
                                    <span>{t("comparison.subtotal", "Sous-total")}:</span>
                                    <span>CHF {complementaryPrice.toFixed(2)}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">
                                  {t("comparison.noComplementarySelected", "Aucune complémentaire sélectionnée")}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Total */}
                          <div className="mt-4 pt-4 border-t flex justify-between items-center">
                            <span className="font-semibold">{t("comparison.totalMonthly", "Total mensuel")}:</span>
                            <span className="text-xl font-bold text-primary">CHF {totalMonthly.toFixed(2)}</span>
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
