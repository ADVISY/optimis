import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { blogPosts } from "@/data/blogPosts";

const BlogPreview = () => {
  const { t } = useTranslation();

  // Get the 4 most recent posts (simulating "most visited")
  const featuredPosts = blogPosts.slice(0, 4);

  return (
    <section className="py-16 md:py-20 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
              {t('home.blogLabel')}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              {t('home.blogTitle')}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl">
              {t('home.blogSubtitle')}
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <LocalizedLink to="/blog" className="flex items-center gap-2">
              {t('home.viewAllArticles')}
              <ArrowRight className="h-4 w-4" />
            </LocalizedLink>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {featuredPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.slug}`}>
              <Card className="group h-full overflow-hidden border-0 shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="relative aspect-[4/3] overflow-hidden">
                  {post.image && (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <Badge 
                    className="absolute right-3 top-3 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    {post.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <time className="text-xs text-muted-foreground">
                    {new Date(post.date).toLocaleDateString("fr-CH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </time>
                  <h3 className="mt-2 text-sm font-bold uppercase leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;
