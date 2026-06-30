import React from 'react';
import { Link } from 'react-router-dom';
import { resolveContentImage } from '@/data/contentImageMapping';

/**
 * Parse WordPress Gutenberg content to React components.
 * Handles headings, paragraphs, lists, blockquotes, images, links, and tables.
 *
 * SEO — maillage interne :
 *  - Les liens internes existants sont normalisés vers /<lang>/... (préfixe de
 *    langue garanti, slash final retiré, vieux slugs WordPress morts remappés)
 *    puis rendus via <Link> React Router (navigation SPA, pas de rechargement).
 *  - Des liens contextuels sont auto-injectés vers les pages comparateur sur la
 *    1re occurrence d'un mot-clé, avec garde-fous (jamais dans un titre/lien,
 *    plafond par article, pas de doublon si la page est déjà liée à la main).
 */

const SUPPORTED_LANGS = ['fr', 'de', 'it'];

// Vieux slugs WordPress sans équivalent SPA → cible valide la plus proche.
// (chemins sans préfixe de langue ; le préfixe /<lang>/ est ajouté ensuite)
const REDIRECT_MAP: Record<string, string> = {
  'assurance-sante-comparatif': 'assurance-maladie-landing',
  'avs-subsides': 'subside-assurance-maladie',
  'e-demarche-subside': 'subside-assurance-maladie-demande',
  'subside-neuchatel': 'subside-assurance-maladie',
  'assurance-casco-complete': 'blog/assurance-casco-complete',
};

// Auto-liens : phrases-clés → page cible (slug FR, sans préfixe de langue).
// Ordre = priorité (les règles les plus spécifiques d'abord). Une seule règle
// peut viser une cible donnée, et chaque cible n'est liée qu'une fois par article.
interface AutoLinkRule {
  to: string;
  phrases: string[];
  regex: RegExp;
}

const buildRule = (to: string, phrases: string[]): AutoLinkRule => ({
  to,
  phrases,
  // (début ou caractère non-lettre) + phrase + (pas suivi d'une lettre).
  // On capture le préfixe pour le réémettre ; pas de lookbehind (compat Safari).
  regex: new RegExp(`(^|[^\\p{L}])(${phrases.join('|')})(?![\\p{L}])`, 'iu'),
});

const AUTO_LINK_RULES: AutoLinkRule[] = [
  buildRule('protection-juridique-landing', ['protection juridique']),
  buildRule('assurance-complementaire-offres', [
    'assurance compl[ée]mentaire',
    'compl[ée]mentaire sant[ée]',
  ]),
  buildRule('assurance-maladie-landing', [
    'assurance maladie',
    'caisse maladie',
    'assurance sant[ée]',
  ]),
  buildRule('assurance-voiture-landing', [
    'assurance voiture',
    'assurance auto(?:mobile)?',
  ]),
  buildRule('assurance-menage-landing', [
    'assurance m[ée]nage',
    'responsabilit[ée] civile',
  ]),
  buildRule('assurance-vie', ['assurance vie']),
  buildRule('3eme-pilier-offres', [
    '3[eè]me pilier',
    '3e pilier',
    'troisi[èe]me pilier',
    'pilier 3a?',
  ]),
  buildRule('avoirs-lpp-libre-passage', [
    'libre passage',
    'avoirs?\\s+lpp',
    '2[eè]me pilier',
    '2e pilier',
  ]),
  buildRule('hypotheque-offres', [
    'pr[êe]t hypoth[ée]caire',
    'hypoth[èe]que',
  ]),
  buildRule('subside-assurance-maladie-demande', ['subsides?']),
  buildRule('resiliation-assurance', [
    'r[ée]siliation',
    'r[ée]silier',
  ]),
];

// Plafond d'auto-liens par article (au-delà : sur-optimisation).
const MAX_AUTO_LINKS = 6;

const INTERNAL_LINK_CLASS = 'text-primary hover:underline font-medium';

// Balises dont le contenu ne doit jamais recevoir d'auto-lien.
const NO_AUTOLINK_TAGS = new Set([
  'a', 'h2', 'h3', 'h4', 'blockquote', 'cite', 'figure',
]);

interface ParseOptions {
  /** Langue de rendu (préfixe d'URL des liens internes). Défaut : "fr". */
  lang?: string;
  /** Active l'auto-injection de liens contextuels. Défaut : true. */
  autoLink?: boolean;
  /** Slugs d'articles connus → un slug racine devient /<lang>/blog/<slug>. */
  blogSlugs?: Set<string>;
}

interface ParseContext {
  lang: string;
  autoLink: boolean;
  blogSlugs: Set<string>;
  /** Cibles déjà liées (manuellement ou en auto) → pas de doublon. */
  linkedTargets: Set<string>;
  /** Compteur partagé d'auto-liens posés. */
  count: { n: number };
  /** Identifiant incrémental pour les clés React. */
  key: { n: number };
}

/**
 * Normalise un href vers une URL interne canonique /<lang>/...
 * Renvoie null si l'href est cassé (ex. href = texte d'ancre) ou externe.
 */
