// ============================================================================
// Prerender du <head> par route — SEO statique pour SPA Vite (CSR)
// ============================================================================
// Problème résolu : en CSR, le <head> par page (title, description, canonical,
// hreflang, Open Graph, JSON-LD) est injecté par react-helmet-async APRÈS
// exécution du JS. Les crawlers/scrapers qui n'exécutent pas le JS (Bing,
// DuckDuckGo, Facebook, LinkedIn, WhatsApp, Slack…) ne voient alors QUE le
// <head> par défaut de index.html (la home FR) sur TOUTES les pages.
//
// Ce script génère un fichier HTML statique par route (dist/<lang>/<slug>/
// index.html) avec le bon <head>, en réutilisant la source de vérité unique
// (src/lib/seo.ts + src/utils/localizedRoutes.ts + src/data/blogPosts.ts)
// chargée via Vite (résolution des alias et des imports d'assets).
//
// Le <body> reste le <div id="root"> (rendu client) : Googlebot exécute le JS
// et voit le contenu ; les autres crawlers obtiennent au moins un <head> exact.
//
// USAGE :
//   npm run build:ssg          (= vite build && node scripts/prerender.mjs)
//   node scripts/prerender.mjs (après un vite build)
// ============================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { createServer } from "vite";
import { JSDOM } from "jsdom";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIST = resolve(ROOT, "dist");
const TEMPLATE_PATH = resolve(DIST, "index.html");

// Pages à NE PAS prérender (tunnel/remerciement = noindex, + doublon aboutAlt).
const EXCLUDE = new Set([
  "thankYou", "thankYouMortgage", "thankYouLpp", "thankYouRealEstate",
  "thankYouPartner", "thankYouSubsidy", "thankYouTermination", "thankYouPrenatal",
  "aboutAlt",
]);

if (!existsSync(TEMPLATE_PATH)) {
  console.error("❌ dist/index.html introuvable. Lance d'abord `vite build`.");
  process.exit(1);
}

// ----------------------------------------------------------------------------
// 1) Charger la source de vérité via Vite (alias @, import.meta.env, assets)
// ----------------------------------------------------------------------------
const vite = await createServer({
  root: ROOT,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
  // react-helmet-async est CommonJS → forcer la transformation Vite pour que ses
  // exports nommés (HelmetProvider dans entry-server, Helmet dans Seo.tsx) soient
  // résolvables sous ssrLoadModule.
  ssr: { noExternal: ["react-helmet-async"] },
});

let seoMod, routesMod, blogPosts, renderBody;
try {
  seoMod = await vite.ssrLoadModule("/src/lib/seo.ts");
  routesMod = await vite.ssrLoadModule("/src/utils/localizedRoutes.ts");
  try {
    const blogMod = await vite.ssrLoadModule("/src/data/blogPosts.ts");
    blogPosts = blogMod.blogPosts ?? [];
  } catch (e) {
    console.warn("⚠️  Chargement de blogPosts via Vite impossible, fallback regex :", e.message);
    blogPosts = extractBlogPostsFromSource();
  }
  // Entrée SSR : rend le body réel de chaque route (contenu indexable).
  // Si indisponible, on retombe sur l'ancien comportement (head-only body vide).
  try {
    const entry = await vite.ssrLoadModule("/src/entry-server.tsx");
    renderBody = entry.render;
  } catch (e) {
    console.warn("⚠️  entry-server indisponible, body non prérendu (head-only) :", e.message);
    renderBody = null;
  }
} finally {
  // fermé après extraction
}

const {
  getSeo,
  buildAutoJsonLd,
  buildBreadcrumbSchema,
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  LANGS,
  SEO_LANGS,
} = seoMod;
const { localizedRoutes } = routesMod;

// ----------------------------------------------------------------------------
// 2) Helpers DOM (jsdom) — injection idempotente du <head>
// ----------------------------------------------------------------------------
const template = readFileSync(TEMPLATE_PATH, "utf8");

// Polyfills DOM globaux pour le rendu SSR du blog : src/utils/parseWordPressContent.tsx
// parse le HTML des articles via DOMParser + les constantes Node.* (TEXT_NODE,
// ELEMENT_NODE), toutes deux indisponibles sous Node.js. jsdom (déjà importé) les
// fournit — le rendu client (navigateur) reste inchangé.
{
  const domGlobals = new JSDOM("").window;
  if (!globalThis.DOMParser) globalThis.DOMParser = domGlobals.DOMParser;
  if (!globalThis.Node) globalThis.Node = domGlobals.Node;
}

