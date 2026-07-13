import { useTranslation } from "react-i18next";
import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import Pillar3Form from "@/components/forms/Pillar3Form";

const ComparateurPilier3 = () => {
  const { t } = useTranslation();

  return (
    <FormAppShell>
      <FormHero
        title={t("comparators.pillar3.heroTitle", "COMPARATEUR 3ÈME PILIER 2026 : TROUVEZ LA MEILLEURE OFFRE")}
        titleMobile={t("comparators.pillar3.heroTitleMobile", { defaultValue: "3ᵉ PILIER 2026" })}
      />

      <Pillar3Form />
    </FormAppShell>
  );
};

export default ComparateurPilier3;
