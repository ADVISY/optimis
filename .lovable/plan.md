# Audit UX mobile — Formulaires Maladie & Subside

Voici les problèmes constatés et les corrections proposées. Cochez celles à appliquer.

---

## 1. Sélecteurs (Select) instables sur mobile

**Problème** : les menus déroulants Radix (`Select`) se ferment parfois immédiatement sur mobile à cause des événements tactiles. Déjà corrigé pour le canton, mais subsiste sur :
- Maladie étape 1 : *assureur actuel*
- Subside étape 2 : *assureur actuel* + *franchise actuelle*

**Correction** : remplacer ces `Select` par un `<select>` natif (picker système iOS/Android, 100 % fiable).

---

## 2. Étape 4 Maladie (LAMal/Franchise) — textes trop petits

**Problème** : les libellés sont en `text-[10px]` / `text-xs`, les radios en `h-3.5 w-3.5`. Sous le seuil de lisibilité et de confort tactile.

**Correction** :
- Labels minimum `text-sm` (14 px) sur mobile
- Radios `h-4 w-4` minimum
- Padding cartes `p-3` minimum
- Slider franchise : poignée élargie pour le pouce

---

## 3. Étape 5 Maladie (BASIC/PREMIUM/DIAMOND)

**Problème** : grille 3 colonnes très serrée, badges `text-[8px]`, prix `text-sm`. Difficile à lire et à viser.

**Correction** :
- Augmenter typographie : titres `text-sm`, prix `text-base`, badges `text-[10px]`
- Padding cartes `p-3` minimum
- Garder 3 colonnes (besoin métier), mais cartes plus aérées verticalement

---

## 4. Trust badges du conteneur

**Problème** : `text-[9px]` avec icônes 10 px — quasi illisible.

**Correction** : passer à `text-[11px]` + icônes `h-3 w-3`.

---

## 5. Codes postaux et revenus — mauvais clavier mobile

**Problème** :
- Maladie étape 3 *code postal* : pas de `inputMode="numeric"` → clavier alphanumérique
- Subside étape 3 *revenu* : `type="number"` (clavier décimal, pas pavé numérique propre sur iOS)

**Correction** : `type="text" inputMode="numeric" pattern="[0-9]*"` sur ces deux champs.

---

## 6. Le clavier mobile masque le champ actif

**Problème** : quand le clavier s'ouvre sur les inputs (prénom, email, téléphone, etc.), le champ peut se retrouver caché derrière. L'utilisateur ne voit pas ce qu'il tape.

**Correction** : ajouter `scroll-margin-bottom: 30vh` global sur les inputs des formulaires + `onFocus` qui fait un `scrollIntoView({ block: 'center' })` doux. Geste invisible mais transformatif sur mobile.

---

## 7. Date de naissance — saisie mobile

**Problème** : `DateInput` doit avoir `inputMode="numeric"` pour ouvrir le pavé numérique au lieu du clavier texte.

**Correction** : vérifier et forcer `inputMode="numeric"` sur le composant `DateInput`.

---

## Hors périmètre (pas touché sauf demande)

- Logique métier / calculs primes
- Structure des étapes
- Design des résultats
- Webhook Zapier

---

**Validez les points à appliquer (ex: "tous", "1, 2, 5, 6", etc.) et je code.**