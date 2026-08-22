import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import LocalizedLink from "@/components/LocalizedLink";
import RdvDomicileBlock from "@/components/RdvDomicileBlock";
import { getLastLeadContact } from "@/lib/leadTracking";

/**
 * Page dédiée « Rendez-vous à domicile » (/rendez-vous). Distincte de la page
 * merci : on y arrive via le bouton « Réserver mon RDV prioritaire ». Contient
 * le tunnel de réservation (RdvDomicileBlock). Si aucun lead n'a été soumis
 * (accès direct), on affiche un message + retour accueil.
 */
const RendezVous = () => {
  const { t } = useTranslation();
  const contact = useMemo(() => getLastLeadContact(), []);

  return (
    <Layout>
      <div className="container py-16">
        {contact?.leadId ? (
          <RdvDomicileBlock />
        ) : (
          <div className="max-w-2xl mx-auto text-center py-20">
            <h1 className="text-2xl font-bold mb-4">
              {t("rdvDomicile.noLeadTitle", "Aucune demande en cours")}
            </h1>
            <p className="text-muted-foreground mb-8">
              {t(
                "rdvDomicile.noLeadText",
                "Commencez par comparer et envoyer une demande — vous pourrez ensuite réserver un rendez-vous à domicile.",
              )}
            </p>
            <LocalizedLink to="/">
              <Button size="lg">{t("thankYou.backHome")}</Button>
            </LocalizedLink>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RendezVous;
