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

  // Snap Pixel — conversion lead avec advanced matching (mêmes champs que le
  // template Snap, mais renseignés avec les VRAIES valeurs du lead, jamais les
  // placeholders "INSERT_..."). Snap hache email/téléphone côté client.
  try {
    if (typeof w.snaptr === "function") {
      const c = getLastLeadContact();
      const snapParams: Record<string, unknown> = { geo_country: "CH" };
      if (c?.email) snapParams.user_email = c.email;
      if (c?.phone) snapParams.user_phone_number = c.phone;
      if (c?.firstName) snapParams.firstname = c.firstName;
      if (c?.lastName) snapParams.lastname = c.lastName;
      if (c?.postalCode) snapParams.geo_postal_code = c.postalCode;
      if (c?.canton) snapParams.geo_region = c.canton;
      if (formType) snapParams.sign_up_method = formType;
      if (leadId) {
        snapParams.uuid_c1 = leadId;
        snapParams.client_deduplication_id = leadId;
      }
      w.snaptr("track", "SIGN_UP", snapParams);
    }
  } catch (err) {
    console.warn("snaptr SIGN_UP failed", err);
  }

  sessionStorage.setItem(dedupKey, "1");
}

/** Récupère le dernier leadId stocké par useLeadSubmission, si présent. */
export function getLastLeadId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem("last_lead_id") ?? undefined;
}

/** Récupère le dernier formType stocké par useLeadSubmission, si présent. */
export function getLastFormType(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return sessionStorage.getItem("last_lead_form_type") ?? undefined;
}

/**
 * Coordonnées du dernier prospect, persistées par useLeadSubmission juste après
 * l'envoi. Permet à la page merci (rechargement complet) de pré-remplir le bloc
 * « RDV à domicile » sans redemander nom/tél/email/NPA.
 */
export type LastLeadContact = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  postalCode?: string;
  canton?: string;
  formType?: string;
  leadId?: string;
  language?: string;
};

export function getLastLeadContact(): LastLeadContact | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem("last_lead_contact");
    return raw ? (JSON.parse(raw) as LastLeadContact) : undefined;
  } catch {
    return undefined;
  }
}

export function clearLastLeadContact(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("last_lead_contact");
    sessionStorage.removeItem("last_lead_details");
  } catch {
    /* noop */
  }
}

/**
 * Toutes les infos fournies par le prospect dans son formulaire initial
 * (libellés FR propres : Date de naissance, Situation familiale, Franchise,
 * Assureur actuel, etc.), persistées par useLeadSubmission. Sert à composer la
 * description complète du RDV sur la page merci.
 */
export function getLastLeadDetails(): Record<string, unknown> | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem("last_lead_details");
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : undefined;
  } catch {
    return undefined;
  }
}
