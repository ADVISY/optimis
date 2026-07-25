import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import PremierAchatForm from "@/components/forms/PremierAchatForm";

const ComparateurPremierAchat = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.premierAchat.heroTitle", { defaultValue: "Devenez propriétaire : votre plan d'action" })}
        titleMobile={t("comparators.premierAchat.heroTitleMobile", { defaultValue: "DEVENIR PROPRIÉTAIRE" })}
      />

      <PremierAchatForm />
    </FormAppShell>
  );
};

export default ComparateurPremierAchat;
