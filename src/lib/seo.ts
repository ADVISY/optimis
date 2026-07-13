// ============================================================================
// SEO — configuration centralisée (domaine, meta par page, canonical, hreflang)
// ============================================================================
// Source unique de vérité pour tout le référencement on-page.
//
//  - SITE_URL : domaine de production, paramétrable via VITE_SITE_URL.
//    Par défaut le domaine custom réel : https://le-comparateur-optimis.ch
//    (⚠️ plus jamais optimis.lovable.app — c'était la valeur par défaut Lovable).
//
//  - SEO_META : title + description optimisés mots-clés, par routeKey × langue.
//    Les clés correspondent à src/utils/localizedRoutes.ts.
//
//  - getSeo() : assemble title, description, canonical et alternates hreflang
//    pour une page donnée, à partir des slugs localisés.
// ============================================================================

import { localizedRoutes } from "@/utils/localizedRoutes";

export const LANGS = ["fr", "de", "it"] as const;
export type Lang = (typeof LANGS)[number];

// Domaine de prod (jamais de hardcode lovable). Surchargé en build via VITE_SITE_URL.
export const SITE_URL = (
  (import.meta.env?.VITE_SITE_URL as string | undefined) ??
  "https://le-comparateur-optimis.ch"
).replace(/\/$/, "");

