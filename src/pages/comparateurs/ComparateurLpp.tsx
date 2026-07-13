import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import LppForm from "@/components/forms/LppForm";

const ComparateurLpp = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("lpp.heroTitle", "AVOIRS LPP : RÉCUPÉREZ VOTRE 2E PILIER OUBLIÉ")}
        titleMobile={t("lpp.heroTitleMobile", { defaultValue: "AVOIRS LPP OUBLIÉS" })}
      />

      <LppForm />
    </FormAppShell>
  );
};

export default ComparateurLpp;
