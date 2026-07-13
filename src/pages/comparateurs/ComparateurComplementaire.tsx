// App-funnel landing (no site chrome): logo + form + mascotte only.
// SEO/educational content lives on the marketing page AssuranceComplementaire
// (route: assurance-complementaire). This page stays a pure single-screen form.
import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import ComplementaryInsuranceForm from "@/components/forms/ComplementaryInsuranceForm";

const ComparateurComplementaire = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.complementary.heroTitle", "ASSURANCE COMPLÉMENTAIRE : COMPAREZ ET ÉCONOMISEZ JUSQU'À 40%")}
        titleMobile={t("comparators.complementary.heroTitleMobile", { defaultValue: "COMPLÉMENTAIRE 2026" })}
      />

      <ComplementaryInsuranceForm />
    </FormAppShell>
  );
};

export default ComparateurComplementaire;