export const SITE_NAME = "Optimis";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/logo-optimis.png`;
export const YEAR = new Date().getFullYear();

// Mapping langue → code hreflang/OG suisse.
const HREFLANG: Record<Lang, string> = {
  fr: "fr-CH",
  de: "de-CH",
  it: "it-CH",
};
const OG_LOCALE: Record<Lang, string> = {
  fr: "fr_CH",
  de: "de_CH",
  it: "it_CH",
};

export interface SeoMeta {
  title: string;
  description: string;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  lang: Lang;
  htmlLang: string;
  ogLocale: string;
  ogLocaleAlternate: string[];
  alternates: { hreflang: string; href: string }[];
  ogImage: string;
  noindex: boolean;
}

// Pages de remerciement / conversion / tunnel : à NE PAS indexer.
export const NOINDEX_ROUTE_KEYS = new Set<string>([
  "thankYou",
  "thankYouMortgage",
  "thankYouLpp",
  "thankYouRealEstate",
  "thankYouPartner",
  "thankYouSubsidy",
  "thankYouTermination",
  "thankYouPrenatal",
]);

// ----------------------------------------------------------------------------
// Meta optimisées par page (mots-clés suisses, longue traîne, fraîcheur annuelle)
// ----------------------------------------------------------------------------
// Couvre les pages à fort potentiel. Les routeKeys non listés tombent sur un
// défaut de marque généré par langue (cf. fallbackMeta).
export const SEO_META: Record<string, Partial<Record<Lang, SeoMeta>>> = {
  home: {
    fr: {
      title: `Optimis – Comparateur d'assurances en Suisse ${YEAR}`,
      description: `Comparez gratuitement les assurances suisses : maladie, auto, ménage, 3e pilier, protection juridique. Trouvez la meilleure offre et économisez en quelques minutes.`,
    },
    de: {
      title: `Optimis – Versicherungsvergleich Schweiz ${YEAR}`,
      description: `Vergleichen Sie kostenlos Schweizer Versicherungen: Krankenkasse, Auto, Hausrat, Säule 3a, Rechtsschutz. Beste Offerte finden und in Minuten sparen.`,
    },
    it: {
      title: `Optimis – Comparatore assicurazioni Svizzera ${YEAR}`,
      description: `Confronta gratuitamente le assicurazioni svizzere: malattia, auto, mobilia, pilastro 3a, protezione giuridica. Trova l'offerta migliore e risparmia subito.`,
    },
  },

  // --- Assurance maladie / santé ---
  healthInsurance: {
    fr: { title: `Assurance maladie en Suisse : comparez les caisses ${YEAR}`, description: `Comparez les primes d'assurance maladie LAMal ${YEAR} de toutes les caisses suisses. Trouvez la couverture la moins chère adaptée à votre canton et économisez.` },
    de: { title: `Krankenkasse Schweiz: Prämien vergleichen ${YEAR}`, description: `Vergleichen Sie die Krankenkassen-Prämien ${YEAR} aller Schweizer Kassen. Finden Sie die günstigste KVG-Grundversicherung für Ihren Kanton und sparen Sie.` },
    it: { title: `Assicurazione malattia Svizzera: confronto ${YEAR}`, description: `Confronta i premi dell'assicurazione malattia LAMal ${YEAR} di tutte le casse svizzere. Trova la copertura più economica per il tuo cantone e risparmia.` },
  },
  healthLanding: {
    fr: { title: `Comparateur assurance maladie ${YEAR} – primes LAMal`, description: `Comparateur d'assurance maladie ${YEAR} : obtenez les primes réelles des caisses suisses selon votre canton, franchise et modèle. Comparaison gratuite et sans engagement.` },
    de: { title: `Krankenkassen-Vergleich ${YEAR} – Prämien online`, description: `Krankenkassen-Vergleich ${YEAR}: echte Prämien der Schweizer Kassen nach Kanton, Franchise und Modell. Kostenlos und unverbindlich vergleichen.` },
    it: { title: `Confronto assicurazione malattia ${YEAR} – premi`, description: `Confronto assicurazione malattia ${YEAR}: premi reali delle casse svizzere per cantone, franchigia e modello. Confronto gratuito e senza impegno.` },
  },

  // --- Subside / réduction de primes ---
  healthSubsidy: {
    fr: { title: `Subside assurance maladie ${YEAR} : conditions par canton`, description: `Subside d'assurance maladie ${YEAR} : qui y a droit, montants et démarches par canton. Vérifiez votre éligibilité à la réduction de primes et faites la demande.` },
    de: { title: `Prämienverbilligung ${YEAR}: Anspruch nach Kanton`, description: `Prämienverbilligung ${YEAR}: Anspruch, Beträge und Antrag je Kanton. Prüfen Sie Ihren Anspruch auf Krankenkassen-Verbilligung und stellen Sie den Antrag.` },
    it: { title: `Riduzione premi ${YEAR}: condizioni per cantone`, description: `Riduzione dei premi ${YEAR}: chi ne ha diritto, importi e procedure per cantone. Verifica i requisiti e richiedi la riduzione dei premi di cassa malati.` },
  },
  subsidyLanding: {
    fr: { title: `Demande de subside assurance maladie ${YEAR}`, description: `Faites votre demande de subside d'assurance maladie ${YEAR} en quelques minutes. Calcul d'éligibilité par canton et accompagnement gratuit dans vos démarches.` },
    de: { title: `Antrag Prämienverbilligung ${YEAR} – einfach online`, description: `Stellen Sie Ihren Antrag auf Prämienverbilligung ${YEAR} in wenigen Minuten. Anspruchsberechnung je Kanton und kostenlose Begleitung beim Antrag.` },
    it: { title: `Richiesta riduzione premi ${YEAR} – online`, description: `Richiedi la riduzione dei premi ${YEAR} in pochi minuti. Calcolo dell'idoneità per cantone e accompagnamento gratuito nelle pratiche.` },
  },

  // --- Résiliation ---
  termination: {
    fr: { title: `Résilier son assurance en Suisse : guide ${YEAR}`, description: `Comment résilier votre assurance maladie ou auto en Suisse : délais ${YEAR}, modèle de lettre et conditions. Résiliez à temps et trouvez une meilleure offre.` },
    de: { title: `Versicherung kündigen Schweiz: Anleitung ${YEAR}`, description: `Versicherung in der Schweiz kündigen: Fristen ${YEAR}, Vorlage Kündigungsschreiben und Bedingungen. Rechtzeitig kündigen und bessere Offerte finden.` },
    it: { title: `Disdire l'assicurazione in Svizzera: guida ${YEAR}`, description: `Come disdire l'assicurazione malattia o auto in Svizzera: termini ${YEAR}, modello di lettera e condizioni. Disdici in tempo e trova un'offerta migliore.` },
  },
  terminationLanding: {
    fr: { title: `Lettre de résiliation assurance ${YEAR} (modèle gratuit)`, description: `Modèle de lettre de résiliation d'assurance ${YEAR} gratuit. Respectez les délais légaux suisses et changez d'assurance sans risque. Aide gratuite.` },
    de: { title: `Kündigungsschreiben Versicherung ${YEAR} (Vorlage)`, description: `Kostenlose Vorlage Kündigungsschreiben Versicherung ${YEAR}. Halten Sie die Schweizer Fristen ein und wechseln Sie ohne Risiko. Kostenlose Hilfe.` },
    it: { title: `Lettera di disdetta assicurazione ${YEAR} (modello)`, description: `Modello gratuito di lettera di disdetta assicurazione ${YEAR}. Rispetta i termini legali svizzeri e cambia senza rischi. Assistenza gratuita.` },
  },

  // --- Auto ---
  carInsurance: {
    fr: { title: `Assurance auto en Suisse : comparez et économisez`, description: `Comparez les assurances auto en Suisse : RC, casco partielle et complète. Obtenez le meilleur prix selon votre véhicule et votre profil. Gratuit et rapide.` },
    de: { title: `Autoversicherung Schweiz: vergleichen & sparen`, description: `Vergleichen Sie Autoversicherungen in der Schweiz: Haftpflicht, Teil- und Vollkasko. Bester Preis für Ihr Fahrzeug und Profil. Kostenlos und schnell.` },
    it: { title: `Assicurazione auto Svizzera: confronta e risparmia`, description: `Confronta le assicurazioni auto in Svizzera: RC, casco parziale e totale. Miglior prezzo in base al veicolo e al profilo. Gratuito e veloce.` },
  },
  carLanding: {
    fr: { title: `Comparateur assurance auto Suisse – devis gratuit`, description: `Comparateur d'assurance auto suisse : entrez votre plaque, comparez les offres RC et casco et obtenez un devis gratuit en quelques minutes.` },
    de: { title: `Autoversicherung-Vergleich Schweiz – Offerte`, description: `Autoversicherungs-Vergleich Schweiz: Kennzeichen eingeben, Haftpflicht- und Kasko-Offerten vergleichen und in Minuten eine kostenlose Offerte erhalten.` },
    it: { title: `Confronto assicurazione auto Svizzera – preventivo`, description: `Confronto assicurazione auto Svizzera: inserisci la targa, confronta le offerte RC e casco e ottieni un preventivo gratuito in pochi minuti.` },
  },

  // --- Ménage / RC ---
  homeInsurance: {
    fr: { title: `Assurance ménage en Suisse : comparez les offres`, description: `Comparez les assurances ménage et RC privée en Suisse. Protégez votre logement au meilleur prix et trouvez la couverture adaptée à votre situation.` },
    de: { title: `Hausratversicherung Schweiz: Offerten vergleichen`, description: `Vergleichen Sie Hausrat- und Privathaftpflicht in der Schweiz. Schützen Sie Ihr Zuhause zum besten Preis und finden Sie die passende Deckung.` },
    it: { title: `Assicurazione mobilia Svizzera: confronta le offerte`, description: `Confronta le assicurazioni mobilia e RC privata in Svizzera. Proteggi la tua casa al miglior prezzo e trova la copertura adatta a te.` },
  },
  homeLanding: {
    fr: { title: `Comparateur assurance ménage Suisse – devis`, description: `Comparateur d'assurance ménage suisse : comparez les offres RC privée et inventaire du ménage et obtenez un devis gratuit adapté à votre logement.` },
    de: { title: `Hausratversicherung-Vergleich – Offerte Schweiz`, description: `Hausratversicherungs-Vergleich Schweiz: Privathaftpflicht und Hausrat vergleichen und eine kostenlose, passende Offerte erhalten.` },
    it: { title: `Confronto assicurazione mobilia – preventivo`, description: `Confronto assicurazione mobilia Svizzera: confronta RC privata e mobilia domestica e ottieni un preventivo gratuito adatto alla tua casa.` },
  },

  // --- Protection juridique ---
  legalProtection: {
    fr: { title: `Protection juridique en Suisse : comparez les offres`, description: `Comparez les assurances de protection juridique en Suisse : privée, circulation, travail. Défendez vos droits au meilleur prix. Comparaison gratuite.` },
    de: { title: `Rechtsschutzversicherung Schweiz: Offerten`, description: `Vergleichen Sie Rechtsschutzversicherungen in der Schweiz: Privat, Verkehr, Arbeit. Verteidigen Sie Ihre Rechte zum besten Preis. Kostenloser Vergleich.` },
    it: { title: `Protezione giuridica Svizzera: confronta le offerte`, description: `Confronta le assicurazioni di protezione giuridica in Svizzera: privata, circolazione, lavoro. Difendi i tuoi diritti al miglior prezzo. Gratis.` },
  },
  legalLanding: {
    fr: { title: `Comparateur protection juridique Suisse – devis`, description: `Comparateur de protection juridique suisse : comparez les offres privée et circulation et obtenez un devis gratuit pour défendre vos droits.` },
    de: { title: `Rechtsschutz-Vergleich Schweiz – Offerte`, description: `Rechtsschutz-Vergleich Schweiz: Privat- und Verkehrsrechtsschutz vergleichen und eine kostenlose Offerte erhalten.` },
    it: { title: `Confronto protezione giuridica – preventivo`, description: `Confronto protezione giuridica Svizzera: confronta le offerte privata e circolazione e ottieni un preventivo gratuito.` },
  },

  // --- 3e pilier / prévoyance ---
  pillar3Landing: {
    fr: { title: `Comparateur 3e pilier (3a) en Suisse ${YEAR}`, description: `Comparez les offres de 3e pilier (3a) en Suisse ${YEAR} : banque, assurance, fonds. Optimisez votre prévoyance et vos impôts. Conseil gratuit.` },
    de: { title: `Säule 3a Vergleich Schweiz ${YEAR} – Vorsorge`, description: `Vergleichen Sie Säule-3a-Angebote in der Schweiz ${YEAR}: Bank, Versicherung, Fonds. Optimieren Sie Vorsorge und Steuern. Kostenlose Beratung.` },
    it: { title: `Confronto pilastro 3a Svizzera ${YEAR}`, description: `Confronta le offerte del pilastro 3a in Svizzera ${YEAR}: banca, assicurazione, fondi. Ottimizza previdenza e imposte. Consulenza gratuita.` },
  },

  // --- LPP / libre passage ---
  lpp: {
    fr: { title: `Avoirs LPP et libre passage en Suisse`, description: `Gérez vos avoirs LPP et de libre passage en Suisse. Comparez les solutions et optimisez votre 2e pilier en cas de changement d'emploi ou de départ.` },
    de: { title: `BVG-Guthaben und Freizügigkeit Schweiz`, description: `Verwalten Sie Ihre BVG- und Freizügigkeitsguthaben in der Schweiz. Vergleichen Sie Lösungen und optimieren Sie Ihre 2. Säule beim Stellenwechsel.` },
    it: { title: `Averi LPP e libero passaggio Svizzera`, description: `Gestisci i tuoi averi LPP e di libero passaggio in Svizzera. Confronta le soluzioni e ottimizza il 2° pilastro in caso di cambio di lavoro.` },
  },
  lppLanding: {
    fr: { title: `Libre passage LPP : comparez les solutions`, description: `Comparez les solutions de libre passage LPP en Suisse et placez vos avoirs du 2e pilier intelligemment. Analyse gratuite et sans engagement.` },
    de: { title: `BVG-Freizügigkeit: Lösungen vergleichen`, description: `Vergleichen Sie Freizügigkeitslösungen in der Schweiz und legen Sie Ihr 2.-Säule-Guthaben klug an. Kostenlose Analyse, unverbindlich.` },
    it: { title: `Libero passaggio LPP: confronta le soluzioni`, description: `Confronta le soluzioni di libero passaggio LPP in Svizzera e investi gli averi del 2° pilastro con criterio. Analisi gratuita e senza impegno.` },
  },

  // --- Hypothèque ---
  mortgage: {
    fr: { title: `Hypothèque en Suisse : comparez les taux`, description: `Comparez les taux hypothécaires en Suisse et trouvez le meilleur financement pour votre bien immobilier. Simulation gratuite et conseil personnalisé.` },
    de: { title: `Hypothek Schweiz: Zinsen vergleichen`, description: `Vergleichen Sie Hypothekarzinsen in der Schweiz und finden Sie die beste Finanzierung für Ihre Immobilie. Kostenlose Simulation und Beratung.` },
    it: { title: `Ipoteca Svizzera: confronta i tassi`, description: `Confronta i tassi ipotecari in Svizzera e trova il miglior finanziamento per il tuo immobile. Simulazione gratuita e consulenza personalizzata.` },
  },
  mortgageLanding: {
    fr: { title: `Comparateur hypothèque Suisse – meilleurs taux`, description: `Comparateur d'hypothèque suisse : comparez les taux fixes et SARON de plusieurs prêteurs et obtenez une offre de financement gratuite.` },
    de: { title: `Hypotheken-Vergleich Schweiz – beste Zinsen`, description: `Hypotheken-Vergleich Schweiz: Fest- und SARON-Zinsen mehrerer Anbieter vergleichen und eine kostenlose Finanzierungsofferte erhalten.` },
    it: { title: `Confronto ipoteche Svizzera – migliori tassi`, description: `Confronto ipoteche Svizzera: confronta tassi fissi e SARON di più istituti e ottieni un'offerta di finanziamento gratuita.` },
  },

  // --- Pro / entreprise ---
  professionalInsurance: {
    fr: { title: `Assurance professionnelle & entreprise en Suisse`, description: `Comparez les assurances pour entreprises et indépendants en Suisse : RC professionnelle, perte de gain, choses. Protégez votre activité au meilleur prix.` },
    de: { title: `Unternehmensversicherung Schweiz vergleichen`, description: `Vergleichen Sie Versicherungen für Firmen und Selbstständige in der Schweiz: Betriebshaftpflicht, Erwerbsausfall, Sach. Schützen Sie Ihr Geschäft.` },
    it: { title: `Assicurazione aziendale Svizzera: confronto`, description: `Confronta le assicurazioni per aziende e indipendenti in Svizzera: RC professionale, perdita di guadagno, cose. Proteggi la tua attività.` },
  },
  businessLanding: {
    fr: { title: `Comparateur assurance entreprise – devis Suisse`, description: `Comparateur d'assurance entreprise suisse : comparez RC pro, perte d'exploitation et plus, et obtenez un devis adapté à votre activité.` },
    de: { title: `Unternehmensversicherung-Vergleich – Offerte`, description: `Unternehmensversicherungs-Vergleich Schweiz: Betriebshaftpflicht, Betriebsunterbruch u.a. vergleichen und passende Offerte erhalten.` },
    it: { title: `Confronto assicurazione azienda – preventivo`, description: `Confronto assicurazione azienda Svizzera: confronta RC professionale, interruzione attività e altro e ottieni un preventivo su misura.` },
  },

  // --- Prénatale ---
  prenatalInsurance: {
    fr: { title: `Assurance prénatale en Suisse : protégez bébé`, description: `Souscrivez une assurance prénatale en Suisse pour garantir les complémentaires de votre enfant sans réserve. Comparez les offres avant la naissance.` },
    de: { title: `Pränatale Versicherung Schweiz: Schutz fürs Baby`, description: `Schliessen Sie eine pränatale Versicherung in der Schweiz ab, um Zusatzversicherungen ohne Vorbehalt zu sichern. Vergleichen Sie vor der Geburt.` },
    it: { title: `Assicurazione prenatale Svizzera: tutela il bebè`, description: `Stipula un'assicurazione prenatale in Svizzera per garantire le complementari del tuo bambino senza riserve. Confronta prima della nascita.` },
  },
  prenatalLanding: {
    fr: { title: `Comparateur assurance prénatale Suisse`, description: `Comparateur d'assurance prénatale suisse : comparez les complémentaires pour votre futur enfant et souscrivez sans réserve avant la naissance.` },
    de: { title: `Pränatale Versicherung Vergleich Schweiz`, description: `Vergleich pränatale Versicherung Schweiz: Zusatzversicherungen für Ihr ungeborenes Kind vergleichen und ohne Vorbehalt vor der Geburt abschliessen.` },
    it: { title: `Confronto assicurazione prenatale Svizzera`, description: `Confronto assicurazione prenatale Svizzera: confronta le complementari per il tuo futuro bambino e stipula senza riserve prima della nascita.` },
  },

  // --- Complémentaire ---
  complementaryInsurance: {
    fr: { title: `Assurance complémentaire (LCA) en Suisse`, description: `Assurance maladie complémentaire LCA en Suisse : hospitalisation, dentaire, médecines douces, lunettes. Comblez les lacunes de la LAMal et économisez jusqu'à 40%.` },
    de: { title: `Zusatzversicherung (VVG) in der Schweiz`, description: `Krankenzusatzversicherung VVG in der Schweiz: Spital, Zahn, Alternativmedizin, Brillen. Schliessen Sie die Lücken der Grundversicherung und sparen Sie bis zu 40%.` },
    it: { title: `Assicurazione complementare (LCA) in Svizzera`, description: `Assicurazione malattia complementare LCA in Svizzera: ospedaliera, dentaria, medicine dolci, occhiali. Colma le lacune della LAMal e risparmia fino al 40%.` },
  },
  complementaryLanding: {
    fr: { title: `Comparateur assurance complémentaire Suisse`, description: `Comparez les assurances maladie complémentaires (LCA) en Suisse : hospitalisation, médecine alternative, dentaire. Trouvez la meilleure couverture.` },
    de: { title: `Zusatzversicherung-Vergleich Schweiz`, description: `Vergleichen Sie Krankenzusatzversicherungen (VVG) in der Schweiz: Spital, Alternativmedizin, Zahn. Finden Sie die beste Deckung.` },
    it: { title: `Confronto assicurazione complementare Svizzera`, description: `Confronta le assicurazioni malattia complementari (LCA) in Svizzera: ospedaliera, medicina alternativa, dentaria. Trova la copertura migliore.` },
  },

  // --- Estimation immobilière ---
  realEstate: {
    fr: { title: `Estimation immobilière gratuite en Suisse`, description: `Estimez gratuitement la valeur de votre bien immobilier en Suisse. Estimation en ligne rapide et fiable pour vendre ou financer au bon prix.` },
    de: { title: `Kostenlose Immobilienbewertung Schweiz`, description: `Bewerten Sie Ihre Immobilie in der Schweiz kostenlos. Schnelle und zuverlässige Online-Bewertung für Verkauf oder Finanzierung zum richtigen Preis.` },
    it: { title: `Valutazione immobiliare gratuita Svizzera`, description: `Valuta gratuitamente il tuo immobile in Svizzera. Stima online rapida e affidabile per vendere o finanziare al prezzo giusto.` },
  },
  realEstateLanding: {
    fr: { title: `Estimation immobilière en ligne – gratuit`, description: `Obtenez une estimation immobilière en ligne gratuite et sans engagement en Suisse. Connaissez la valeur de marché de votre maison ou appartement.` },
    de: { title: `Immobilienbewertung online – kostenlos`, description: `Erhalten Sie eine kostenlose Online-Immobilienbewertung in der Schweiz, unverbindlich. Erfahren Sie den Marktwert Ihres Hauses oder Ihrer Wohnung.` },
    it: { title: `Valutazione immobiliare online – gratis`, description: `Ottieni una valutazione immobiliare online gratuita e senza impegno in Svizzera. Scopri il valore di mercato della tua casa o appartamento.` },
  },

  // --- Vie ---
  lifeInsurance: {
    fr: { title: `Assurance vie en Suisse : comparez et protégez`, description: `Comparez les assurances vie en Suisse pour protéger vos proches et préparer l'avenir. Solutions risque pur et épargne. Conseil gratuit.` },
    de: { title: `Lebensversicherung Schweiz: vergleichen`, description: `Vergleichen Sie Lebensversicherungen in der Schweiz, um Ihre Liebsten zu schützen und vorzusorgen. Risiko- und Sparlösungen. Kostenlose Beratung.` },
    it: { title: `Assicurazione vita Svizzera: confronta e tutela`, description: `Confronta le assicurazioni vita in Svizzera per proteggere i tuoi cari e pianificare il futuro. Soluzioni rischio e risparmio. Consulenza gratuita.` },
  },

  // --- Divers ---
  services: {
    fr: { title: `Nos services de comparaison d'assurances`, description: `Découvrez les services Optimis : comparaison d'assurances, conseil indépendant et accompagnement gratuit pour faire les meilleurs choix en Suisse.` },
    de: { title: `Unsere Dienstleistungen im Versicherungsvergleich`, description: `Entdecken Sie die Optimis-Dienstleistungen: Versicherungsvergleich, unabhängige Beratung und kostenlose Begleitung für die besten Entscheidungen.` },
    it: { title: `I nostri servizi di confronto assicurazioni`, description: `Scopri i servizi Optimis: confronto assicurazioni, consulenza indipendente e accompagnamento gratuito per le scelte migliori in Svizzera.` },
  },
  insurances: {
    fr: { title: `Toutes les assurances à comparer en Suisse`, description: `Maladie, auto, ménage, vie, protection juridique, 3e pilier… Comparez toutes les assurances suisses au même endroit avec Optimis. Gratuit.` },
    de: { title: `Alle Versicherungen im Vergleich – Schweiz`, description: `Krankenkasse, Auto, Hausrat, Leben, Rechtsschutz, Säule 3a… Vergleichen Sie alle Schweizer Versicherungen an einem Ort mit Optimis. Kostenlos.` },
    it: { title: `Tutte le assicurazioni da confrontare in Svizzera`, description: `Malattia, auto, mobilia, vita, protezione giuridica, pilastro 3a… Confronta tutte le assicurazioni svizzere in un unico posto con Optimis. Gratis.` },
  },
  faq: {
    fr: { title: `FAQ – Questions fréquentes sur les assurances`, description: `Réponses aux questions fréquentes sur les assurances en Suisse : délais, résiliation, subsides, franchises. Tout comprendre avec Optimis.` },
    de: { title: `FAQ – Häufige Fragen zu Versicherungen`, description: `Antworten auf häufige Fragen zu Versicherungen in der Schweiz: Fristen, Kündigung, Prämienverbilligung, Franchisen. Alles verstehen mit Optimis.` },
    it: { title: `FAQ – Domande frequenti sulle assicurazioni`, description: `Risposte alle domande frequenti sulle assicurazioni in Svizzera: termini, disdetta, riduzioni premi, franchigie. Capisci tutto con Optimis.` },
  },
  about: {
    fr: { title: `À propos d'Optimis – le comparateur suisse`, description: `Optimis est le comparateur d'assurances indépendant qui aide les Suisses à économiser. Notre mission : des choix clairs, gratuits et sans pression.` },
    de: { title: `Über Optimis – der Schweizer Vergleichsdienst`, description: `Optimis ist der unabhängige Versicherungsvergleich, der den Menschen in der Schweiz beim Sparen hilft. Unsere Mission: klare, kostenlose Entscheidungen.` },
    it: { title: `Chi siamo – Optimis, il comparatore svizzero`, description: `Optimis è il comparatore di assicurazioni indipendente che aiuta gli svizzeri a risparmiare. La nostra missione: scelte chiare, gratuite e senza pressioni.` },
  },
  contact: {
    fr: { title: `Contact – Optimis`, description: `Contactez l'équipe Optimis pour toute question sur la comparaison d'assurances en Suisse. Réponse rapide et conseil gratuit.` },
    de: { title: `Kontakt – Optimis`, description: `Kontaktieren Sie das Optimis-Team für Fragen zum Versicherungsvergleich in der Schweiz. Schnelle Antwort und kostenlose Beratung.` },
    it: { title: `Contatti – Optimis`, description: `Contatta il team Optimis per qualsiasi domanda sul confronto assicurazioni in Svizzera. Risposta rapida e consulenza gratuita.` },
  },
  partners: {
    fr: { title: `Devenir partenaire courtier – Optimis`, description: `Recevez des leads d'assurance qualifiés en Suisse. Rejoignez le réseau de courtiers partenaires d'Optimis et développez votre portefeuille.` },
    de: { title: `Partner-Broker werden – Optimis`, description: `Erhalten Sie qualifizierte Versicherungs-Leads in der Schweiz. Werden Sie Partner-Broker von Optimis und bauen Sie Ihr Portfolio aus.` },
    it: { title: `Diventa broker partner – Optimis`, description: `Ricevi lead assicurativi qualificati in Svizzera. Unisciti alla rete di broker partner di Optimis e fai crescere il tuo portafoglio.` },
  },
  blog: {
    fr: { title: `Blog assurances Suisse – conseils & actualités`, description: `Conseils, guides et actualités sur les assurances en Suisse : santé, auto, prévoyance, immobilier. Le blog Optimis pour faire les bons choix.` },
    de: { title: `Versicherungs-Blog Schweiz – Tipps & News`, description: `Tipps, Ratgeber und News zu Versicherungen in der Schweiz: Gesundheit, Auto, Vorsorge, Immobilien. Der Optimis-Blog für gute Entscheidungen.` },
    it: { title: `Blog assicurazioni Svizzera – consigli e news`, description: `Consigli, guide e novità sulle assicurazioni in Svizzera: salute, auto, previdenza, immobiliare. Il blog Optimis per scegliere bene.` },
  },
  mobilePackage: {
    fr: { title: `Comparateur forfaits mobiles en Suisse`, description: `Comparez les forfaits mobiles suisses et trouvez l'abonnement au meilleur prix selon votre usage. Comparaison gratuite et rapide.` },
    de: { title: `Handy-Abo-Vergleich Schweiz`, description: `Vergleichen Sie Schweizer Handy-Abos und finden Sie das beste Angebot für Ihren Bedarf. Kostenloser und schneller Vergleich.` },
    it: { title: `Confronto abbonamenti mobile Svizzera`, description: `Confronta gli abbonamenti mobile svizzeri e trova l'offerta al miglior prezzo per il tuo utilizzo. Confronto gratuito e veloce.` },
  },
};

