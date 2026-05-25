import { useParams } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import { parseWordPressContent } from "@/utils/parseWordPressContent";
import NotFound from "./NotFound";
import LocalizedLink from "@/components/LocalizedLink";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  if (!post) {
    return <NotFound />;
  }

  // Get related posts from same category
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  // Parse HTML content if it contains HTML tags, otherwise use simple parser
  const isHtmlContent = post.content.includes('<') && post.content.includes('>');
  const renderedContent = isHtmlContent 
    ? parseWordPressContent(post.content)
    : parseWordPressContent(post.content);

  return (
    <Layout>
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
            {renderedContent}
          </div>
        </div>
      </article>

      {/* CTA */}
      <section className="bg-secondary/30 py-12 md:py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground">
            Besoin d'aide pour vos assurances ?
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Nos experts sont là pour vous conseiller gratuitement et vous aider
            à trouver les meilleures offres.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <LocalizedLink to="/">Comparer maintenant</LocalizedLink>
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
