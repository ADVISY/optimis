-- ============================================================================
-- Table `avis` (avis clients / témoignages) + RLS
-- ----------------------------------------------------------------------------
-- Flux :
--   1. Le prospect / visiteur soumet un avis depuis /avis  → statut 'en_attente'
--   2. L'admin valide (statut 'approuve') ou refuse ('refuse') dans /admin/avis
--   3. Les avis 'approuve' s'affichent sur la home (TestimonialsCarousel)
-- Sécurité :
--   - anon peut INSÉRER uniquement des avis en 'en_attente' (jamais auto-approuvé)
--   - anon/public ne peut LIRE que les avis 'approuve'
--   - seul un admin vérifié (is_verified_admin) peut tout lire / modérer / supprimer
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.avis (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auteur       TEXT NOT NULL,
  ville        TEXT,
  note         SMALLINT NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire  TEXT NOT NULL,
  email        TEXT,                                   -- privé, jamais affiché publiquement
  langue       TEXT NOT NULL DEFAULT 'fr',
  source       TEXT NOT NULL DEFAULT 'site',           -- 'site' | 'email'
  statut       TEXT NOT NULL DEFAULT 'en_attente'
                 CHECK (statut IN ('en_attente','approuve','refuse')),
  cree_le      TIMESTAMPTZ NOT NULL DEFAULT now(),
  modere_le    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_avis_statut_cree ON public.avis(statut, cree_le DESC);

ALTER TABLE public.avis ENABLE ROW LEVEL SECURITY;

-- Privilèges de table (RLS gouverne l'accès ligne à ligne par-dessus)
GRANT SELECT, INSERT ON public.avis TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.avis TO authenticated;

-- Insertion publique : uniquement des avis en attente de modération
DO $$ BEGIN
  CREATE POLICY "Public submit avis (pending only)" ON public.avis
    FOR INSERT TO anon, authenticated
    WITH CHECK (statut = 'en_attente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Lecture publique : uniquement les avis approuvés (pour le carrousel home)
DO $$ BEGIN
  CREATE POLICY "Public read approved avis" ON public.avis
    FOR SELECT TO anon, authenticated
    USING (statut = 'approuve');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Lecture admin : tous les avis (en_attente / approuve / refuse)
DO $$ BEGIN
  CREATE POLICY "Admins read all avis" ON public.avis
    FOR SELECT TO authenticated
    USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Modération admin (approuver / refuser)
DO $$ BEGIN
  CREATE POLICY "Admins update avis" ON public.avis
    FOR UPDATE TO authenticated
    USING (public.is_verified_admin())
    WITH CHECK (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Suppression admin
DO $$ BEGIN
  CREATE POLICY "Admins delete avis" ON public.avis
    FOR DELETE TO authenticated
    USING (public.is_verified_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
