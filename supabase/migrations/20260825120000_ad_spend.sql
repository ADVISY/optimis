-- ============================================================================
-- ad_spend : dépenses publicitaires (Meta / Google / TikTok)
-- Grain = 1 ligne par jour × campagne. Alimentée par les edge functions de sync.
-- Croisée avec public.leads (attribution UTM/click id) pour CPL + marge.
-- ============================================================================
create table if not exists public.ad_spend (
  id            uuid primary key default gen_random_uuid(),
  date          date not null,
  platform      text not null,                 -- 'meta' | 'google' | 'tiktok'
  account_id    text,
  campaign_id   text not null,
  campaign_name text,
  produit       text,                          -- mappé depuis la campagne (assurance_maladie, ...)
  spend         numeric(12,2) not null default 0,
  impressions   bigint not null default 0,
  clicks        bigint not null default 0,
  results       bigint not null default 0,     -- conversions/leads rapportés par la plateforme
  currency      text not null default 'CHF',
  raw           jsonb,                          -- payload brut de l'API (debug/audit)
  synced_at     timestamptz not null default now(),
  unique (platform, campaign_id, date)          -- clé d'upsert (jour × campagne)
);

alter table public.ad_spend enable row level security;

create index if not exists idx_ad_spend_date     on public.ad_spend(date desc);
create index if not exists idx_ad_spend_platform on public.ad_spend(platform);
create index if not exists idx_ad_spend_produit  on public.ad_spend(produit);

-- Lecture réservée aux admins (les edge functions écrivent en service_role → bypass RLS).
-- NB : is_verified_admin() n'existe pas sur ce projet → on vérifie le rôle directement.
drop policy if exists "admins read ad_spend" on public.ad_spend;
create policy "admins read ad_spend"
  on public.ad_spend for select to authenticated
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid() and ur.role::text = 'admin'
    )
  );
