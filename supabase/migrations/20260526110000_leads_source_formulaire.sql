-- ============================================================================
-- Ajout colonne source_formulaire dans leads
-- ============================================================================
-- Le champ leads.produit contient le domain (assurance_maladie, assurance_non_vie...)
-- → trop large pour les sous-onglets UI (santé/subside/auto/ménage sont tous "non_vie")
--
-- source_formulaire = formType brut envoyé par le comparateur :
--   "health-insurance", "subsidy", "mortgage", "car-insurance",
--   "household-insurance", "legal-protection", "professional-insurance",
--   "lpp-libre-passage", "pillar-3a", "estimation-immobiliere",
--   "termination", "prenatal-insurance", "partner"
-- ============================================================================

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source_formulaire TEXT;

-- Backfill depuis donnees_produit pour les leads existants
UPDATE public.leads
SET source_formulaire = donnees_produit->>'Type de formulaire'
WHERE source_formulaire IS NULL
  AND donnees_produit ? 'Type de formulaire';

CREATE INDEX IF NOT EXISTS idx_leads_source_formulaire ON public.leads(source_formulaire);
