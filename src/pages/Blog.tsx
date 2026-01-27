import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { blogPosts, categories, getBlogPostsByCategory } from "@/data/blogPosts";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const filteredPosts = getBlogPostsByCategory(activeCategory);

  return (
    <Layout>
      {/* Header */}
      <section className="gradient-optimis py-12 md:py-16">
        <div className="container text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Blog Optimis
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Conseils, guides et actualités sur les assurances en Suisse pour
            vous aider à faire les meilleurs choix.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b bg-background py-4">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.slug}
                variant={activeCategory === category.slug ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.slug)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="flex h-full flex-col p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </div>
                    </div>
                    <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-foreground">
                      {post.title}
                    </h2>
                    <p className="mb-4 line-clamp-3 flex-1 text-sm text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <time className="text-xs text-muted-foreground">
                        {new Date(post.date).toLocaleDateString("fr-CH", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </time>
                      <span className="flex items-center gap-1 text-sm font-medium text-primary">
                        Lire plus
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Aucun article dans cette catégorie pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-secondary/30 py-12 md:py-16">
        <div className="container text-center">
          <h2 className="mb-4 text-2xl font-bold text-foreground md:text-3xl">
            Restez informé
          </h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Recevez nos derniers articles et conseils pour économiser sur vos
            assurances directement dans votre boîte mail.
          </p>
          <Button size="lg">S'abonner à la newsletter</Button>
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
