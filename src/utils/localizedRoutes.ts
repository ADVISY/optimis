// Localized route slugs for each language
// This maps internal route keys to language-specific URL slugs

export interface LocalizedRoutes {
  [key: string]: {
    fr: string;
    de: string;
    it: string;
  };
}

export const localizedRoutes: LocalizedRoutes = {
  // Main pages
  home: { fr: "", de: "", it: "" },
  carInsurance: { fr: "assurance-voiture", de: "autoversicherung", it: "assicurazione-auto" },
  healthInsurance: { fr: "assurance-sante", de: "krankenversicherung", it: "assicurazione-malattia" },
  legalProtection: { fr: "protection-juridique", de: "rechtsschutz", it: "protezione-giuridica" },
  homeInsurance: { fr: "assurance-menage", de: "hausratversicherung", it: "assicurazione-mobilia" },
  lifeInsurance: { fr: "assurance-vie", de: "lebensversicherung", it: "assicurazione-vita" },
  mortgage: { fr: "hypotheque", de: "hypothek", it: "ipoteca" },
  professionalInsurance: { fr: "assurance-professionnelle", de: "unternehmensversicherung", it: "assicurazione-professionale" },
  services: { fr: "services", de: "dienstleistungen", it: "servizi" },
  mobilePackage: { fr: "forfait-mobile", de: "handy-abo", it: "abbonamento-mobile" },
  healthSubsidy: { fr: "subside-assurance-maladie", de: "praemienverbilligung", it: "riduzione-premi" },
  prenatalInsurance: { fr: "assurance-prenatale", de: "praenatale-versicherung", it: "assicurazione-prenatale" },
  termination: { fr: "resiliation", de: "kuendigung", it: "disdetta" },
  blog: { fr: "blog", de: "blog", it: "blog" },
  
  // Institutional pages
  privacyPolicy: { fr: "politique-de-confidentialite", de: "datenschutz", it: "privacy" },
  legalNotice: { fr: "legal", de: "impressum", it: "note-legali" },
  terms: { fr: "cgu", de: "agb", it: "condizioni" },
  about: { fr: "a-propos", de: "ueber-uns", it: "chi-siamo" },
  aboutAlt: { fr: "qui-sommes-nous", de: "ueber-uns", it: "chi-siamo" },
  contact: { fr: "contactez-nous", de: "kontakt", it: "contatti" },
  faq: { fr: "faqs", de: "faq", it: "faq" },
  insurances: { fr: "assurances", de: "versicherungen", it: "assicurazioni" },
  thankYou: { fr: "merci", de: "danke", it: "grazie" },
  thankYouMortgage: { fr: "merci-hypotheque", de: "danke-hypothek", it: "grazie-ipoteca" },
  thankYouLpp: { fr: "merci-lpp", de: "danke-bvg", it: "grazie-lpp" },
  thankYouRealEstate: { fr: "merci-estimation", de: "danke-immobilienbewertung", it: "grazie-valutazione" },
  thankYouPartner: { fr: "merci-partenaire", de: "danke-partner", it: "grazie-partner" },
  thankYouSubsidy: { fr: "merci-subside", de: "danke-praemienverbilligung", it: "grazie-riduzione-premi" },
  thankYouTermination: { fr: "merci-resiliation", de: "danke-kuendigung", it: "grazie-disdetta" },
  thankYouPrenatal: { fr: "merci-prenatale", de: "danke-praenatale", it: "grazie-prenatale" },
  
  // Landing/Comparator pages
  healthLanding: { fr: "assurance-maladie-landing", de: "krankenversicherung-vergleich", it: "confronto-assicurazione-malattia" },
  carLanding: { fr: "assurance-voiture-landing", de: "autoversicherung-vergleich", it: "confronto-assicurazione-auto" },
  homeLanding: { fr: "assurance-menage-landing", de: "hausratversicherung-vergleich", it: "confronto-assicurazione-mobilia" },
  legalLanding: { fr: "protection-juridique-landing", de: "rechtsschutz-vergleich", it: "confronto-protezione-giuridica" },
  subsidyLanding: { fr: "subside-assurance-maladie-demande", de: "praemienverbilligung-antrag", it: "richiesta-riduzione-premi" },
  prenatalLanding: { fr: "assurance-prenatale-offres", de: "praenatale-versicherung-vergleich", it: "confronto-assicurazione-prenatale" },
  terminationLanding: { fr: "resiliation-assurance", de: "versicherung-kuendigung", it: "disdetta-assicurazione" },
  pillar3Landing: { fr: "3eme-pilier-offres", de: "saeule-3a-vergleich", it: "confronto-pilastro-3a" },
  mortgageLanding: { fr: "hypotheque-offres", de: "hypotheken-vergleich", it: "confronto-ipoteche" },
  businessLanding: { fr: "assurance-entreprise-offres", de: "unternehmensversicherung-vergleich", it: "confronto-assicurazione-azienda" },
  lpp: { fr: "avoirs-lpp", de: "bvg-guthaben", it: "averi-lpp" },
  lppLanding: { fr: "avoirs-lpp-libre-passage", de: "bvg-freizuegigkeit", it: "averi-lpp-libero-passaggio" },
  realEstate: { fr: "estimation-immobiliere", de: "immobilienbewertung", it: "valutazione-immobiliare" },
  realEstateLanding: { fr: "estimation-immobiliere-gratuite", de: "kostenlose-immobilienbewertung", it: "valutazione-immobiliare-gratuita" },
  partners: { fr: "partenaires", de: "partner", it: "partner" },
};

// Helper function to get the localized path for a route
export const getLocalizedPath = (routeKey: string, lang: string): string => {
  const route = localizedRoutes[routeKey];
  if (!route) return "";
  
  const langCode = lang as keyof typeof route;
  return route[langCode] || route.fr;
};

// Helper function to find route key from a slug
export const findRouteKeyFromSlug = (slug: string, lang: string): string | null => {
  for (const [key, routes] of Object.entries(localizedRoutes)) {
    const langCode = lang as keyof typeof routes;
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
  
  return [...new Set([route.fr, route.de, route.it])];
};

// Check if a slug belongs to a specific route key
export const isSlugForRoute = (slug: string, routeKey: string): boolean => {
  const route = localizedRoutes[routeKey];
  if (!route) return false;
  
  return route.fr === slug || route.de === slug || route.it === slug;
};
