import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import ProfessionalInsuranceForm from "@/components/forms/ProfessionalInsuranceForm";

const ComparateurProfessionnel = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.professional.title")}
        titleMobile={t("comparators.professional.titleMobile", { defaultValue: "ASSURANCE PME 2026" })}
      />

      <ProfessionalInsuranceForm />
    </FormAppShell>
  );
};

export default ComparateurProfessionnel;
