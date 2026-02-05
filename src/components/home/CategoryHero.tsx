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
    <section className="gradient-optimis min-h-[calc(100vh-6rem)] flex flex-col justify-between overflow-x-hidden overflow-y-visible relative pb-4 md:pb-8">
      <div className="container relative flex-1 flex items-start md:items-center">
        <div className="grid items-center gap-2 lg:grid-cols-2 w-full py-3 md:py-8 lg:py-12">
          <div className="space-y-2 md:space-y-5 animate-fade-in z-10 relative text-center md:text-left min-w-0">
            {/* Breadcrumb */}
            <p className="text-[10px] md:text-sm font-medium text-muted-foreground break-words">
              <LocalizedLink to="/" className="hover:text-primary transition-colors">
                {t("common.home")}
              </LocalizedLink>{" "}
              <span className="mx-1">›</span> {breadcrumbKey ? t(breadcrumbKey) : pageTitle}
            </p>

            {/* 5 Gold Stars */}
            <div className="flex gap-1 md:gap-1.5 justify-center md:justify-start">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-accent text-lg md:text-2xl drop-shadow-sm">
                  ★
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="font-heading text-2xl sm:text-3xl font-black leading-[1.05] text-foreground md:text-4xl lg:text-5xl xl:text-6xl tracking-tight uppercase break-words">
              {pageTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg text-muted-foreground lg:text-xl max-w-lg leading-relaxed mx-auto md:mx-0 break-words">
              {subtitle}
            </p>

            {/* CTA Button */}
            <div className="flex flex-wrap gap-4 pt-2 md:pt-2 justify-center md:justify-start">
              <Button
                size="default"
                className="gap-2 animate-fade-in-delay h-11 md:h-12 text-sm md:text-base px-6"
                onClick={onButtonClick}
              >
                <ButtonIcon className="h-4 w-4 md:h-5 md:w-5" />
                {buttonLabel}
              </Button>
            </div>
          </div>

          {/* Mascot - desktop only, positioned right */}
          <div className="hidden lg:flex justify-end items-end absolute right-4 xl:right-8 2xl:right-16 bottom-0 translate-y-16 z-10">
            <img
              src={mascotPointing}
              alt="Mascotte Optimis"
              className="h-[520px] xl:h-[600px] 2xl:h-[680px] max-w-full w-auto drop-shadow-2xl animate-fade-in"
            />
          </div>
        </div>
      </div>

      {/* Mobile mascot - large, centered at bottom */}
      <div className="md:hidden flex justify-center -mb-4 relative z-10">
        <img
          src={mascotPointing}
          alt="Mascotte Optimis"
          className="h-64 max-w-[92vw] w-auto drop-shadow-2xl animate-fade-in"
        />
      </div>

      {/* Quick Selection Bar - full width, compact height */}
      <div className="container relative z-20 mt-2 md:mt-6">
        <div className="bg-background rounded-xl md:rounded-2xl shadow-premium p-3 md:p-4 border">
          {/* Mobile: vertical list */}
          <div className="md:hidden flex flex-col gap-1">
            {insuranceCards.map((card) => (
              <LocalizedLink
                key={card.href}
                to={card.href}
                className="flex flex-col items-center gap-1.5 py-3 rounded-lg transition-all duration-300 hover:bg-secondary group"
              >
                <div className={`${card.color} transition-transform duration-300 group-hover:scale-110`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="font-semibold text-sm text-foreground">{t(card.titleKey)}</span>
              </LocalizedLink>
            ))}
          </div>
          {/* Desktop: horizontal grid */}
          <div className="hidden md:grid grid-cols-4 gap-3">
            {insuranceCards.map((card) => (
              <LocalizedLink
                key={card.href}
                to={card.href}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:bg-secondary hover:-translate-y-1 hover:shadow-card group"
              >
                <div className={`${card.color} transition-transform duration-300 group-hover:scale-110`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <span className="font-semibold text-base text-foreground">{t(card.titleKey)}</span>
              </LocalizedLink>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryHero;
