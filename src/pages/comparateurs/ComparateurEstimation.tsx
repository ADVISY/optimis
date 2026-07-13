import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import RealEstateForm from "@/components/forms/RealEstateForm";

const ComparateurEstimation = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("realEstate.heroTitle", "ESTIMATION IMMOBILIÈRE GRATUITE EN SUISSE")}
        titleMobile={t("realEstate.heroTitleMobile", { defaultValue: "ESTIMATION IMMO 2026" })}
      />

      <RealEstateForm />
    </FormAppShell>
  );
};

export default ComparateurEstimation;
