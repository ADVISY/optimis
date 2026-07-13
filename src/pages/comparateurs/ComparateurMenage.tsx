import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import HouseholdInsuranceForm from "@/components/forms/HouseholdInsuranceForm";

const ComparateurMenage = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.household.title")}
        titleMobile={t("comparators.household.titleMobile", { defaultValue: "ASSURANCE MÉNAGE 2026" })}
      />

      <HouseholdInsuranceForm />
    </FormAppShell>
  );
};

export default ComparateurMenage;
