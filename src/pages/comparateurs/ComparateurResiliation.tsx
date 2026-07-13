import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import TerminationForm from "@/components/forms/TerminationForm";

const ComparateurResiliation = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.termination.title")}
        titleMobile={t("comparators.termination.titleMobile", { defaultValue: "RÉSILIATION ASSURANCE" })}
      />

      <TerminationForm />
    </FormAppShell>
  );
};

export default ComparateurResiliation;
