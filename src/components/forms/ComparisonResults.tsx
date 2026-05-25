import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Check, Phone, Mail, ArrowRight, Award, ThumbsUp, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { InsuranceOffer, getBadgeLabel } from "@/data/mockInsuranceData";
import { getInsurerInfo, getInsurerInitials } from "@/data/insurerLogos";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ComparisonResultsProps {
  offers: InsuranceOffer[];
  onSelectOffer: (offer: InsuranceOffer) => void;
  onContactRequest: (offer: InsuranceOffer, type: "call" | "email") => void;
}

const ComparisonResults = ({
  offers,
  onSelectOffer,
  onContactRequest,
}: ComparisonResultsProps) => {
  const { t, i18n } = useTranslation();

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
    if (a.badge === "recommended" && b.badge !== "recommended") return -1;
    if (b.badge === "recommended" && a.badge !== "recommended") return 1;
    if (a.badge === "bestPrice" && b.badge !== "bestPrice") return -1;
    if (b.badge === "bestPrice" && a.badge !== "bestPrice") return 1;
    if (a.badge === "bestValue" && b.badge !== "bestValue") return -1;
    if (b.badge === "bestValue" && a.badge !== "bestValue") return 1;
    return a.monthlyPrice - b.monthlyPrice;
  });

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

      <div className="space-y-4">
        {sortedOffers.map((offer, index) => {
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
                  <div className="flex flex-col md:flex-row">
                    {/* Company Info with Logo */}
                    <div className="p-6 flex-1 border-b md:border-b-0 md:border-r">
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
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-4">
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

                      {/* Features */}
                      <ul className="space-y-2">
                        {offer.mainFeatures.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price & Actions */}
                    <div className="p-6 bg-muted/30 flex flex-col justify-between min-w-[250px]">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-primary">
                          CHF {offer.monthlyPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {t("comparison.perMonth")}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ({t("comparison.perYear")}: CHF {offer.yearlyPrice.toFixed(2)})
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => onSelectOffer(offer)}
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
                            onClick={() => onContactRequest(offer, "call")}
                          >
                            <Phone className="h-3 w-3" />
                            {t("comparison.callBack")}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-1"
                            onClick={() => onContactRequest(offer, "email")}
                          >
                            <Mail className="h-3 w-3" />
                            {t("comparison.email")}
                          </Button>
                        </div>
                      </div>
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
          <h3 className="font-bold text-lg mb-2">{t("comparison.needHelp")}</h3>
          <p className="text-muted-foreground mb-4">
            {t("comparison.expertAdvice")}
          </p>
          <Button variant="outline" className="gap-2">
            <Phone className="h-4 w-4" />
            {t("comparison.talkToExpert")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComparisonResults;
