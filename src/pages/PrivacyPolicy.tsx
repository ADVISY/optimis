import Layout from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Politique de confidentialité</h1>
        
        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Politique de confidentialité</h2>
            <div className="text-muted-foreground space-y-4">
              <p>OptimisLink Sàrl est le propriétaire du site web et agit en tant que responsable du traitement des données personnelles.</p>
              <p>Nous avons établi cette politique de confidentialité afin de définir notre approche concernant le traitement des informations collectées via notre site web. Il est essentiel que vous la consultiez avant d'utiliser nos services en ligne.</p>
              <p>La protection de vos données personnelles est une priorité absolue pour nous, et nous nous engageons à garantir leur confidentialité et leur sécurité.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Les informations personnelles que nous collectons :</h2>
            <p className="text-muted-foreground">Lorsque vous visitez notre site, certaines informations concernant votre appareil sont automatiquement collectées, telles que votre navigateur web, votre adresse IP, votre fuseau horaire et les cookies installés sur votre appareil. De plus, nous enregistrons des informations sur les pages ou produits que vous consultez, les sites web ou termes de recherche qui vous ont dirigé vers notre site, ainsi que vos interactions avec notre site. Ces informations collectées automatiquement sont désignées sous le terme "<strong>informations sur les appareils</strong>". En outre, nous pouvons collecter des données personnelles que vous choisissez de nous fournir (telles que votre nom, prénom, adresse, informations de paiement, etc.) lors de votre inscription ou de l'utilisation de certaines fonctionnalités du site.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Dans quel but traitons-nous vos données ?</h2>
            <div className="text-muted-foreground space-y-4">
              <p>Nous traitons uniquement les données personnelles nécessaires au bon fonctionnement du site et à la sécurité des données de nos utilisateurs. Les informations collectées automatiquement sont utilisées pour détecter les abus potentiels et établir des statistiques d'utilisation du site, sans toutefois permettre l'identification individuelle des utilisateurs.</p>
              <p>Vous pouvez visiter notre site sans révéler votre identité ni fournir de données personnelles. Cependant, si vous souhaitez utiliser certaines fonctionnalités ou recevoir notre newsletter, vous devrez nous fournir des données personnelles. Si vous choisissez de ne pas les fournir, certaines fonctionnalités du site pourraient ne pas être accessibles.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Vos droits</h2>
            <p className="text-muted-foreground">Si vous êtes un résident européen, vous disposez de certains droits concernant vos données personnelles, tels que le droit d'accès, de rectification, de suppression, etc. Pour exercer ces droits, veuillez nous contacter via les coordonnées fournies ci-dessous.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Coordonnées</h2>
            <p className="text-muted-foreground">Pour toute question relative à cette politique de confidentialité ou à vos droits en matière de données personnelles, n'hésitez pas à nous contacter par email à l'adresse contact@le-comparateur-optimis.ch.</p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