/** Supprime tous les <meta> correspondants puis insère un unique frais. */
function setMeta(doc, attr, key, content) {
  doc.head.querySelectorAll(`meta[${attr}="${key}"]`).forEach((el) => el.remove());
  if (content == null) return;
  const el = doc.createElement("meta");
  el.setAttribute(attr, key);
  el.setAttribute("content", content);
  doc.head.appendChild(el);
}

function applySeoToDoc(doc, seo, jsonLd) {
  doc.documentElement.setAttribute("lang", seo.lang);

  // <title>
  let titleEl = doc.querySelector("title");
  if (!titleEl) {
    titleEl = doc.createElement("title");
    doc.head.appendChild(titleEl);
  }
  titleEl.textContent = seo.title;

  // Description + robots
  setMeta(doc, "name", "description", seo.description);
  setMeta(
    doc,
    "name",
    "robots",
    seo.noindex ? "noindex, follow" : "index, follow, max-image-preview:large"
  );

  // Canonical
  doc.head.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
  const canon = doc.createElement("link");
  canon.setAttribute("rel", "canonical");
  canon.setAttribute("href", seo.canonical);
  doc.head.appendChild(canon);

  // hreflang alternates
  doc.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
  for (const alt of seo.alternates) {
    const l = doc.createElement("link");
    l.setAttribute("rel", "alternate");
    l.setAttribute("hreflang", alt.hreflang);
    l.setAttribute("href", alt.href);
    doc.head.appendChild(l);
  }

  // Open Graph
  setMeta(doc, "property", "og:title", seo.title);
  setMeta(doc, "property", "og:description", seo.description);
  setMeta(doc, "property", "og:url", seo.canonical);
  setMeta(doc, "property", "og:image", seo.ogImage);
  setMeta(doc, "property", "og:locale", seo.ogLocale);
  doc.head.querySelectorAll('meta[property="og:locale:alternate"]').forEach((el) => el.remove());
  for (const loc of seo.ogLocaleAlternate) {
    const el = doc.createElement("meta");
    el.setAttribute("property", "og:locale:alternate");
    el.setAttribute("content", loc);
    doc.head.appendChild(el);
  }

  // Twitter
  setMeta(doc, "name", "twitter:title", seo.title);
  setMeta(doc, "name", "twitter:description", seo.description);
  setMeta(doc, "name", "twitter:image", seo.ogImage);

  // JSON-LD spécifiques à la route (on conserve Organization + WebSite du template)
  for (const schema of jsonLd) {
    const s = doc.createElement("script");
    s.setAttribute("type", "application/ld+json");
    s.textContent = JSON.stringify(schema);
    doc.head.appendChild(s);
  }
}

/** Injecte le HTML rendu côté serveur dans <div id="root"> (contenu indexable). */
function injectBody(doc, bodyHtml) {
  if (!bodyHtml) return;
  const root = doc.getElementById("root");
  if (root) root.innerHTML = bodyHtml;
}

/**
 * Rend le body d'une route via l'entrée SSR, avec garde-fou : en cas d'échec
 * (composant non SSR-safe), on log et on retombe sur un body vide (head-only)
 * pour cette route SANS casser tout le build.
 */
async function safeRenderBody(url, lang) {
  if (!renderBody) return "";
  try {
    return await renderBody(url, lang);
  } catch (e) {
    ssrFailures.push(url);
    console.warn(`   ⚠️  SSR body échoué → ${url} : ${e.message}`);
    return "";
  }
}

/** Écrit dist/<...segments>/index.html (ou dist/index.html si racine vide). */
function writeRoute(segments, html) {
  const dir = segments.length ? join(DIST, ...segments) : DIST;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html, "utf8");
}

// ----------------------------------------------------------------------------
// 3) Générer les pages localisées (37 routes × 3 langues)
// ----------------------------------------------------------------------------
let countPages = 0;
let countBodies = 0;
const ssrFailures = [];
const routeKeys = Object.keys(localizedRoutes).filter((k) => !EXCLUDE.has(k));

for (const routeKey of routeKeys) {
  const route = localizedRoutes[routeKey];
  // SEO_LANGS (pas LANGS) : le pt est en soft-launch → non prérendu tant qu'il
  // n'est pas exposé au SEO.
  for (const lang of SEO_LANGS) {
    const slug = (route[lang] ?? route.fr ?? "").replace(/^\/+|\/+$/g, "");
    const seo = getSeo({ routeKey, lang });
    const jsonLd = buildAutoJsonLd(routeKey, seo);

    const url = slug ? `/${lang}/${slug}` : `/${lang}`;
    const bodyHtml = await safeRenderBody(url, lang);

    const dom = new JSDOM(template);
    applySeoToDoc(dom.window.document, seo, jsonLd);
    injectBody(dom.window.document, bodyHtml);
    if (bodyHtml) countBodies += 1;

    const segments = slug ? [lang, ...slug.split("/")] : [lang];
    writeRoute(segments, "<!DOCTYPE html>\n" + dom.window.document.documentElement.outerHTML);
    countPages += 1;
  }
}

