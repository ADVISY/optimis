import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { resolveLegacyImageUrl } from "@/data/legacyImageResolver";

type DisplayReview = {
  key: string;
  name: string;
  meta?: string;
  note: number;
  text: string;
  image?: string;
};

const TestimonialsCarousel = () => {
  const { t } = useTranslation();

  // Avis approuvés depuis l'admin (modération). Fallback sur les témoignages statiques.
  const { data: approved } = useQuery({
    queryKey: ["public-approved-avis"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("avis")
        .select("id, auteur, ville, note, commentaire")
        .eq("statut", "approuve")
        .order("cree_le", { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data ?? []) as { id: string; auteur: string; ville: string | null; note: number; commentaire: string }[];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const staticReviews: DisplayReview[] = [
    { key: "s-laurent", name: "Laurent Weber", note: 5, text: t("testimonials.laurent"), image: resolveLegacyImageUrl("telechargement-1.jpeg") },
    { key: "s-claire", name: "Claire Muller", note: 5, text: t("testimonials.claire"), image: resolveLegacyImageUrl("telechargement-4.jpeg") },
    { key: "s-philippe", name: "Philippe Dupont", note: 5, text: t("testimonials.philippe"), image: resolveLegacyImageUrl("telechargement-3.jpeg") },
    { key: "s-sophie", name: "Sophie Girard", note: 5, text: t("testimonials.sophie"), image: resolveLegacyImageUrl("telechargement-2.jpeg") },
  ];

  const reviews: DisplayReview[] =
    approved && approved.length > 0
      ? approved.map((a) => ({
          key: a.id,
          name: a.auteur,
          meta: a.ville ?? undefined,
          note: a.note,
          text: a.commentaire,
        }))
      : staticReviews;

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            {t('home.clientReviewsLabel')}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {t('home.clientReviewsTitle')}
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            {t('home.clientReviewsSubtitle')}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review) => (
            <Card key={review.key} className="h-full hover-lift border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {review.image ? (
                    <img
                      src={review.image}
                      alt={review.name}
                      className="w-12 h-12 rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {review.name.trim().charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground">{review.name}</p>
                    {review.meta && (
                      <p className="text-xs text-muted-foreground">{review.meta}</p>
                    )}
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < review.note ? "text-accent text-sm" : "text-muted-foreground/30 text-sm"}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {review.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
