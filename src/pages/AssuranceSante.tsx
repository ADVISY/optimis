import { Link } from "react-router-dom";
import { Heart, Car, Scale, Home, Shield, Users, Clock, ThumbsUp } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import llamaMascot from "@/assets/llama-mascot.png";

const quickLinks = [
  { label: "Assurance Voiture", href: "/assurance-voiture", icon: Car },
  { label: "Assurance Santé", href: "/assurance-sante", icon: Heart },
  { label: "Protection Juridique", href: "/protection-juridique", icon: Scale },
  { label: "Assurance Ménage", href: "/assurance-menage", icon: Home },
];

const stats = [
  { label: "Recommandé", value: "95%", description: "Par nos utilisateurs" },
  { label: "Rejoignez", value: "+10,000", description: "utilisateurs" },
  { label: "Sans engagement", value: "100%", description: "gratuit" },
];

const tableOfContents = [
  "Tout sur l'assurance maladie",
  "Assurance maladie en Suisse : ce qu'il faut savoir",
  "Comment fonctionne l'assurance maladie en Suisse ?",
  "Combien ça coûte ?",
  "Comment obtenir l'assurance maladie obligatoire ?",
  "Souscrire une assurance maladie complémentaire",
  "Tout ce qu'il faut savoir sur la Loi sur le Contrat d'Assurance (LCA)",
  "LAMal ou CMU ? Comment choisir?",
];

