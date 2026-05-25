import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { resolveLegacyImageUrl } from "@/data/legacyImageResolver";

const TestimonialsCarousel = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      name: "Laurent Weber",
      textKey: "testimonials.laurent",
      image: resolveLegacyImageUrl("telechargement-1.jpeg"),
    },
    {
      name: "Claire Muller",
      textKey: "testimonials.claire",
      image: resolveLegacyImageUrl("telechargement-4.jpeg"),
    },
    {
      name: "Philippe Dupont",
      textKey: "testimonials.philippe",
      image: resolveLegacyImageUrl("telechargement-3.jpeg"),
    },
    {
      name: "Sophie Girard",
      textKey: "testimonials.sophie",
      image: resolveLegacyImageUrl("telechargement-2.jpeg"),
    },
  ];

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
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="h-full hover-lift border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-bold text-foreground">{testimonial.name}</p>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-accent text-sm">★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(testimonial.textKey)}
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
