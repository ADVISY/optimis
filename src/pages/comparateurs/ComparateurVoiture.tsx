import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import CarInsuranceForm from "@/components/forms/CarInsuranceForm";

const ComparateurVoiture = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.car.title")}
        titleMobile={t("comparators.car.titleMobile", { defaultValue: "ASSURANCE AUTO 2026" })}
      />

      <CarInsuranceForm />
    </FormAppShell>
  );
};

export default ComparateurVoiture;