const partners = [
  { name: "Generali", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/general-1.svg" },
  { name: "Helsana", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/helsana-logo.svg" },
  { name: "Groupe Mutuel", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/logo-groupe-mutuel.svg" },
  { name: "SWICA", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/SWICA_Logo_Mobile.svg" },
  { name: "Allianz", logo: "https://le-comparateur-optimis.ch/wp-content/uploads/2024/06/allianz-logo.svg" },
];

const AssuranceSante = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-optimis py-16 md:py-24">
        <div className="container">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground">
                <Link to="/" className="hover:text-primary">Accueil</Link> / Assurance santé
              </p>
              <h1 className="text-4xl font-bold leading-tight text-foreground md:text-5xl">
                Assurance Santé
              </h1>
              <h2 className="text-xl text-muted-foreground">
                Protégez-vous et vos proches grâce à une assurance santé. 
                Trouvez le plan parfait pour vos besoins.
              </h2>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Heart className="h-5 w-5" />
                  Comparer les offres
                </Button>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <img
                src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/happy-man-doing-winning-gesture-1.png"
                alt="Homme heureux"
                className="h-64 w-auto md:h-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-background border-b">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-4">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-muted hover:bg-primary/10 transition-colors font-medium"
              >
                <link.icon className="h-5 w-5 text-primary" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary/5">
        <div className="container">
          <h3 className="text-center text-lg font-semibold text-foreground mb-8">
            BÉNÉFICIEZ D'UNE COUVERTURE D'ASSURANCE MALADIE COMPLÈTE POUR VOTRE TRANQUILLITÉ D'ESPRIT
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="p-6">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/4pYQxql9Ghw"
                title="PRÉSENTATION DE OPTIMIS"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents & Content */}
      <section className="py-16">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Sidebar - Table of Contents */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Temps de lecture</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-6">5 min</p>
                  <nav className="space-y-2">
                    {tableOfContents.map((item, index) => (
                      <a
                        key={index}
                        href={`#section-${index}`}
                        className="block text-sm text-foreground/80 hover:text-primary transition-colors py-1 border-l-2 border-transparent hover:border-primary pl-3"
                      >
                        {item}
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 prose prose-lg max-w-none">
              <section id="section-0" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Tout sur l'assurance maladie</h3>
                <p className="text-muted-foreground">
                  Lorsque vous vivez en Suisse, vous êtes tenu de souscrire une assurance maladie. Celle-ci couvre une partie de vos frais de santé. Comment fonctionne la LAMal ? Combien cela coûte-t-il ? Ai-je également besoin de souscrire une assurance maladie complémentaire ? Quelles sont les particularités de la couverture santé pour les travailleurs frontaliers ? Découvrez tout ce que vous devez savoir sur l'assurance maladie en Suisse.
                </p>
                <img 
                  src="https://le-comparateur-optimis.ch/wp-content/uploads/2024/05/theluckycharm_delete_the_extra_things_3580fd9b-5c4e-45bd-88b3-fb7463e2f924-min.png" 
                  alt="Illustration assurance maladie"
                  className="rounded-lg my-6 w-full max-w-md"
                />
              </section>

              <section id="section-1" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Assurance maladie en Suisse : ce qu'il faut savoir</h3>
                <p className="text-muted-foreground">
                  En 1996, une loi fédérale a rendu l'adhésion à la LAMal obligatoire. En d'autres termes, toute personne vivant en Suisse est obligée de souscrire cette assurance maladie.
                </p>
              </section>

              <section id="section-2" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Comment fonctionne l'assurance maladie en Suisse ?</h3>
                <p className="text-muted-foreground">
                  L'objectif de l'assurance maladie suisse est de garantir l'accès aux soins de santé de base en cas de maladie, de maternité ou d'accident. Mais elle n'est ni centralisée ni gérée par le gouvernement. C'est l'Office fédéral de la santé publique (OFSP) qui contrôle la manière dont les assureurs privés administrent la protection santé dans le cadre de leur activité.
                </p>
                <div className="bg-muted/50 p-6 rounded-lg my-6">
                  <h4 className="font-semibold text-foreground mb-4">Assurance maladie de base :</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Couvre les principaux besoins de santé de l'assuré</li>
                    <li>• Garantit au moins les frais d'hospitalisation en chambre commune</li>
                    <li>• Les frais dentaires et la médecine alternative, entre autres, ne sont pas couverts par l'assurance maladie obligatoire de base</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  Vous êtes libre de choisir l'assureur avec lequel vous souhaitez souscrire un contrat d'assurance maladie. Tous les membres de la famille doivent être assurés, y compris les enfants.
                </p>
                <p className="text-muted-foreground mt-4">
                  Les nouveaux résidents suisses ont 3 mois pour choisir leur assureur maladie. Passé ce délai, l'administration cantonale leur attribue automatiquement un prestataire.
                </p>
              </section>

              <section id="section-3" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Combien ça coûte ?</h3>
                <p className="text-muted-foreground">
                  Les primes d'assurance maladie pour 2024 varient en fonction de :
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• Le lieu de résidence de l'assuré</li>
                  <li>• L'âge</li>
                  <li>• La franchise choisie</li>
                  <li>• Le modèle de base</li>
                  <li>• Les prestations sélectionnées (par exemple, la couverture accident)</li>
                </ul>
                <p className="text-muted-foreground">
                  Quel que soit ces facteurs, le niveau de remboursement est le même pour tout le monde.
                </p>
                <p className="text-muted-foreground mt-4">
                  Il est cependant possible de bénéficier de réductions sur les primes de l'assurance maladie obligatoire, appelées subsides. Ces aides, versées par le canton, peuvent couvrir tout ou partie des primes.
                </p>
              </section>

              <section id="section-4" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Comment obtenir l'assurance maladie obligatoire ?</h3>
                <p className="text-muted-foreground">
                  Tous les assurés sont libres de choisir le prestataire avec lequel ils souhaitent souscrire un contrat d'assurance maladie. L'assureur n'a pas le droit de refuser une demande. Il n'est pas non plus autorisé à demander à un futur assuré de remplir un questionnaire de santé lors de la signature du contrat.
                </p>
                <p className="text-muted-foreground mt-4">
                  Comme chaque assureur peut fixer la prime qu'il souhaite, il est important de comparer plusieurs propositions, en tenant compte de :
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• Le budget disponible pour l'assurance maladie obligatoire</li>
                  <li>• Les besoins de couverture</li>
                  <li>• Le canton de résidence</li>
                  <li>• L'âge et la situation familiale de l'assuré</li>
                  <li>• La franchise</li>
                </ul>
              </section>

              <section id="section-5" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Souscrire à une assurance maladie complémentaire</h3>
                <p className="text-muted-foreground">
                  En plus de l'assurance maladie de base suisse, il est conseillé de souscrire une assurance maladie complémentaire.
                </p>
                <h4 className="font-semibold text-foreground mt-6 mb-4">Pourquoi souscrire une assurance maladie complémentaire ?</h4>
                <p className="text-muted-foreground">
                  L'assurance maladie de base ne couvre qu'une modeste proportion des frais de santé. En conséquence, il est recommandé de compléter sa couverture par un contrat de santé complémentaire. Il s'agit d'un contrat privé qui couvre un plus large éventail de dépenses de santé, telles que :
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• Les frais d'hospitalisation (chambre double ou individuelle)</li>
                  <li>• Les soins dentaires</li>
                  <li>• Les soins optiques</li>
                  <li>• Les services de médecine naturelle ou alternative</li>
                  <li>• Les services de sauvetage</li>
                </ul>
                <p className="text-muted-foreground">
                  Contrairement à l'Assurance Maladie, l'assurance maladie complémentaire n'est pas obligatoire.
                </p>
              </section>

              <section id="section-6" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Tout ce qu'il faut savoir sur la Loi sur le Contrat d'Assurance (LCA)</h3>
                <h4 className="font-semibold text-foreground mt-6 mb-4">Focus sur l'assurance maladie des frontaliers</h4>
                <p className="text-muted-foreground">
                  La Suisse accueille un grand nombre de travailleurs frontaliers. C'est pourquoi deux régimes ont été mis en place pour assurer la couverture santé des frontaliers.
                </p>
                <h4 className="font-semibold text-foreground mt-6 mb-4">Un travailleur frontalier peut-il bénéficier de la LAMal ?</h4>
                <p className="text-muted-foreground">
                  Les frontaliers, qu'ils vivent en France et travaillent en Suisse ou vice versa, sont tenus de souscrire une assurance maladie. Ils peuvent choisir entre deux solutions :
                </p>
                <ul className="space-y-2 text-muted-foreground my-4">
                  <li>• La CMU (reprenant le régime de l'assurance maladie française)</li>
                  <li>• La LAMal frontalier (reprenant le système suisse)</li>
                </ul>
              </section>

              <section id="section-7" className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">LAMal ou CMU ? Comment choisir ?</h3>
                <p className="text-muted-foreground">
                  Dans le cadre du régime LAMal frontalier, les assurés peuvent recevoir des soins en France et en Suisse. Ce n'est pas le cas avec la CMU frontalier, qui ne couvre les traitements en Suisse que dans certaines conditions. Ce n'est qu'une des nombreuses différences entre les deux régimes. Il est essentiel que les frontaliers prennent le temps d'étudier les deux solutions et choisissent la plus avantageuse.
                </p>
                <h4 className="font-semibold text-foreground mt-6 mb-4">Est-il nécessaire de souscrire une assurance maladie complémentaire spéciale pour les frontaliers ?</h4>
                <p className="text-muted-foreground">
                  Les frontaliers sont fortement conseillés de souscrire une assurance maladie complémentaire spécialement conçue pour couvrir les frais de santé à la fois dans le pays où ils résident et dans le pays où ils travaillent.
                </p>
              </section>

              <section className="mb-12">
                <h3 className="text-2xl font-bold text-foreground">Toutes les caisses maladie</h3>
                <p className="text-muted-foreground">
                  Avec le plus grand choix d'offres d'assurance maladie, comparez les primes 2024 pour les assurances de base et complémentaires de plus de 30 compagnies en quelques clics.
                </p>
                <h4 className="font-semibold text-foreground mt-6 mb-4">Comparaison des assurances maladie : quels critères utiliser ?</h4>
                <p className="text-muted-foreground">
                  Lorsqu'il s'agit de comparer les assureurs maladie suisses, plusieurs points doivent être analysés avec soin.
                </p>
                <div className="grid gap-4 md:grid-cols-3 my-6">
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-foreground">Remboursement</h5>
                      <p className="text-sm text-muted-foreground mt-2">
                        La première chose à surveiller lors de la lecture d'un contrat d'assurance maladie.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-foreground">Service client</h5>
                      <p className="text-sm text-muted-foreground mt-2">
                        La qualité du soutien apporté et les avis des assurés.
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h5 className="font-semibold text-foreground">Autres critères</h5>
                      <p className="text-sm text-muted-foreground mt-2">
                        Engagements environnementaux, avantages spécifiques, etc.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-10">
            <h3 className="text-sm font-semibold text-primary mb-2">NOS PARTENAIRES</h3>
            <p className="text-lg text-foreground">
              Parce que nous sommes Indépendant, nous trouvons les meilleures offres adaptées à vos besoins.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner) => (
              <img
                key={partner.name}
                src={partner.logo}
                alt={partner.name}
                className="h-10 md:h-12 object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 md:p-12 text-center">
              <img src={llamaMascot} alt="Mascotte Optimis" className="h-24 mx-auto mb-6" />
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Prêt à comparer les offres ?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Obtenez une estimation gratuite et sans engagement en quelques clics.
              </p>
              <Button size="lg" className="gap-2">
                <Heart className="h-5 w-5" />
                Comparer maintenant
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default AssuranceSante;
