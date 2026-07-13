import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import HealthInsuranceForm from "@/components/forms/HealthInsuranceForm";

const ComparateurSante = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.health.heroTitle", "COMPARATEUR 2026 : L'ASSURANCE MALADIE LA MOINS CHÈRE")}
        titleMobile={t("comparators.health.heroTitleMobile", { defaultValue: "COMPARATEUR SANTÉ 2026" })}
      />

      <HealthInsuranceForm />
    </FormAppShell>
  );
};

export default ComparateurSante;
