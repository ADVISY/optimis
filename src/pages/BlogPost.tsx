import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import { parseWordPressContent } from "@/utils/parseWordPressContent";
import NotFound from "./NotFound";
import LocalizedLink from "@/components/LocalizedLink";
import Seo from "@/components/Seo";
import { SITE_URL } from "@/lib/seo";

// ----------------------------------------------------------------------------
// CTA contextuel par catégorie d'article (tunnel SEO → formulaire précis).
// L'article est la porte d'entrée organique ; le bouton renvoie vers LE bon
// formulaire de comparaison/demande plutôt que vers une home générique.
// `to` = slug FR de la landing (LocalizedLink le résout dans la langue courante).
// ----------------------------------------------------------------------------
type BlogCta = {
  to: string;
  heading: string;
  subtext: string;
  button: string;
};

const DEFAULT_CTA: BlogCta = {
  to: "/",
  heading: "Besoin d'aide pour vos assurances ?",
  subtext:
    "Nos experts comparent gratuitement les offres et vous orientent vers la solution la plus avantageuse.",
  button: "Comparer mes assurances",
};

const CATEGORY_CTA: Record<string, BlogCta> = {
  "Assurance voiture": {
    to: "/assurance-voiture-landing",
    heading: "Payez-vous trop cher votre assurance auto ?",
    subtext:
      "Comparez gratuitement les primes des assureurs suisses et économisez en quelques minutes.",
    button: "Comparer les assurances auto",
  },
  "Assurance santé": {
    to: "/assurance-maladie-landing",
    heading: "Réduisez vos primes d'assurance maladie",
    subtext:
      "Comparez les caisses maladie et trouvez la couverture au meilleur prix pour 2026.",
    button: "Comparer les assurances maladie",
  },
  "Aide assurance maladie": {
    to: "/subside-assurance-maladie-demande",
    heading: "Avez-vous droit à un subside ?",
    subtext:
      "Vérifiez votre éligibilité et faites votre demande de réduction de primes en quelques clics.",
    button: "Demander mon subside",
  },
  "Hypothèque": {
    to: "/hypotheque-offres",
    heading: "Financez votre bien au meilleur taux",
    subtext:
      "Comparez gratuitement les offres hypothécaires des banques et assureurs suisses.",
    button: "Comparer les offres hypothécaires",
  },
  "Assurance habitation": {
    to: "/assurance-menage-landing",
    heading: "Protégez votre logement au juste prix",
    subtext:
      "Comparez les assurances ménage et RC et trouvez la meilleure couverture pour vous.",
    button: "Comparer l'assurance ménage",
  },
  "Assurance ménage": {
    to: "/assurance-menage-landing",
    heading: "Protégez votre logement au juste prix",
    subtext:
      "Comparez les assurances ménage et RC et trouvez la meilleure couverture pour vous.",
    button: "Comparer l'assurance ménage",
  },
  "Résiliation": {
    to: "/resiliation-assurance",
    heading: "Besoin de résilier une assurance ?",
    subtext:
      "Générez votre lettre de résiliation et trouvez une meilleure offre sans coupure de couverture.",
    button: "Résilier mon assurance",
  },
  "Assurance vie": {
    to: "/assurance-vie",
    heading: "Protégez vos proches avec une assurance vie",
    subtext:
      "Comparez les solutions de prévoyance et de protection familiale adaptées à votre situation.",
    button: "Comparer l'assurance vie",
  },
  "Assurance retraite": {
    to: "/3eme-pilier-offres",
    heading: "Préparez votre retraite et réduisez vos impôts",
    subtext:
      "Comparez les offres de 3e pilier et optimisez votre prévoyance en toute simplicité.",
    button: "Comparer les offres 3e pilier",
  },
  "3ème pilier": {
    to: "/3eme-pilier-offres",
    heading: "Préparez votre retraite et réduisez vos impôts",
    subtext:
      "Comparez les offres de 3e pilier et optimisez votre prévoyance en toute simplicité.",
    button: "Comparer les offres 3e pilier",
  },
  "2ᵉ pilier ou LPP": {
    to: "/avoirs-lpp-libre-passage",
    heading: "Optimisez vos avoirs de 2e pilier",
    subtext:
      "Comparez les solutions de libre passage et faites fructifier vos avoirs LPP.",
    button: "Comparer mes avoirs LPP",
  },
  "Protection juridique": {
    to: "/protection-juridique-landing",
    heading: "Défendez vos droits sereinement",
    subtext:
      "Comparez les assurances de protection juridique et choisissez la meilleure couverture.",
    button: "Comparer la protection juridique",
  },
};

