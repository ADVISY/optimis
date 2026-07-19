// ============================================================================
// Génération du sitemap.xml — multilingue (fr/de/it) + blog
// ============================================================================
// Lit les slugs localisés (src/utils/localizedRoutes.ts) et les articles de blog
// (src/data/blogPosts.ts), puis écrit public/sitemap.xml sur le domaine de prod.
//
//   ⚠️ Domaine : le-comparateur-optimis.ch (surchargeable via SITE_URL=...).
//   Les pages localisées portent leurs alternates hreflang ; les articles de
//   blog sont canoniques en FR (contenu identique dans les 3 langues).
//
// USAGE :
//   node scripts/generate-sitemap.mjs
//   SITE_URL=https://staging.exemple.ch node scripts/generate-sitemap.mjs
// ============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SITE_URL = (process.env.SITE_URL ?? "https://le-comparateur-optimis.ch").replace(/\/$/, "");
const LANGS = ["fr", "de", "it", "en"];
// EN cible une audience internationale (expats/frontaliers) : hreflang générique.
const HREFLANG = { fr: "fr-CH", de: "de-CH", it: "it-CH", en: "en" };
const TODAY = new Date().toISOString().slice(0, 10);

// Pages à NE PAS indexer (tunnel / remerciement) + doublons de contenu.
const EXCLUDE = new Set([
  "thankYou", "thankYouMortgage", "thankYouLpp", "thankYouRealEstate",
  "thankYouPartner", "thankYouSubsidy", "thankYouTermination", "thankYouPrenatal",
  "aboutAlt",
]);

// ----------------------------------------------------------------------------
// 1) Extraire les slugs localisés
// ----------------------------------------------------------------------------
const routesSrc = readFileSync(resolve(ROOT, "src/utils/localizedRoutes.ts"), "utf8");
const routeRe = /(\w+):\s*\{\s*fr:\s*"([^"]*)",\s*de:\s*"([^"]*)",\s*it:\s*"([^"]*)"\s*\}/g;

const routes = [];
let m;
while ((m = routeRe.exec(routesSrc)) !== null) {
  const [, key, fr, de, it] = m;
  if (EXCLUDE.has(key)) continue;
  // EN réutilise les slugs FR (pas de slugs dédiés → cf. localizedRoutes.ts).
  routes.push({ key, slugs: { fr, de, it, en: fr } });
}

// ----------------------------------------------------------------------------
// 2) Extraire les slugs d'articles de blog (slug: en minuscule ≠ categorySlug:)
// ----------------------------------------------------------------------------
const blogSrc = readFileSync(resolve(ROOT, "src/data/blogPosts.ts"), "utf8");
// Limiter à la zone du tableau d'articles (exclut le tableau `categories` et les helpers).
const blogStart = blogSrc.indexOf("rawBlogPosts: BlogPost[] = [");
const blogEnd = blogSrc.indexOf("export const blogPosts");
const blogRegion = blogSrc.slice(blogStart, blogEnd > -1 ? blogEnd : undefined);
const blogRe = /\bslug:\s*"([^"]+)"/g;
const blogSlugs = [];
while ((m = blogRe.exec(blogRegion)) !== null) blogSlugs.push(m[1]);
const uniqueBlogSlugs = [...new Set(blogSlugs)];

// ----------------------------------------------------------------------------
// 3) Construire le XML
// ----------------------------------------------------------------------------
const url = (lang, slug) => {
  const clean = String(slug).replace(/^\/+|\/+$/g, "");
  return clean ? `${SITE_URL}/${lang}/${clean}` : `${SITE_URL}/${lang}`;
};
const xmlEscape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const entries = [];

// Pages localisées : 1 <url> par langue, avec alternates hreflang complets.
for (const { slugs } of routes) {
  const alternates = LANGS.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${HREFLANG[l]}" href="${xmlEscape(url(l, slugs[l]))}" />`
  );
  alternates.push(
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(url("fr", slugs.fr))}" />`
  );
  for (const l of LANGS) {
    entries.push(
      `  <url>\n` +
      `    <loc>${xmlEscape(url(l, slugs[l]))}</loc>\n` +
      `    <lastmod>${TODAY}</lastmod>\n` +
      alternates.join("\n") + "\n" +
      `  </url>`
    );
  }
}

// Articles de blog : canoniques en FR.
for (const slug of uniqueBlogSlugs) {
  entries.push(
    `  <url>\n` +
    `    <loc>${xmlEscape(`${SITE_URL}/fr/blog/${slug}`)}</loc>\n` +
    `    <lastmod>${TODAY}</lastmod>\n` +
    `  </url>`
  );
}

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  entries.join("\n") + "\n" +
  `</urlset>\n`;

writeFileSync(resolve(ROOT, "public/sitemap.xml"), xml, "utf8");

console.log(`✅ sitemap.xml généré`);
console.log(`   Domaine          : ${SITE_URL}`);
console.log(`   Pages localisées : ${routes.length} routes × ${LANGS.length} langues = ${routes.length * LANGS.length} URLs`);
console.log(`   Articles de blog : ${uniqueBlogSlugs.length} URLs`);
console.log(`   TOTAL            : ${entries.length} URLs`);
