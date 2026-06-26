# Ajout langue anglaise (puis portugaise)

Cible : expatriés et résidents suisses anglophones / lusophones. Démarrage par **anglais seul**, portugais ensuite une fois validé.

## Phase 1 — Anglais (`/en/`)

### 1. Infrastructure i18n
- Ajouter `en` dans la liste des langues supportées (`src/lib/i18n/config.ts` ou équivalent).
- Étendre le router (`src/App.tsx`) pour servir `/en/*` avec les mêmes routes que `/fr/`, `/de/`, `/it/`.
- Ajouter le sélecteur de langue (drapeau 🇬🇧) dans le `Header` desktop + mobile.
- Mettre à jour le `LanguageDetector` (détection navigateur → `en` si `navigator.language` commence par `en`).

### 2. Slugs URL localisés
Traduire les ~50 slugs de routes (ex. `assurance-voiture` → `car-insurance`, `assurance-maladie` → `health-insurance`, `hypotheque` → `mortgage`, `troisieme-pilier` → `3rd-pillar`, `merci` → `thank-you`, `blog` → `blog`, etc.).

### 3. Traductions de contenu (IA)
- Extraire tous les fichiers de locales FR (`src/locales/fr/*.json` ou équivalent).
- Traduire automatiquement vers EN via Lovable AI (`google/gemini-3-flash-preview`) avec un script one-shot (`/tmp/translate.py` utilisant le skill `ai-gateway`).
- Glossaire imposé pour cohérence : *assurance maladie* = "health insurance", *LAMal* = "LAMal (basic health insurance)", *LCA* = "LCA (supplementary)", *3e pilier* = "3rd pillar (private pension)", *résiliation* = "cancellation", *hypothèque* = "mortgage", *prime* = "premium", *franchise* = "deductible", *caisse maladie* = "health insurer".
- Conserver le ton suisse (mentions CHF, cantons, NPA).
- Ne PAS traduire le blog (cf. memory existante : blog FR seul, bannière d'alerte pour EN comme pour DE/IT).

### 4. Formulaires
- Tous les labels, placeholders, erreurs, étapes traduits.
- Validation téléphone : ajouter formats UK (+44) et internationaux courants ; conserver +41 prioritaire (audience = résidents Suisse).
- OTP SMS : message Twilio en anglais quand `lang=en`.
- Webhooks Zapier : conserver les **labels en français** côté Google Sheets (le client travaille en FR) — seule l'UI utilisateur est en anglais. À confirmer.

### 5. SEO
- `<html lang="en">` dynamique.
- Title/meta description traduits par page.
- Balises `hreflang` ajoutées (fr, de, it, en, x-default).
- Sitemap incluant `/en/*`.

### 6. Sélecteur de langue
Mise à jour pour afficher : 🇫🇷 FR · 🇩🇪 DE · 🇮🇹 IT · 🇬🇧 EN

## Phase 2 — Portugais (`/pt/`)
Une fois l'anglais validé en prod : duplication exacte du processus pour `pt` (cible expats portugais/brésiliens en Suisse). Slugs PT, traduction IA depuis FR, OTP en PT, ajout au sélecteur.

## Détails techniques
- **Translation script** : Python via skill `ai-gateway`, batch JSON par fichier, glossaire injecté dans le system prompt, sortie écrite directement dans `src/locales/en/*.json`.
- **Pas de retraduction manuelle** des composants : tout passe par les clés i18n existantes.
- **Audit préalable** : si des chaînes sont hardcodées en FR dans les composants (non passées par i18n), je les extraie avant traduction.

## Hors scope (sauf demande)
- Traduction du blog (article par article)
- Refonte du contenu marketing spécifique expat (peut être ajouté Phase 1.5)
- Numéro WhatsApp/Calendly séparé pour anglophones

## Question avant exécution
Pour les leads Zapier/Google Sheets : labels FR (comme aujourd'hui) ou labels EN quand le formulaire est rempli en anglais ?
