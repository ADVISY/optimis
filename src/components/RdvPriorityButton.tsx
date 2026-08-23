import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import LocalizedLink from "@/components/LocalizedLink";
import { getLastLeadContact } from "@/lib/leadTracking";

/**
 * Bouton compact « Passez prioritaire » affiché à côté des boutons de la page
 * merci. Renvoie vers la page dédiée /rendez-vous. Ne s'affiche que si un lead
 * vient d'être soumis.
 */
const RdvPriorityButton = () => {
  const { t } = useTranslation();
  const contact = useMemo(() => getLastLeadContact(), []);
  if (!contact?.leadId) return null;

  return (
    <LocalizedLink to="/rendez-vous">
      <Button
        size="lg"
        variant="outline"
        className="border-primary text-primary hover:bg-primary/5 hover:text-primary"
      >
        <Home className="mr-2 h-5 w-5" />
        {t("rdvDomicile.ctaShort", "Passez prioritaire")}
      </Button>
    </LocalizedLink>
  );
};

export default RdvPriorityButton;