// Défaut de marque si aucune meta dédiée n'est définie pour la page.
const FALLBACK_META: Record<Lang, SeoMeta> = {
  fr: {
    title: `Optimis – Comparateur d'assurances en Suisse`,
    description: `Comparez gratuitement les assurances suisses et trouvez les meilleures offres avec Optimis.`,
  },
  de: {
    title: `Optimis – Versicherungsvergleich Schweiz`,
    description: `Vergleichen Sie kostenlos Schweizer Versicherungen und finden Sie die besten Angebote mit Optimis.`,
  },
  it: {
    title: `Optimis – Comparatore assicurazioni Svizzera`,
    description: `Confronta gratuitamente le assicurazioni svizzere e trova le offerte migliori con Optimis.`,
  },
};

// ----------------------------------------------------------------------------
// Helpers URL
// ----------------------------------------------------------------------------
export function isLang(value: string | undefined): value is Lang {
  return value === "fr" || value === "de" || value === "it";
}

/** URL absolue d'une page localisée (slug "" = accueil de langue → /fr). */
export function buildUrl(lang: Lang, slug: string): string {
  const clean = slug.replace(/^\/+|\/+$/g, "");
  return clean ? `${SITE_URL}/${lang}/${clean}` : `${SITE_URL}/${lang}`;
}

