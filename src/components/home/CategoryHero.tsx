import { LucideIcon, Car, Heart, Scale, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import LocalizedLink from "@/components/LocalizedLink";
import mascotPointing from "@/assets/mascotte-optimis-hd.png";

interface CategoryHeroProps {
  pageTitle: string;
  subtitle: string;
  buttonLabel: string;
  buttonIcon: LucideIcon;
  onButtonClick: () => void;
  breadcrumbKey?: string;
}

const insuranceCards = [
  {
    icon: Car,
    titleKey: "nav.carInsurance",
    href: "/assurance-voiture",
    color: "text-blue-600",
  },
  {
    icon: Heart,
    titleKey: "nav.healthInsurance",
    href: "/assurance-sante",
    color: "text-red-500",
  },
  {
    icon: Scale,
    titleKey: "nav.legalProtection",
    href: "/protection-juridique",
    color: "text-purple-600",
  },
  {
    icon: Home,
    titleKey: "nav.homeInsurance",
    href: "/assurance-menage",
    color: "text-orange-500",
  },
];

const CategoryHero = ({
  pageTitle,
  subtitle,
  buttonLabel,
  buttonIcon: ButtonIcon,
  onButtonClick,
  breadcrumbKey,
}: CategoryHeroProps) => {
  const { t } = useTranslation();

  return (
    <section className="gradient-optimis min-h-[50vh] md:min-h-[calc(100vh-6rem)] flex flex-col justify-between overflow-visible relative pb-6 md:pb-8">
      <div className="container relative flex-1 flex items-center">
        <div className="grid items-center gap-4 lg:grid-cols-2 w-full py-6 md:py-8 lg:py-12">
          <div className="space-y-4 md:space-y-5 animate-fade-in z-10 relative">
            {/* Breadcrumb */}
            <p className="text-xs md:text-sm font-medium text-muted-foreground">
              <LocalizedLink to="/" className="hover:text-primary transition-colors">
                {t("common.home")}
              </LocalizedLink>{" "}
              / {breadcrumbKey ? t(breadcrumbKey) : pageTitle}
            </p>

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-3xl font-black leading-[1.1] text-foreground md:text-4xl lg:text-5xl xl:text-6xl tracking-tight">
              {pageTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-muted-foreground lg:text-xl max-w-lg leading-relaxed">
              {subtitle}
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Button size="lg" className="gap-2 animate-fade-in-delay w-full sm:w-auto text-sm md:text-base" onClick={onButtonClick}>
                <ButtonIcon className="h-4 w-4 md:h-5 md:w-5" />
                {buttonLabel}
              </Button>
            </div>
          </div>

          {/* Mascot - large, behind the selection bar */}
          <div className="hidden lg:flex justify-end items-end absolute right-4 xl:right-8 2xl:right-16 bottom-0 translate-y-16 z-10">
            <img
              src={mascotPointing}
              alt="Mascotte Optimis"
              className="h-[520px] xl:h-[600px] 2xl:h-[680px] w-auto drop-shadow-2xl animate-fade-in"
            />
          </div>
        </div>
      </div>

      {/* Quick Selection Bar - full width, compact height */}
      <div className="container relative z-20 mt-4 md:mt-6">
        <div className="bg-background rounded-xl md:rounded-2xl shadow-premium p-2 md:p-3 lg:p-4 border">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 md:gap-2 lg:gap-3">
            {insuranceCards.map((card) => (
              <LocalizedLink
                key={card.href}
                to={card.href}
                className="flex items-center gap-1.5 md:gap-2 lg:gap-3 p-2 md:p-3 rounded-lg md:rounded-xl transition-all duration-300 hover:bg-secondary hover:-translate-y-1 hover:shadow-card group"
              >
                <div className={`${card.color} transition-transform duration-300 group-hover:scale-110`}>
                  <card.icon className="h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                </div>
                <span className="font-semibold text-xs md:text-sm lg:text-base text-foreground line-clamp-1">
                  {t(card.titleKey)}
                </span>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryHero;