function normalizeInternalHref(
  rawHref: string,
  ctx: ParseContext,
): { href: string; external: false } | { href: string; external: true } | null {
  const href = rawHref.trim();
  if (!href) return null;

  // Ancres, mail, tel → laissés tels quels (non internes).
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return { href, external: true };
  }

  let path = href;

  // URL absolue : externe si autre domaine, sinon on garde le pathname.
  if (/^https?:\/\//i.test(href)) {
    let url: URL;
    try {
      url = new URL(href);
    } catch {
      return null; // href malformé
    }
    if (!url.hostname.includes('le-comparateur-optimis.ch')) {
      return { href, external: true };
    }
    path = url.pathname;
  } else if (!href.startsWith('/')) {
    // Ni URL, ni chemin absolu : href cassé (souvent le texte d'ancre).
    // On rejette si ça ne ressemble pas à un slug (espaces / majuscules).
    if (/[\s]/.test(href) || /[A-Z]/.test(href)) return null;
    path = '/' + href;
  }

  // Nettoyage : un seul slash initial, pas de slash final.
  path = path.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  if (path === '' || path === '/') return { href: `/${ctx.lang}`, external: false };

  const segs = path.split('/').filter(Boolean);

  // Déjà préfixé par une langue → on garde.
  if (SUPPORTED_LANGS.includes(segs[0])) {
    return { href: '/' + segs.join('/'), external: false };
  }

  // Chemin racine (vieux WordPress) : remap, ou route blog, sinon best-effort.
  const joined = segs.join('/');
  let target = REDIRECT_MAP[joined];
  if (!target) {
    target = ctx.blogSlugs.has(joined) ? `blog/${joined}` : joined;
  }
  return { href: `/${ctx.lang}/${target}`, external: false };
}

/**
 * Transforme une chaîne de texte en nœuds React, en posant des auto-liens
 * sur la 1re occurrence des mots-clés (hors balises interdites, plafonné).
 */