// CTA inline compact, injecté EN HAUT de l'article (avant lecture) et AU MILIEU
// du contenu. Objectif funnel SEO : capter l'intention dès l'arrivée organique
// et la relancer en cours de lecture, sans attendre le CTA de fin d'article.
// `not-prose` neutralise les styles typographiques du wrapper `prose`.
const InlineBlogCta = ({ cta }: { cta: BlogCta }) => (
  <aside className="not-prose my-8 rounded-xl border border-primary/20 bg-secondary/30 p-5 sm:p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-bold text-foreground">{cta.heading}</p>
        <p className="mt-1 text-sm text-muted-foreground">{cta.subtext}</p>
      </div>
      <Button asChild className="shrink-0">
        <LocalizedLink to={cta.to}>{cta.button}</LocalizedLink>
      </Button>
    </div>
  </aside>
);

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <NotFound />;
  }

  // --- SEO article ---
  const description = post.metaDescription || post.excerpt;
  const absoluteImage = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `${SITE_URL}${post.image.startsWith("/") ? "" : "/"}${post.image}`
    : `${SITE_URL}/logo-optimis.png`;
  const isoDate = /^\d{4}-\d{2}-\d{2}/.test(post.date) ? post.date : undefined;
  const articleSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    image: absoluteImage,
    author: { "@type": "Organization", name: "Optimis" },
    publisher: {
      "@type": "Organization",
      name: "Optimis",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-optimis.png` },
    },
    mainEntityOfPage: `${SITE_URL}/fr/blog/${post.slug}`,
    ...(isoDate ? { datePublished: isoDate, dateModified: isoDate } : {}),
  };

  // CTA contextuel : on route vers le formulaire correspondant à la catégorie
  // de l'article (fallback sur le comparateur générique si catégorie inconnue).
  const cta = CATEGORY_CTA[post.category] ?? DEFAULT_CTA;

  // Get related posts from same category
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Rendu du contenu + maillage interne (normalisation des liens existants vers
  // /fr/... et auto-injection de liens vers les pages comparateur).
  const blogSlugSet = new Set(blogPosts.map((p) => p.slug));
  const renderedContent = parseWordPressContent(post.content, {
    lang: "fr",
    blogSlugs: blogSlugSet,
  });

  // Point d'injection du CTA milieu d'article : milieu du flux de blocs rendus.
  // On n'injecte que si l'article est assez long (sinon top + milieu se touchent).
  const midIndex =
    renderedContent.length >= 6
      ? Math.floor(renderedContent.length / 2)
      : -1;

  return (
    <Layout>
      <Seo
        title={post.title}
        description={description}
        image={absoluteImage}
        canonicalPath={`fr/blog/${post.slug}`}
        jsonLd={articleSchema}
      />
      {/* Header with title */}
      <section className="bg-secondary/20 py-8 md:py-12">
        <div className="container">
          <LocalizedLink to="/blog">
            <Button variant="ghost" size="sm" className="mb-4 gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Button>
          </LocalizedLink>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-2xl font-bold uppercase tracking-tight text-foreground md:text-3xl lg:text-4xl">
              {post.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Featured Image - Full width within container */}
      {post.image && (
        <section className="bg-secondary/20 pb-8">
          <div className="container">
            <div className="mx-auto max-w-4xl overflow-hidden rounded-xl">
              <img
                src={post.image}
                alt={post.title}
                className="w-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <article className="py-8 md:py-12">
        <div className="container">
          <div className="prose prose-lg mx-auto max-w-3xl">
            {/* CTA haut d'article — capte l'intention avant la lecture */}
            <InlineBlogCta cta={cta} />
            {midIndex > 0 ? (
              <>
                {renderedContent.slice(0, midIndex)}
                {/* CTA milieu d'article — relance en cours de lecture */}
                <InlineBlogCta cta={cta} />
                {renderedContent.slice(midIndex)}
              </>
            ) : (
              renderedContent
            )}
          </div>
        </div>
      </article>

      {/* CTA contextuel — renvoie vers le formulaire lié à la catégorie de l'article */}
      <section className="bg-secondary/30 py-12 md:py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            {cta.heading}
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            {cta.subtext}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <LocalizedLink to={cta.to}>{cta.button}</LocalizedLink>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://calendly.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Prendre rendez-vous
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container">
            <h2 className="mb-8 text-center text-2xl font-bold text-foreground">
              Articles similaires
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <LocalizedLink key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
                  <div className="rounded-lg border p-4 transition-all hover:border-primary hover:shadow-md">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {relatedPost.category}
                    </Badge>
                    <h3 className="line-clamp-2 font-semibold text-foreground">
                      {relatedPost.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {relatedPost.excerpt}
                    </p>
                  </div>
                </LocalizedLink>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BlogPost;
