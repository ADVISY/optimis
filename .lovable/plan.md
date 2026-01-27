

# Plan de Recréation du Site Optimis

## 🎯 Objectif
Recréer le site **le-comparateur-optimis.ch** en React/Tailwind, visuellement identique avec toutes les fonctionnalités.

---

## Phase 1 : Fondations

### Design System
- Palette de couleurs Optimis (vert émeraude #2D5A3D, vert pastel, blanc)
- Configuration du favicon avec la mascotte lama
- Intégration du logo SVG Optimis

### Navigation
- Header sticky avec logo et menu (Assurances, Finances, Services, Blog)
- Bouton "Prendre Rendez-vous" → lien Calendly
- Menu hamburger responsive pour mobile
- Footer avec contacts, liens légaux et bouton WhatsApp flottant

---

## Phase 2 : Page d'Accueil

### Section Héro
- Fond vert pastel dégradé
- Titre : "Comparez les assurances et trouvez les meilleures offres"
- Mascotte Lama avec monocle (image fournie)
- Boutons d'action

### Sélecteur d'Assurances
- 4 cartes cliquables avec icônes :
  - 🚗 Assurance Voiture
  - 🏥 Assurance Santé  
  - ⚖️ Protection Juridique
  - 🏠 Assurance Ménage

### Section "Comment ça marche"
- 4 étapes visuelles : Choisissez → Remplissez → Comparez → Économisez

### Statistiques de Confiance
- +10,000 utilisateurs
- 95% de recommandation
- 20+ partenaires assureurs

### Témoignages Clients
- Carrousel avec avis (Laurent Weber, Claire Muller, etc.)

### FAQ & Partenaires

---

## Phase 3 : Pages Assurances

### Formulaires Multi-étapes
Chaque type d'assurance aura son formulaire interactif :

1. **Assurance Voiture** - Type véhicule, marque, année, conducteur
2. **Assurance Santé** - Informations personnelles, couverture souhaitée
3. **Protection Juridique** - Formulaire simplifié
4. **Assurance Ménage** - Logement, valeur des biens

### Fonctionnalités
- Progression visuelle par étapes
- Validation des champs en temps réel
- Récapitulatif avant envoi

---

## Phase 4 : Blog & Pages Légales

- Liste des articles avec images et extraits
- Pages : Politique de confidentialité, Mentions légales, CGU

---

## Phase 5 : Backend (Supabase)

### Base de données
- Table `devis_requests` pour stocker les demandes
- Table `contacts` pour les messages

### Notifications
- Email automatique lors d'une nouvelle demande de devis

---

## 📱 Responsive Design
- Desktop, tablette et mobile optimisés
- Menu hamburger sur mobile
- Formulaires adaptés au tactile

---

## 🔗 Intégrations
- **Calendly** : Prise de rendez-vous
- **WhatsApp** : Bouton de contact flottant

