// ============================================================================
// <Seo> — gestion dynamique du <head> par page (title, meta, canonical, hreflang)
// ============================================================================
// S'appuie sur react-helmet-async + la config centralisée src/lib/seo.ts.
// La langue est déduite de l'URL (param :lang) avec repli sur i18next.
//
// Usage :
//   <Seo routeKey="healthLanding" />                 // page localisée
//   <Seo title="..." description="..." canonicalPath="fr/blog/mon-article" />
//   <Seo routeKey="faq" jsonLd={faqSchema} />        // + données structurées
// ============================================================================

import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getSeo, buildAutoJsonLd, isLang, type Lang } from "@/lib/seo";

interface SeoProps {
  routeKey?: string;
  title?: string;
  description?: string;
  canonicalPath?: string;
  image?: string;
  noindex?: boolean;
  /** Données structurées JSON-LD (objet ou tableau d'objets schema.org). */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const Seo = ({
  routeKey,
  title,
  description,
  canonicalPath,
  image,
  noindex,
  jsonLd,
}: SeoProps) => {
  const { lang: langParam } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  const lang: Lang = isLang(langParam)
    ? langParam
    : isLang(i18n.language)
    ? (i18n.language as Lang)
    : "fr";

  const seo = getSeo({ routeKey, lang, title, description, canonicalPath, image, noindex });

  // Données structurées : breadcrumb + service auto, puis JSON-LD explicite (Article, FAQ…).
  const autoJsonLd = seo.noindex ? [] : buildAutoJsonLd(routeKey, seo);
  const explicitJsonLd = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const jsonLdArray = [...autoJsonLd, ...explicitJsonLd];

  return (
    <Helmet>
      <html lang={lang} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />

      {/* Indexation */}
      {seo.noindex ? (
        <meta name="robots" content="noindex, follow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}

      {/* Canonical + alternates hreflang */}
      <link rel="canonical" href={seo.canonical} />
      {seo.alternates.map((alt) => (
        <link key={alt.hreflang} rel="alternate" hrefLang={alt.hreflang} href={alt.href} />
      ))}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Optimis" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonical} />
      <meta property="og:image" content={seo.ogImage} />
      <meta property="og:locale" content={seo.ogLocale} />
      {seo.ogLocaleAlternate.map((loc) => (
        <meta key={loc} property="og:locale:alternate" content={loc} />
      ))}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.ogImage} />

      {/* Données structurées */}
      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