/** Canonical + alternates hreflang d'un routeKey, dérivés de localizedRoutes. */
export function buildAlternates(routeKey: string): {
  alternates: { hreflang: string; href: string }[];
  byLang: Record<Lang, string>;
} {
  const route = localizedRoutes[routeKey];
  const byLang = {} as Record<Lang, string>;
  const alternates: { hreflang: string; href: string }[] = [];

  for (const lang of LANGS) {
    const slug = route ? route[lang] ?? route.fr : "";
    const href = buildUrl(lang, slug);
    byLang[lang] = href;
    alternates.push({ hreflang: HREFLANG[lang], href });
  }
  // x-default → français
  alternates.push({ hreflang: "x-default", href: byLang.fr });
  return { alternates, byLang };
}

// ----------------------------------------------------------------------------
// Résolution SEO d'une page
// ----------------------------------------------------------------------------
export interface GetSeoOptions {
  routeKey?: string;
  lang: Lang;
  /** Surcharge manuelle (ex. titre d'un article de blog). */
  title?: string;
  description?: string;
  /** URL canonique explicite (ex. /fr/blog/:slug non présent dans localizedRoutes). */
  canonicalPath?: string;
  image?: string;
  noindex?: boolean;
}

// ----------------------------------------------------------------------------
// Données structurées (JSON-LD) générées automatiquement
// ----------------------------------------------------------------------------

