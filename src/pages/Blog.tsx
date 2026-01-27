import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { categories, getPaginatedPostsByCategory } from "@/data/blogPosts";

const POSTS_PER_PAGE = 9;

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { posts: filteredPosts, totalPages } = getPaginatedPostsByCategory(
    activeCategory,
    currentPage,
    POSTS_PER_PAGE
  );

  const handleCategoryChange = (categorySlug: string) => {
    setActiveCategory(categorySlug);
    setCurrentPage(1); // Reset to page 1 when changing category
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
                onClick={() => handleCategoryChange(category.slug)}
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span
                      key={`ellipsis-${index}`}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground"
                    >
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page as number)}
                      className="h-9 w-9 p-0"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
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
