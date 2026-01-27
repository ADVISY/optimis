export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: number;
  image?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "subside-assurance-maladie",
    title: "Subside d'assurance maladie : comment ça marche ?",
    excerpt: "Les subsides d'assurance maladie en Suisse représentent une bouée de sauvetage financière pour les individus et familles à faible revenu.",
    content: `
## Naviguer les Méandres des Subsides d'Assurance Maladie en Suisse

### À Qui Profitent Ces Subsides d'Assurance Maladie ?

Les subsides d'assurance maladie en Suisse représentent une bouée de sauvetage financière pour les individus et familles à faible revenu, les aidant à assumer le coût de leurs primes d'assurance maladie. Explorez les critères qui ouvrent les portes de cette assistance vitale :

1. **Résidence en Suisse** : L'admissibilité nécessite une résidence en Suisse et une inscription auprès d'une commune.

2. **Revenu et Fortune** : Les revenus et la fortune du ménage sont les critères clés, avec des plafonds d'éligibilité variant d'un canton à l'autre.

3. **Situation Familiale** : La composition du ménage, y compris le nombre d'enfants, peut influencer l'éligibilité et le montant du subside.

4. **Assurance Maladie Obligatoire** : Seules les personnes assurées pour la couverture de base obligatoire (LAMal) peuvent solliciter des subsides.

5. **Pas de Couverture par un Tiers** : Les personnes dont les primes sont déjà prises en charge par un tiers ne sont généralement pas éligibles.

### Le Renouvellement Annuel : Une Garantie d'Adaptation

Même si vous êtes éligible une année, une demande annuelle est souvent nécessaire. La fluctuation de la situation financière et familiale justifie ce processus de renouvellement pour assurer une assistance adaptée.

### Cas Particuliers Bénéficiant d'Aides Directes

Certains privilégiés profitent directement d'aides d'assurance maladie couvrant intégralement leurs primes :

- Les Bénéficiaires d'une Pension Complémentaire AVS/AI
- Les Bénéficiaires d'une Aide Sociale

### Demander un Subside d'Assurance Maladie : Le Parcours Varie Selon le Canton

La procédure de demande dépend du canton de résidence, chaque région suisse gérant son propre système de subsides :

1. **Attestation Automatique** : Dans la plupart des cantons, si vous êtes éligible, une attestation vous parviendra automatiquement par courrier postal.

2. **Procédure de Demande** : Autrement, vous devrez effectuer une demande auprès de votre canton. Votre caisse d'assurance maladie touche les subsides, les déduisant directement de votre prime.

3. **Exclusivement pour l'Assurance Maladie Obligatoire** : Cette aide concerne uniquement l'assurance maladie obligatoire et non les complémentaires.

### Parcours de Demande dans Quelques Cantons Clés

- **Canton de Genève** : Formulaire disponible en ligne ou auprès du SASH.
- **Canton de Vaud** : Utilisation du formulaire en ligne ou papier fourni par le SAS.
- **Canton de Fribourg** : Formulaire disponible sur le site ou auprès du service de l'action sociale.
- **Canton du Valais** : Formulaire fourni par le SCAS, disponible en ligne ou sur demande.
- **Canton de Neuchâtel** : Utilisation du formulaire en ligne ou obtention directe auprès du service.
    `,
    category: "Assurance santé",
    date: "2024-06-12",
    readTime: 2,
  },
  {
    id: "2",
    slug: "modele-assurance-maladie",
    title: "Quel modèle d'assurance maladie choisir ?",
    excerpt: "Le modèle d'assurance désigne le premier point de contact en cas de question de santé. Découvrez les 4 modèles disponibles.",
    content: `
## Quel modèle d'assurance maladie choisir ?

Le modèle d'assurance désigne le premier point de contact en cas de question de santé (par exemple, médecin de famille, centre de santé, centre d'appel médical ou pharmacie). Bien que les prestations de l'assurance de base obligatoire soient uniformes, le choix du modèle peut influencer le montant de la prime d'assurance.

Il existe quatre modèles distincts :

### Le modèle "de base" ou standard

Offert par tous les assureurs, il repose sur le libre choix du médecin. Vous pouvez ainsi choisir et consulter directement votre médecin généraliste ou spécialiste sans devoir en informer votre caisse maladie au préalable. Ce modèle est le plus coûteux.

### Le modèle du médecin de famille

Ce modèle désigne votre médecin de famille comme premier interlocuteur, chargé de vous orienter vers un spécialiste si nécessaire. Concrètement, pour toute consultation médicale ou urgence, vous devez d'abord consulter ce médecin, qui assure la gestion de votre suivi médical.

### Le modèle HMO

Le modèle HMO (Health Maintenance Organization), traduit en français par "Organisation pour le Maintien de la Santé", fonctionne grâce à un réseau spécifique de prestataires de soins. Les assurés doivent d'abord consulter un médecin coordinateur désigné, généralement un généraliste appelé "gatekeeper", avant d'accéder aux spécialistes ou à d'autres services médicaux.

### Le modèle Telmed

Ce modèle implique de contacter d'abord une ligne téléphonique médicale avant toute consultation.

> **Bon à savoir** : Vous ne pouvez changer de médecin que dans les cas suivants : en cas de déménagement, si le cabinet du médecin ferme, ou en cas de rupture de confiance entre vous et votre médecin de famille.
    `,
    category: "Assurance santé",
    date: "2024-06-12",
    readTime: 2,
  },
  {
    id: "3",
    slug: "protection-juridique-suisse",
    title: "Le meilleur de la protection juridique en Suisse",
    excerpt: "Avec les différents types de protection juridique disponibles, comment choisir la meilleure en Suisse ?",
    content: `
## Qu'est-ce que l'assurance protection juridique en Suisse ?

Les litiges peuvent survenir rapidement et coûter cher, que vous soyez consommateur, voisin, conducteur, employé ou entrepreneur. Une assurance protection juridique couvre tous les frais liés aux procédures judiciaires, offrant ainsi une tranquillité d'esprit.

En tant que résident en Suisse, vous pourriez vous retrouver confronté à divers litiges au fil de votre vie. Par exemple, vous pourriez acheter un produit défectueux dans un magasin et être confronté à un refus de remboursement, vous contraignant à entamer une procédure judiciaire.

## Les différents types de protection juridique

### Protection juridique circulation
Elle vous protège en cas de litige relatif à la circulation routière, que vous soyez conducteur, passager ou propriétaire de véhicule.

### Protection juridique entreprise
Elle vous couvre en cas de litige lié à votre activité professionnelle.

### Protection juridique privée
Elle concerne les litiges relevant du droit privé : consommateur, assuré, employé, droit pénal, droit du travail, droit matrimonial, propriété, voisinage, bail, etc.

## Ce qui est couvert

- Frais de justice et honoraires d'avocat
- Conseils juridiques
- Accompagnement durant les procédures
- Protection juridique à l'étranger
- Avance de caution pénale
- Libre choix de votre avocat

## Quel est le prix de l'assurance protection juridique en 2024 ?

Les prix varient selon la couverture choisie et l'assureur. Comparez les offres pour trouver la meilleure option.

## Top 10 des conseils d'Optimis

1. Informez-vous sur les différents assureurs avec des comparateurs
2. Vérifiez les garanties et exclusions de chaque contrat
3. Examinez la réputation de l'assureur
4. Comparez les tarifs
5. Privilégiez les contrats avec libre sélection d'avocats
6. Vérifiez si vous n'êtes pas déjà couvert
7. Prenez en compte les délais de carence
8. Assurez-vous que vos litiges spécifiques sont couverts
9. Demandez des recommandations
10. Déterminez le type de contrat dont vous avez besoin
    `,
    category: "Protection juridique",
    date: "2024-06-12",
    readTime: 5,
  },
  {
    id: "4",
    slug: "assurance-dentaire-suisse",
    title: "Assurance dentaire complémentaire en Suisse",
    excerpt: "Les soins dentaires coûtent cher, et pourtant l'assurance de base ne les prend quasiment pas en charge. C'est alors qu'intervient l'assurance complémentaire soins dentaires.",
    content: `
## Assurance dentaire complémentaire en Suisse : Réponses aux questions essentielles

Les soins dentaires coûtent cher, et pourtant l'assurance de base ne les prend quasiment pas en charge. C'est alors qu'intervient l'assurance complémentaire soins dentaires.

## Que couvre une assurance dentaire complémentaire ?

- Les prothèses dentaires (couronnes, bridges, prothèses)
- La prophylaxie et l'hygiène dentaire
- Les corrections de malpositions dentaires
- Les radiographies

## Qui devrait souscrire une assurance dentaire complémentaire ?

Elle cible principalement les enfants, ou plus précisément leurs parents. Chez de nombreux enfants et adolescents, les malpositions dentaires sont corrigées à l'aide d'appareils orthodontiques. Ces traitements peuvent représenter un coût considérable, allant jusqu'à 10 000 francs en moyenne.

### Quand souscrire ?

Il est recommandé de souscrire une assurance complémentaire le plus tôt possible. Les assurances maladie ne remboursent les frais d'orthodontie que si le diagnostic a été posé après la souscription de l'assurance.

Certains assureurs imposent un délai de carence, généralement entre six mois et trois ans.

### Pour les enfants et les bébés

Il est important de souscrire une assurance complémentaire pour les soins dentaires des enfants dès que possible, idéalement avant qu'un certificat médical ne soit requis. Certains assureurs demandent un certificat dès l'âge de 3 ans.

## Quels services sont couverts ?

Les prestations varient selon les assurances :
- Certaines se spécialisent dans les corrections de malpositions
- D'autres dans les prothèses dentaires
- La limite annuelle des prestations ne devrait pas être inférieure à 8'000.-
    `,
    category: "Assurance santé",
    date: "2024-06-12",
    readTime: 3,
  },
  {
    id: "5",
    slug: "assurance-maladie-moins-chere",
    title: "Comment avoir une assurance maladie moins chère ? Le top 10 !",
    excerpt: "Les primes d'assurance maladie peuvent peser lourd sur le budget. Voici les conseils pour économiser sur l'assurance maladie.",
    content: `
## Comment avoir une assurance maladie moins chère ?

Les primes d'assurance maladie peuvent peser lourd sur le budget. Voici nos conseils pour économiser.

### 1. Choisir le bon modèle d'assurance

Les modèles d'assurance alternatifs offrent des primes jusqu'à 30 % moins élevées :
- Modèle HMO
- Modèle Telmed
- Modèle du médecin de famille
- Modèles mixtes

### 2. Quelle somme peut-on économiser ?

En 2024, près de 0,7 million de personnes assurées pourraient économiser au moins 40 % sur leur prime. Le potentiel d'économies maximal pourrait s'élever jusqu'à **3000 francs**.

### 3. Changer d'assurance de base

Les prestations de l'assurance de base sont légalement définies et identiques, peu importe la caisse. Il peut être avantageux de changer pour un prestataire moins cher.

### 4. Augmenter sa franchise

Plus la franchise est élevée, plus la prime est basse. Un adulte choisissant la franchise maximale de 2500 francs peut économiser jusqu'à 1540 francs par an.

### 5. Souscrire sans couverture accidents

Si vous travaillez au moins huit heures par semaine, vous êtes automatiquement assuré contre les accidents selon la LAA. Vous pouvez économiser jusqu'à 10 % en excluant cette couverture.

### 6. Réduire les coûts de l'assurance complémentaire

Les produits Flex permettent de contribuer aux frais supplémentaires en cas de séjour hospitalier en échange de primes moins élevées.

### 7. Profiter des réductions familiales

Dans l'assurance de base, plusieurs prestataires offrent des réductions à partir du deuxième enfant.

### 8. Mettre en pause l'assurance maladie

La suspension est possible dans certains cas : service militaire, voyage autour du monde, etc.

### 9. Demander une Réduction Individuelle des Primes (RIP)

Les personnes à faible revenu peuvent bénéficier de réductions de primes.

### 10. Payer annuellement

Certaines caisses proposent des réductions si vous réglez vos primes annuellement ou semestriellement.
    `,
    category: "Assurance santé",
    date: "2024-06-13",
    readTime: 5,
  },
  {
    id: "6",
    slug: "assurance-menage-suisse",
    title: "L'assurance ménage en Suisse : les 7 choses à savoir !",
    excerpt: "L'assurance RC ménage, c'est l'alliée parfaite pour protéger à la fois votre chez-vous et vos finances en cas de pépin.",
    content: `
## L'assurance ménage en Suisse : les 7 choses à savoir !

Vous venez de décrocher votre premier job, d'emménager dans votre nouvel appart ou de vous acheter des meubles tout neufs. Maintenant, place à la question des assurances !

## 1. Qu'est-ce que c'est ?

**L'assurance responsabilité civile (RC) privée** vous couvre si vous causez des dommages à quelqu'un d'autre ou à ses biens.

**L'assurance ménage** protège tout ce qui se trouve dans votre appartement : meubles, objets personnels, etc.

Quand on combine ces deux assurances, ça donne l'assurance RC ménage.

## 2. Que couvre-t-elle ?

- Incendies, foudre et explosions
- Vols (cambriolage, vol par effraction, vol à l'extérieur avec violence)
- Catastrophes naturelles (inondations, tempêtes, avalanches, éboulements)
- Dégâts des eaux
- Bris de glace

## 3. Est-elle obligatoire ?

L'assurance RC privée peut être obligatoire si vous êtes locataire. L'assurance ménage est obligatoire dans certains cantons (Vaud et Nidwald) pour les incendies et phénomènes naturels.

## 4. RC + Assurance ménage = à combiner ensemble !

Avantages de combiner :
1. Un gain de temps
2. Moins de paperasse
3. Protection complète
4. Des économies
5. Personnalisation facile
6. Couverture familiale

## 5. À quel prix ?

Les prix varient selon la valeur assurée et les options choisies. Comparez les offres pour trouver le meilleur rapport qualité-prix.

## 6. Comment résilier son contrat ?

Pour résilier, vous aurez besoin de :
- Vos données personnelles
- Votre numéro de police d'assurance
- La date de résiliation souhaitée
- Un motif de résiliation
- Votre signature

Le délai de préavis varie de 1 à 3 mois selon les compagnies.

## 7. Optimis vous aide dans vos démarches !

Vous souhaitez économiser ? Améliorer votre couverture ? Contactez-nous pour une analyse gratuite de votre situation.
    `,
    category: "Assurance habitation",
    date: "2024-06-20",
    readTime: 5,
  },
  {
    id: "7",
    slug: "assurance-maladie-bebe",
    title: "L'assurance maladie pour bébé",
    excerpt: "Bienvenue dans le monde des parents ! Vous vous demandez sûrement quelles assurances souscrire pour votre bébé.",
    content: `
## L'assurance maladie pour bébé

Bienvenue dans le monde des parents ! Vous vous demandez sûrement quelles assurances souscrire pour votre bébé. Optimis vous explique tout.

## 1. Assurance maladie obligatoire pour les nouveau-nés

En Suisse, tout le monde doit avoir une assurance de base, y compris les bébés. Affiliez votre nouveau-né à une caisse maladie dès que possible.

N'oubliez pas l'assurance accidents, qui est également obligatoire. Vous pouvez la souscrire via l'assurance de base.

## 2. Délais à respecter

Vous avez généralement 3 mois après la naissance pour inscrire votre enfant à une caisse maladie. Si vous dépassez ce délai, la couverture ne sera pas rétroactive.

## 3. Assurances complémentaires recommandées

- **Assurance dentaire** : Très recommandée pour les enfants, à souscrire avant l'âge de 3 ans
- **Assurance hospitalisation** : Pour bénéficier du libre choix du médecin
- **Assurance médecines alternatives** : Si vous préférez les approches naturelles

## 4. Comment choisir la bonne caisse ?

- Comparez les primes entre les différentes caisses
- Vérifiez les réductions familiales offertes
- Considérez les assurances complémentaires proposées

## 5. Conseils pratiques

1. Préparez l'inscription avant la naissance
2. Demandez les documents nécessaires à l'avance
3. Comparez plusieurs offres
4. N'oubliez pas les assurances complémentaires

Contactez Optimis pour une analyse gratuite de vos besoins en assurance bébé !
    `,
    category: "Assurance santé",
    date: "2024-06-21",
    readTime: 3,
  },
];

export const categories = [
  "Tous",
  "Assurance santé",
  "Assurance habitation",
  "Protection juridique",
  "Assurance auto",
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  if (category === "Tous") return blogPosts;
  return blogPosts.filter((post) => post.category === category);
}
