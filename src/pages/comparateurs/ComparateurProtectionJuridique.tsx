import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import LegalProtectionForm from "@/components/forms/LegalProtectionForm";

const ComparateurProtectionJuridique = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.legalProtection.title")}
        titleMobile={t("comparators.legalProtection.titleMobile", { defaultValue: "PROTECTION JURIDIQUE" })}
      />

      <LegalProtectionForm />
    </FormAppShell>
  );
};

export default ComparateurProtectionJuridique;
