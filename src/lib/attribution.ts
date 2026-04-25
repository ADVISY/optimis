/**
 * Attribution capture: persiste les UTM et click IDs (ttclid, fbclid, gclid)
 * dès le premier chargement, pour pouvoir les attacher au lead final même
 * si l'utilisateur navigue sur plusieurs pages avant de soumettre.
 *
 * Stockage en sessionStorage (limité à la session de navigation, conforme RGPD/nLPD,
 * pas de cookie tiers).
 */

const STORAGE_KEY = "optimis_attribution";

const ATTRIBUTION_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ttclid",
  "fbclid",
  "gclid",
  "msclkid",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number];

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  ttclid?: string;
  fbclid?: string;
  gclid?: string;
  msclkid?: string;
  landing_url?: string;
  landing_referrer?: string;
  captured_at?: string;
}

/**
 * À appeler une seule fois au boot de l'app (main.tsx).
 * Lit les params d'URL, fusionne avec ce qui est déjà stocké
 * (les nouveaux paramètres écrasent les anciens), persiste en sessionStorage.
 */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;

  try {
    const url = new URL(window.location.href);
    const existing = readAttribution();
    const updated: AttributionData = { ...existing };
    let changed = false;

    for (const key of ATTRIBUTION_KEYS) {
      const value = url.searchParams.get(key);
      if (value) {
        updated[key] = value;
        changed = true;
      }
    }

    // Première capture seulement: landing URL + referrer
    if (!existing.captured_at) {
      updated.landing_url = window.location.href;
      updated.landing_referrer = document.referrer || "";
      updated.captured_at = new Date().toISOString();
      changed = true;
    }

    if (changed) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.warn("Attribution capture failed:", err);
  }
}

/**
 * Lit l'attribution stockée. Retourne objet vide si rien.
 */
export function readAttribution(): AttributionData {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as AttributionData;
  } catch {
    return {};
  }
}

/**
 * Renvoie l'attribution avec des libellés FR prêts pour Zapier/Sheets.
 */
export function getAttributionForLead(): Record<string, string> {
  const data = readAttribution();
  const out: Record<string, string> = {};

  if (data.utm_source) out["UTM Source"] = data.utm_source;
  if (data.utm_medium) out["UTM Medium"] = data.utm_medium;
  if (data.utm_campaign) out["UTM Campaign"] = data.utm_campaign;
  if (data.utm_content) out["UTM Content"] = data.utm_content;
  if (data.utm_term) out["UTM Term"] = data.utm_term;
  if (data.ttclid) out["TikTok Click ID"] = data.ttclid;
  if (data.fbclid) out["Facebook Click ID"] = data.fbclid;
  if (data.gclid) out["Google Click ID"] = data.gclid;
  if (data.msclkid) out["Microsoft Click ID"] = data.msclkid;
  if (data.landing_url) out["Landing URL"] = data.landing_url;
  if (data.landing_referrer) out["Landing Referrer"] = data.landing_referrer;

  // Source publicitaire dérivée pour lecture rapide
  const adSource =
    data.utm_source ||
    (data.ttclid ? "tiktok" : undefined) ||
    (data.fbclid ? "facebook" : undefined) ||
    (data.gclid ? "google" : undefined) ||
    (data.msclkid ? "bing" : undefined);
  if (adSource) out["Source publicitaire"] = adSource;

  return out;
}
