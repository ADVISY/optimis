import FormAppShell from "@/components/layout/FormAppShell";
import FormHero from "@/components/forms/FormHero";
import HealthInsuranceForm from "@/components/forms/HealthInsuranceForm";
import gmLogo from "@/assets/insurers/groupe-mutuel-officiel.svg";

// ----------------------------------------------------------------------------
// GroupeMutuel — landing de campagne dédiée « intermédiaire lié à Groupe Mutuel ».
// Réutilise le formulaire santé existant (LAMal + complémentaire), mais :
//   • funnel ISOLÉ : aucun lien vers le comparateur, aucun menu multi-assureurs.
//   • aucun prix affiché (le formulaire santé ne montre déjà plus de primes).
//   • pied de page : statut « intermédiaire lié à Groupe Mutuel » + logo GM.
// Page de campagne payante → noindex (cf. route dans App.tsx).
// ----------------------------------------------------------------------------

const GroupeMutuel = () => {
  return (
    <FormAppShell
      isolated
      tiedPartner={{
        label: "Optimis · Intermédiaire d'assurance lié à Groupe Mutuel",
        partnerName: "Groupe Mutuel",
        branch: "Maladie",
        logoSrc: gmLogo,
      }}
    >
      <FormHero
        title="ASSURANCE MALADIE & COMPLÉMENTAIRE 2027"
        titleMobile="ASSURANCE MALADIE 2027"
      />

      <HealthInsuranceForm tied />
    </FormAppShell>
  );
};

export default GroupeMutuel;