// ----------------------------------------------------------------------------
// 4) Générer les articles de blog (canoniques FR)
// ----------------------------------------------------------------------------
const seenSlugs = new Set();
let countBlog = 0;

for (const post of blogPosts) {
  if (!post?.slug || seenSlugs.has(post.slug)) continue;
  seenSlugs.add(post.slug);

  const description = post.metaDescription || post.excerpt || "";
  const canonicalPath = `fr/blog/${post.slug}`;
  const seo = getSeo({ lang: "fr", title: post.title, description, canonicalPath });

  const jsonLd = [buildBreadcrumbSchema(seo), buildArticleSchema(post, seo)];

  const url = `/fr/blog/${post.slug}`;
  const bodyHtml = await safeRenderBody(url, "fr");

  const dom = new JSDOM(template);
  applySeoToDoc(dom.window.document, seo, jsonLd);
  injectBody(dom.window.document, bodyHtml);
  if (bodyHtml) countBodies += 1;

  writeRoute(["fr", "blog", post.slug], "<!DOCTYPE html>\n" + dom.window.document.documentElement.outerHTML);
  countBlog += 1;
}

await vite.close();

console.log(`✅ Prerender terminé`);
console.log(`   Domaine            : ${SITE_URL}`);
console.log(`   Pages localisées   : ${countPages} fichiers`);
console.log(`   Articles de blog   : ${countBlog} fichiers`);
console.log(`   TOTAL              : ${countPages + countBlog} pages HTML statiques`);
console.log(`   Body prérendu      : ${countBodies}/${countPages + countBlog} (contenu indexable)`);
if (ssrFailures.length) {
  console.warn(`   ⚠️  Body non rendu : ${ssrFailures.length} route(s) → fallback head-only`);
  for (const u of ssrFailures) console.warn(`        - ${u}`);
}

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
function buildArticleSchema(post, seo) {
  const isoDate = /^\d{4}-\d{2}-\d{2}/.test(post.date || "") ? post.date : undefined;
  const org = { "@type": "Organization", name: SITE_NAME };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: seo.description,
    image: seo.ogImage || DEFAULT_OG_IMAGE,
    author: org,
    publisher: {
      ...org,
      logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE },
    },
    mainEntityOfPage: seo.canonical,
    ...(isoDate ? { datePublished: isoDate, dateModified: isoDate } : {}),
  };
}

/** Fallback : extrait slug/title/excerpt/metaDescription par regex si Vite échoue. */
function extractBlogPostsFromSource() {
  const src = readFileSync(resolve(ROOT, "src/data/blogPosts.ts"), "utf8");
  const start = src.indexOf("rawBlogPosts: BlogPost[] = [");
  const end = src.indexOf("export const blogPosts");
  const region = src.slice(start, end > -1 ? end : undefined);

  const posts = [];
  // Découpe grossière par objet via le champ slug, puis lit les champs voisins.
  const objRe = /\{[\s\S]*?slug:\s*"([^"]+)"[\s\S]*?\}/g;
  // Plus robuste : on parcourt chaque slug et on récupère title/excerpt/metaDescription dans une fenêtre.
  const slugRe = /\bslug:\s*"([^"]+)"/g;
  let m;
  while ((m = slugRe.exec(region)) !== null) {
    const slug = m[1];
    const windowStr = region.slice(m.index, m.index + 4000);
    const title = (windowStr.match(/\btitle:\s*"([^"]*)"/) || [])[1] || slug;
    const excerpt = (windowStr.match(/\bexcerpt:\s*"([^"]*)"/) || [])[1] || "";
    const metaDescription = (windowStr.match(/\bmetaDescription:\s*"([^"]*)"/) || [])[1] || "";
    const date = (windowStr.match(/\bdate:\s*"([^"]*)"/) || [])[1] || "";
    posts.push({ slug, title, excerpt, metaDescription, date });
  }
  // dédoublonnage par slug
  const seen = new Set();
  return posts.filter((p) => (seen.has(p.slug) ? false : seen.add(p.slug)));
}
