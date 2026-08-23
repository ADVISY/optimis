import Layout from "@/components/layout/Layout";
import RdvDomicileBlock from "@/components/RdvDomicileBlock";

/**
 * Page dédiée « Rendez-vous à domicile » (/rendez-vous). Remplace Calendly sur
 * tout le site : accessible depuis le header (visiteur → saisit ses coordonnées
 * + objet) et depuis la page merci (lead → coordonnées pré-remplies).
 */
const RendezVous = () => {
  return (
    <Layout>
      <div className="container py-12 md:py-16">
        <RdvDomicileBlock />
      </div>
    </Layout>
  );
};

export default RendezVous;
