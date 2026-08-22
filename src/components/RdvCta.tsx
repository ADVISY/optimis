import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Home, Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LocalizedLink from "@/components/LocalizedLink";
import { getLastLeadContact } from "@/lib/leadTracking";

/**
 * Encart d'appel à l'action affiché sur la page merci : présente l'offre de RDV
 * à domicile (priorité + gratuit) et renvoie vers la page dédiée `/rendez-vous`
 * où se trouve le tunnel de réservation. La page merci reste ainsi distincte de
 * la page RDV.
 */
const RdvCta = () => {
  const { t } = useTranslation();
  const contact = useMemo(() => getLastLeadContact(), []);

  // Pas de lead fraîchement soumis → on n'affiche pas l'encart.
  if (!contact?.leadId) return null;

  return (
    <div className="max-w-2xl mx-auto mt-12 text-left">
      <Card className="border-primary/30 shadow-lg overflow-hidden">
        <CardContent className="pt-6 pb-6">
          <Badge className="mb-3" variant="secondary">
            {t("rdvDomicile.badge")}
          </Badge>
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-2 shrink-0">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold leading-tight">{t("rdvDomicile.title")}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{t("rdvDomicile.subtitle")}</p>
              <ul className="mt-3 space-y-1.5">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex items-center gap-2 text-sm font-medium">
                    <Check className="h-4 w-4 text-primary shrink-0" />
                    {t(`rdvDomicile.benefit${n}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <LocalizedLink to="/rendez-vous">
            <Button size="lg" className="w-full mt-6 text-base">
              {t("rdvDomicile.ctaButton")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </LocalizedLink>
        </CardContent>
      </Card>
    </div>
  );
};

export default RdvCta;
