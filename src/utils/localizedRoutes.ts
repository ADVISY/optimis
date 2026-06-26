// Localized route slugs for each language
// This maps internal route keys to language-specific URL slugs

export interface LocalizedRoute {
  fr: string;
  de: string;
  it: string;
  en: string;
}

export interface LocalizedRoutes {
  [key: string]: LocalizedRoute;
}

export const localizedRoutes: LocalizedRoutes = {
  // Main pages
  home: { fr: "", de: "", it: "", en: "" },
  carInsurance: { fr: "assurance-voiture", de: "autoversicherung", it: "assicurazione-auto", en: "car-insurance" },
  healthInsurance: { fr: "assurance-sante", de: "krankenversicherung", it: "assicurazione-malattia", en: "health-insurance" },
  legalProtection: { fr: "protection-juridique", de: "rechtsschutz", it: "protezione-giuridica", en: "legal-protection" },
  homeInsurance: { fr: "assurance-menage", de: "hausratversicherung", it: "assicurazione-mobilia", en: "home-insurance" },
  lifeInsurance: { fr: "assurance-vie", de: "lebensversicherung", it: "assicurazione-vita", en: "life-insurance" },
  mortgage: { fr: "hypotheque", de: "hypothek", it: "ipoteca", en: "mortgage" },
  professionalInsurance: { fr: "assurance-professionnelle", de: "unternehmensversicherung", it: "assicurazione-professionale", en: "business-insurance" },
  services: { fr: "services", de: "dienstleistungen", it: "servizi", en: "services" },
  mobilePackage: { fr: "forfait-mobile", de: "handy-abo", it: "abbonamento-mobile", en: "mobile-plan" },
  healthSubsidy: { fr: "subside-assurance-maladie", de: "praemienverbilligung", it: "riduzione-premi", en: "health-insurance-subsidy" },
  prenatalInsurance: { fr: "assurance-prenatale", de: "praenatale-versicherung", it: "assicurazione-prenatale", en: "prenatal-insurance" },
  termination: { fr: "resiliation", de: "kuendigung", it: "disdetta", en: "cancellation" },
  blog: { fr: "blog", de: "blog", it: "blog", en: "blog" },

  // Institutional pages
  privacyPolicy: { fr: "politique-de-confidentialite", de: "datenschutz", it: "privacy", en: "privacy-policy" },
  legalNotice: { fr: "legal", de: "impressum", it: "note-legali", en: "legal-notice" },
  terms: { fr: "cgu", de: "agb", it: "condizioni", en: "terms" },
  about: { fr: "a-propos", de: "ueber-uns", it: "chi-siamo", en: "about" },
  aboutAlt: { fr: "qui-sommes-nous", de: "ueber-uns", it: "chi-siamo", en: "who-we-are" },
  contact: { fr: "contactez-nous", de: "kontakt", it: "contatti", en: "contact" },
  faq: { fr: "faqs", de: "faq", it: "faq", en: "faq" },
  insurances: { fr: "assurances", de: "versicherungen", it: "assicurazioni", en: "insurance" },
  thankYou: { fr: "merci", de: "danke", it: "grazie", en: "thank-you" },
  thankYouMortgage: { fr: "merci-hypotheque", de: "danke-hypothek", it: "grazie-ipoteca", en: "thank-you-mortgage" },
  thankYouLpp: { fr: "merci-lpp", de: "danke-bvg", it: "grazie-lpp", en: "thank-you-pension" },
  thankYouRealEstate: { fr: "merci-estimation", de: "danke-immobilienbewertung", it: "grazie-valutazione", en: "thank-you-estimate" },
  thankYouPartner: { fr: "merci-partenaire", de: "danke-partner", it: "grazie-partner", en: "thank-you-partner" },
  thankYouSubsidy: { fr: "merci-subside", de: "danke-praemienverbilligung", it: "grazie-riduzione-premi", en: "thank-you-subsidy" },
  thankYouTermination: { fr: "merci-resiliation", de: "danke-kuendigung", it: "grazie-disdetta", en: "thank-you-cancellation" },
  thankYouPrenatal: { fr: "merci-prenatale", de: "danke-praenatale", it: "grazie-prenatale", en: "thank-you-prenatal" },

  // Landing/Comparator pages
  healthLanding: { fr: "assurance-maladie-landing", de: "krankenversicherung-vergleich", it: "confronto-assicurazione-malattia", en: "health-insurance-quote" },
  carLanding: { fr: "assurance-voiture-landing", de: "autoversicherung-vergleich", it: "confronto-assicurazione-auto", en: "car-insurance-quote" },
  homeLanding: { fr: "assurance-menage-landing", de: "hausratversicherung-vergleich", it: "confronto-assicurazione-mobilia", en: "home-insurance-quote" },
  legalLanding: { fr: "protection-juridique-landing", de: "rechtsschutz-vergleich", it: "confronto-protezione-giuridica", en: "legal-protection-quote" },
  subsidyLanding: { fr: "subside-assurance-maladie-demande", de: "praemienverbilligung-antrag", it: "richiesta-riduzione-premi", en: "health-subsidy-application" },
  prenatalLanding: { fr: "assurance-prenatale-offres", de: "praenatale-versicherung-vergleich", it: "confronto-assicurazione-prenatale", en: "prenatal-insurance-quote" },
  terminationLanding: { fr: "resiliation-assurance", de: "versicherung-kuendigung", it: "disdetta-assicurazione", en: "insurance-cancellation" },
  pillar3Landing: { fr: "3eme-pilier-offres", de: "saeule-3a-vergleich", it: "confronto-pilastro-3a", en: "3rd-pillar-quote" },
  mortgageLanding: { fr: "hypotheque-offres", de: "hypotheken-vergleich", it: "confronto-ipoteche", en: "mortgage-quote" },
  businessLanding: { fr: "assurance-entreprise-offres", de: "unternehmensversicherung-vergleich", it: "confronto-assicurazione-azienda", en: "business-insurance-quote" },
  lpp: { fr: "avoirs-lpp", de: "bvg-guthaben", it: "averi-lpp", en: "pension-assets" },
  lppLanding: { fr: "avoirs-lpp-libre-passage", de: "bvg-freizuegigkeit", it: "averi-lpp-libero-passaggio", en: "pension-vested-benefits" },
  realEstate: { fr: "estimation-immobiliere", de: "immobilienbewertung", it: "valutazione-immobiliare", en: "property-valuation" },
  realEstateLanding: { fr: "estimation-immobiliere-gratuite", de: "kostenlose-immobilienbewertung", it: "valutazione-immobiliare-gratuita", en: "free-property-valuation" },
  partners: { fr: "partenaires", de: "partner", it: "partner", en: "partners" },
  complementaryLanding: { fr: "assurance-complementaire-offres", de: "zusatzversicherung-vergleich", it: "confronto-assicurazione-complementare", en: "supplementary-insurance-quote" },
};

// Helper function to get the localized path for a route
export const getLocalizedPath = (routeKey: string, lang: string): string => {
  const route = localizedRoutes[routeKey];
  if (!route) return "";

  const langCode = lang as keyof LocalizedRoute;
  return route[langCode] || route.fr;
};

// Helper function to find route key from a slug
export const findRouteKeyFromSlug = (slug: string, lang: string): string | null => {
  for (const [key, routes] of Object.entries(localizedRoutes)) {
    const langCode = lang as keyof LocalizedRoute;
    if (routes[langCode] === slug || routes.fr === slug) {
      return key;
    }
  }
  return null;
};

// Get all slugs for a given route key (for generating routes)
export const getAllSlugsForRoute = (routeKey: string): string[] => {
  const route = localizedRoutes[routeKey];
  if (!route) return [];

  return [...new Set(Object.values(route))];
};

// Check if a slug belongs to a specific route key
export const isSlugForRoute = (slug: string, routeKey: string): boolean => {
  const route = localizedRoutes[routeKey];
  if (!route) return false;

  return Object.values(route).includes(slug);
};
