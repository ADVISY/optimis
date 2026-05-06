// Centralized lead tracking pixels (Meta + TikTok + Google Ads).
// Called from each thank-you page on mount, so the event fires
// when the prospect lands on the conversion page.
//
// Dédup par sessionStorage pour éviter le double-tir sur F5 / retour navigateur.

type FireOptions = {
  /** Identifiant unique du lead pour dédup (eventID Meta / event_id TikTok). */
  leadId?: string;
  /** Clé de dédup propre à la page (ex: "merci-lpp"). */
  pageKey: string;
  /** Conversion Google Ads à déclencher (ex: "AW-16586911321/1MwiCK30gpAcENncoOU9"). */
  googleAdsSendTo?: string;
  /** Nom du formulaire pour distinguer les sources (ex: "mortgage", "subsidy"). */
  formType?: string;
};

export function fireLeadConversion({ leadId, pageKey, googleAdsSendTo, formType }: FireOptions) {
  if (typeof window === "undefined") return;

  const dedupKey = `lead_pixels_${pageKey}_${leadId ?? "anon"}`;
  if (sessionStorage.getItem(dedupKey) === "1") {
    return;
  }

  const w = window as any;
  const fbParams: Record<string, unknown> = {};
  const ttParams: Record<string, unknown> = {};
  if (formType) {
    fbParams.content_name = formType;
    fbParams.content_category = formType;
    ttParams.content_name = formType;
  }

  try {
    if (typeof w.fbq === "function") {
      if (leadId) {
        w.fbq("track", "Lead", fbParams, { eventID: leadId });
      } else {
        w.fbq("track", "Lead", fbParams);
      }
    }
  } catch (err) {
    console.warn("fbq Lead failed", err);
  }

  try {
    if (w.ttq && typeof w.ttq.track === "function") {
      if (leadId) {
        w.ttq.track("CompleteRegistration", { ...ttParams, event_id: leadId });
      } else {
        w.ttq.track("CompleteRegistration", ttParams);
      }
    }
  } catch (err) {
    console.warn("ttq CompleteRegistration failed", err);
  }

  if (googleAdsSendTo) {
    try {
      if (typeof w.gtag === "function") {
        w.gtag("event", "conversion", { send_to: googleAdsSendTo });
      }
    } catch (err) {
      console.warn("gtag conversion failed", err);
    }
  }

  sessionStorage.setItem(dedupKey, "1");
}

/** Récupère le dernier leadId stocké par useLeadSubmission, si présent. */
export function getLastLeadId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem("last_lead_id") ?? undefined;
}
