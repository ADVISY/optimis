import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import MortgageForm from "@/components/forms/MortgageForm";

const ComparateurHypotheque = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.mortgage.heroTitle")}
        titleMobile={t("comparators.mortgage.heroTitleMobile", { defaultValue: "HYPOTHÈQUE 2026" })}
      />

      <MortgageForm />
    </FormAppShell>
  );
};

export default ComparateurHypotheque;
