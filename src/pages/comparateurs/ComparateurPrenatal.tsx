// App-funnel landing (no site chrome): logo + form + mascotte only.
// SEO/educational content lives on the marketing page AssurancePrenatale
// (route: assurance-prenatale). This page stays a pure single-screen form.
import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import PrenatalInsuranceForm from "@/components/forms/PrenatalInsuranceForm";

const ComparateurPrenatal = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.prenatal.heroTitle", "ASSURANCE PRÉNATALE : PROTÉGEZ VOTRE BÉBÉ AVANT LA NAISSANCE")}
        titleMobile={t("comparators.prenatal.heroTitleMobile", { defaultValue: "ASSURANCE PRÉNATALE" })}
      />

      <PrenatalInsuranceForm />
    </FormAppShell>
  );
};

export default ComparateurPrenatal;
