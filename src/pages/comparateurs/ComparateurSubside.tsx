import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import SubsidyForm from "@/components/forms/SubsidyForm";

const ComparateurSubside = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.subsidy.heroTitle", "DEMANDE EN LIGNE SUBSIDE 2026 : VÉRIFIEZ VOTRE DROIT AUX AIDES")}
        titleMobile={t("comparators.subsidy.heroTitleMobile", { defaultValue: "SUBSIDE 2026" })}
      />

      <SubsidyForm />
    </FormAppShell>
  );
};

export default ComparateurSubside;
