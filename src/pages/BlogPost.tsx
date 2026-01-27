import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { getBlogPostBySlug, blogPosts } from "@/data/blogPosts";
import { parseWordPressContent } from "@/utils/parseWordPressContent";
import NotFound from "./NotFound";

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
      {/* Header */}
      <section className="gradient-optimis py-8 md:py-12">
        <div className="container">
          <Link to="/blog">
            <Button variant="ghost" size="sm" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Button>
          </Link>
          <div className="mx-auto max-w-3xl">
            <Badge variant="secondary" className="mb-4">
              {post.category}
            </Badge>
            <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.date).toLocaleDateString("fr-CH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} min de lecture
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      {post.image && (
        <section className="py-6 md:py-8">
          <div className="container">
            <div className="mx-auto max-w-4xl">
              <img
                src={post.image}
                alt={post.title}
                className="w-full rounded-xl shadow-lg"
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
              <Link to="/">Comparer maintenant</Link>
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
                <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`}>
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
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
};

export default BlogPost;
