import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import PartnerForm from "@/components/forms/PartnerForm";

// ----------------------------------------------------------------------------
// Partenaires — LP d'acquisition courtiers (tunnel), bâtie sur le MÊME template
// que les landings du comparateur (ex. ComparateurSante) : FormAppShell +
// FormHero + le formulaire. Pas de méga-menu, scène de marque plein écran,
// formulaire partenaire (budget + ROI x6, secteur, force de vente, contact +
// vérification SMS). L'argument de confiance "4 ans d'expertise" est porté par
// l'eyebrow du shell.
// ----------------------------------------------------------------------------
const Partenaires = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell eyebrow={t("partner.funnelEyebrow", "4 ans d'expertise assurance en Suisse")}>
      <FormHero
        title={t("partner.funnelTitle", "DES LEADS ASSURANCE EXCLUSIFS, PRÊTS À SIGNER")}
        titleMobile={t("partner.funnelTitleMobile", "LEADS COURTIERS 2026")}
      />

      <PartnerForm />
    </FormAppShell>
  );
};

export default Partenaires;