// Pages de type comparateur/produit → éligibles à un schema Service.
export const COMPARATOR_ROUTE_KEYS = new Set<string>([
  "healthInsurance", "healthLanding",
  "carInsurance", "carLanding",
  "homeInsurance", "homeLanding",
  "legalProtection", "legalLanding",
  "lifeInsurance",
  "mortgage", "mortgageLanding",
  "professionalInsurance", "businessLanding",
  "prenatalInsurance", "prenatalLanding",
  "complementaryInsurance", "complementaryLanding",
  "pillar3Landing", "lpp", "lppLanding",
  "healthSubsidy", "subsidyLanding",
  "termination", "terminationLanding",
  "realEstate", "realEstateLanding",
  "mobilePackage",
]);

const HOME_NAME: Record<Lang, string> = { fr: "Accueil", de: "Startseite", it: "Home" };

/** Fil d'Ariane (Home > page courante) pour toute page interne. */
export function buildBreadcrumbSchema(seo: ResolvedSeo): Record<string, unknown> {
  const homeUrl = buildUrl(seo.lang, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: HOME_NAME[seo.lang], item: homeUrl },
      { "@type": "ListItem", position: 2, name: seo.title, item: seo.canonical },
    ],
  };
}

/** Schema Service (offre de comparaison) pour les pages produit/comparateur. */
export function buildServiceSchema(seo: ResolvedSeo): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.title,
    description: seo.description,
    serviceType: "Comparateur d'assurances",
    areaServed: { "@type": "Country", name: "Switzerland" },
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_OG_IMAGE,
    },
    url: seo.canonical,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
  };
}