function autoLinkText(text: string, ctx: ParseContext): React.ReactNode[] {
  if (!ctx.autoLink || ctx.count.n >= MAX_AUTO_LINKS || !text.trim()) {
    return [text];
  }

  // Collecte des candidats (1re occurrence par règle non encore liée).
  const candidates: { index: number; length: number; text: string; to: string }[] = [];
  for (const rule of AUTO_LINK_RULES) {
    if (ctx.linkedTargets.has(rule.to)) continue;
    rule.regex.lastIndex = 0;
    const m = rule.regex.exec(text);
    if (!m) continue;
    const prefix = m[1] ?? '';
    const keyword = m[2] ?? '';
    candidates.push({
      index: m.index + prefix.length,
      length: keyword.length,
      text: keyword,
      to: rule.to,
    });
  }
  if (candidates.length === 0) return [text];

  // Plus tôt d'abord ; à index égal, le plus long d'abord.
  candidates.sort((a, b) => a.index - b.index || b.length - a.length);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (const c of candidates) {
    if (ctx.count.n >= MAX_AUTO_LINKS) break;
    if (c.index < cursor) continue; // chevauche une zone déjà consommée
    if (ctx.linkedTargets.has(c.to)) continue;
    if (c.index > cursor) nodes.push(text.slice(cursor, c.index));
    nodes.push(
      <Link key={`al-${ctx.key.n++}`} to={`/${ctx.lang}/${c.to}`} className={INTERNAL_LINK_CLASS}>
        {c.text}
      </Link>,
    );
    ctx.linkedTargets.add(c.to);
    ctx.count.n += 1;
    cursor = c.index + c.length;
  }
  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

export function parseWordPressContent(
  content: string,
  options: ParseOptions = {},
): React.ReactNode[] {
  const ctx: ParseContext = {
    lang: options.lang && SUPPORTED_LANGS.includes(options.lang) ? options.lang : 'fr',
    autoLink: options.autoLink !== false,
    blogSlugs: options.blogSlugs ?? new Set(),
    linkedTargets: new Set(),
    count: { n: 0 },
    key: { n: 0 },
  };

  // Évite les doublons : si une page comparateur est déjà liée à la main dans le
  // HTML, on ne la re-linkera pas en auto.
  for (const rule of AUTO_LINK_RULES) {
    if (content.includes(rule.to)) ctx.linkedTargets.add(rule.to);
  }

  // Remove WordPress block comments
  const cleanContent = content
    .replace(/<!-- wp:[^>]+-->/g, '')
    .replace(/<!-- \/wp:[^>]+-->/g, '')
    .trim();

  const elements: React.ReactNode[] = [];

  // DOMParser : disponible côté navigateur (rendu CSR du blog).
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${cleanContent}</div>`, 'text/html');
  const container = doc.body.firstChild;

  if (!container) return elements;

  const parseNode = (node: Node, index: number, noLink: boolean): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text.trim()) return null;
      if (noLink) return text;
      const parts = autoLinkText(text, ctx);
      if (parts.length === 1 && typeof parts[0] === 'string') return parts[0];
      return <React.Fragment key={index}>{parts}</React.Fragment>;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const childNoLink = noLink || NO_AUTOLINK_TAGS.has(tagName);
    const children = Array.from(element.childNodes)
      .map((child, i) => parseNode(child, i, childNoLink))
      .filter(Boolean);

    switch (tagName) {
      case 'h2':
        return (
          <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-foreground">
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={index} className="mb-3 mt-6 text-xl font-semibold text-foreground">
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4 key={index} className="mb-2 mt-4 text-lg font-semibold text-foreground">
            {children}
          </h4>
        );
      case 'p':
        if (!element.textContent?.trim()) return null;
        return (
          <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
            {children}
          </p>
        );
      case 'blockquote':
        return (
          <blockquote key={index} className="my-6 border-l-4 border-primary bg-secondary/30 py-3 px-4 italic text-muted-foreground rounded-r-md">
            {children}
          </blockquote>
        );
      case 'cite':
        return (
          <cite key={index} className="not-italic text-foreground/80">
            {children}
          </cite>
        );
      case 'ul':
        return (
          <ul key={index} className="mb-4 ml-6 list-disc space-y-2 text-foreground/90">
            {children}
          </ul>
        );
      case 'ol':
        return (
          <ol key={index} className="mb-4 ml-6 list-decimal space-y-2 text-foreground/90">
            {children}
          </ol>
        );
      case 'li':
        return (
          <li key={index} className="leading-relaxed">
            {children}
          </li>
        );
      case 'a': {
        const rawHref = element.getAttribute('href') || '';
        const normalized = normalizeInternalHref(rawHref, ctx);

        // href cassé (ex. href = texte d'ancre) → on rend le texte sans lien.
        if (!normalized) {
          return <React.Fragment key={index}>{children}</React.Fragment>;
        }

        // Lien externe (ou ancre/mail/tel) → <a> classique, nouvel onglet si http.
        if (normalized.external) {
          const isHttp = /^https?:\/\//i.test(normalized.href);
          return (
            <a
              key={index}
              href={normalized.href}
              className={INTERNAL_LINK_CLASS}
              target={isHttp ? '_blank' : undefined}
              rel={isHttp ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          );
        }

        // Lien interne → <Link> (navigation SPA + href crawlable).
        return (
          <Link key={index} to={normalized.href} className={INTERNAL_LINK_CLASS}>
            {children}
          </Link>
        );
      }
      case 'strong':
      case 'b':
        return (
          <strong key={index} className="font-semibold">
            {children}
          </strong>
        );
      case 'em':
      case 'i':
        return (
          <em key={index} className="italic">
            {children}
          </em>
        );
      case 'figure':
        if (children.length === 0) return null;
        return (
          <figure key={index} className="my-6">
            {children}
          </figure>
        );
      case 'img': {
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || '';
        // Try to resolve WordPress images to local assets
        const isWpImage = src.includes('le-comparateur-optimis.ch/wp-content/uploads') || src.includes('${WP_IMAGE_BASE}') || src.includes('WP_IMAGE_BASE');
        const resolvedSrc = isWpImage ? resolveContentImage(src) : src;

        if (isWpImage && !resolvedSrc) {
          return null; // No local replacement found, hide it
        }

        return (
          <img
            key={index}
            src={resolvedSrc || src}
            alt={alt}
            className="w-full rounded-lg shadow-md"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
      case 'table':
        return (
          <div key={index} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        );
      case 'thead':
        return (
          <thead key={index} className="bg-secondary">
            {children}
          </thead>
        );
      case 'tbody':
        return <tbody key={index}>{children}</tbody>;
      case 'tr':
        return <tr key={index} className="border-b border-border">{children}</tr>;
      case 'th':
        return (
          <th key={index} className="px-4 py-2 text-left font-semibold text-foreground">
            {children}
          </th>
        );
      case 'td':
        return (
          <td key={index} className="px-4 py-2 text-foreground/90">
            {children}
          </td>
        );
      case 'br':
        return <br key={index} />;
      case 'div':
      case 'span':
        return <React.Fragment key={index}>{children}</React.Fragment>;
      default:
        return children.length > 0 ? (
          <React.Fragment key={index}>{children}</React.Fragment>
        ) : null;
    }
  };

  Array.from(container.childNodes).forEach((node, index) => {
    const parsed = parseNode(node, index, false);
    if (parsed) {
      elements.push(parsed);
    }
  });

  return elements;
}

/**
 * Simple markdown-like parser for simpler content format
 */
export function parseSimpleContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-foreground">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="mb-3 mt-6 text-xl font-semibold text-foreground">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={index}
          className="my-4 border-l-4 border-primary bg-secondary/30 py-2 pl-4 italic text-muted-foreground"
        >
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-6 list-disc text-foreground">
          {parseBoldText(line.replace('- ', ''))}
        </li>
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={index} className="ml-6 list-decimal text-foreground">
          {parseBoldText(line.replace(/^\d+\. /, ''))}
        </li>
      );
    } else {
      elements.push(
        <p key={index} className="mb-4 text-foreground/90">
          {parseBoldText(line)}
        </p>
      );
    }
  });

  return elements;
}

function parseBoldText(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  );
}
