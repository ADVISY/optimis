-- ============================================================================
-- Espace courtier — étape 1/2 : ajout de la valeur enum 'partner'
-- ============================================================================
-- Postgres exige que l'ajout d'une valeur d'enum soit dans une transaction
-- séparée avant qu'on puisse l'utiliser. La migration suivante crée tout le reste.
-- ============================================================================

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner';