/** Schema FAQPage à partir d'une liste de questions/réponses. */
export function buildFaqSchema(
  items: { question: string; answer: string }[]
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

/** Assemble les données structurées automatiques d'une page (breadcrumb + service). */
export function buildAutoJsonLd(routeKey: string | undefined, seo: ResolvedSeo): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  if (routeKey && routeKey !== "home") {
    out.push(buildBreadcrumbSchema(seo));
  }
  if (routeKey && COMPARATOR_ROUTE_KEYS.has(routeKey)) {
    out.push(buildServiceSchema(seo));
  }
  return out;
}

export function getSeo(opts: GetSeoOptions): ResolvedSeo {
  const lang = isLang(opts.lang) ? opts.lang : "fr";
  const meta =
    (opts.routeKey ? SEO_META[opts.routeKey]?.[lang] : undefined) ?? FALLBACK_META[lang];

  const title = opts.title ?? meta.title;
  const description = opts.description ?? meta.description;

  let canonical: string;
  let alternates: { hreflang: string; href: string }[];

  if (opts.routeKey && localizedRoutes[opts.routeKey]) {
    const built = buildAlternates(opts.routeKey);
    canonical = built.byLang[lang];
    alternates = built.alternates;
  } else if (opts.canonicalPath) {
    const path = opts.canonicalPath.replace(/^\/+/, "");
    canonical = `${SITE_URL}/${path}`;
    alternates = [];
  } else {
    canonical = buildUrl(lang, "");
    alternates = [];
  }

  const noindex =
    opts.noindex ?? (opts.routeKey ? NOINDEX_ROUTE_KEYS.has(opts.routeKey) : false);

  return {
    title,
    description,
    canonical,
    lang,
    htmlLang: HREFLANG[lang],
    ogLocale: OG_LOCALE[lang],
    ogLocaleAlternate: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    alternates,
    ogImage: opts.image ?? DEFAULT_OG_IMAGE,
    noindex,
  };
}
