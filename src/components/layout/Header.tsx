import { forwardRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { 
  Menu, 
  Phone, 
  HeartPulse, 
  Car, 
  Scale, 
  Home, 
  Plus,
  Smartphone,
  CreditCard,
  FileX,
  Banknote,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LocalizedLink from "@/components/LocalizedLink";
import logo from "@/assets/logo.svg";
import llamaMascot from "@/assets/llama-mascot.png";

// Assurances menu data
const assurancesCategories = [
  { 
    id: "sante",
    labelKey: "nav.healthInsurance", 
    icon: HeartPulse,
    href: "/assurance-sante",
    subLinks: [
      { labelKey: "megaMenu.healthModel", href: "/blog/quel-modele-dassurance-maladie-choisir" },
      { labelKey: "megaMenu.dentalInsurance", href: "/blog/assurance-dentaire-complementaire-en-suisse-reponses-aux-questions-essentielles" },
      { labelKey: "megaMenu.healthChange2024", href: "/blog/changement-dassurance-maladie-delais-et-demarches-en-2024" },
      { labelKey: "megaMenu.healthSubsidy", href: "/blog/subside-dassurance-maladie-comment-ca-marche-et-comment-faire-sa-demande" },
    ]
  },
  { 
    id: "vehicule",
    labelKey: "nav.carInsurance", 
    icon: Car,
    href: "/assurance-voiture",
    subLinks: [
      { labelKey: "megaMenu.compareAutoInsurance", href: "/assurance-voiture" },
    ]
  },
  { 
    id: "juridique",
    labelKey: "nav.legalProtection", 
    icon: Scale,
    href: "/protection-juridique",
    subLinks: [
      { labelKey: "megaMenu.legalProtectionSwitzerland", href: "/blog/le-meilleur-de-la-protection-juridique-en-suisse" },
    ]
  },
  { 
    id: "menage",
    labelKey: "nav.homeInsurance", 
    icon: Home,
    href: "/assurance-menage",
    subLinks: [
      { labelKey: "megaMenu.homeInsurance7Things", href: "/blog/lassurance-menage-en-suisse-les-7-choses-a-savoir" },
    ]
  },
  { 
    id: "autres",
    labelKey: "nav.otherInsurances", 
    icon: Plus,
    href: "/blog",
    subLinks: [
      { labelKey: "common.seeAllArticles", href: "/blog" },
    ]
  },
];

// Finances menu data
const financesCategories = [
  { 
    id: "vie",
    labelKey: "nav.lifeInsurance", 
    icon: HeartPulse,
    href: "/assurance-vie",
    subLinks: [
      { labelKey: "megaMenu.in2Minutes", href: "/3eme-pilier-offres" },
      { labelKey: "megaMenu.prepareRetirement", href: "/blog/la-retraite-en-suisse" },
      { labelKey: "megaMenu.save2700Taxes", href: "/blog/pilier-3a-quand-et-comment-commencer-a-epargner" },
      { labelKey: "megaMenu.save7056Taxes", href: "/3eme-pilier-offres" },
    ]
  },
  { 
    id: "hypotheque",
    labelKey: "nav.mortgage", 
    icon: Banknote,
    href: "/hypotheque",
    subLinks: [
      { labelKey: "megaMenu.compareMortgages", href: "/hypotheque-offres" },
      { labelKey: "megaMenu.mortgageTypes", href: "/hypotheque" },
      { labelKey: "megaMenu.currentRates", href: "/hypotheque" },
    ]
  },
];

// Services menu data
const servicesCategories = [
  { 
    id: "mobile",
    labelKey: "nav.mobilePackage", 
    icon: Smartphone,
    href: "/forfait-mobile",
    subLinks: [
      { labelKey: "megaMenu.in2Minutes", href: "/forfait-mobile" },
      { labelKey: "megaMenu.mobileSubscriptions", href: "/forfait-mobile" },
      { labelKey: "megaMenu.save200", href: "/forfait-mobile" },
      { labelKey: "megaMenu.unlimitedWorld", href: "/forfait-mobile" },
    ]
  },
  { 
    id: "subside",
    labelKey: "nav.subsidyInsurance", 
    icon: CreditCard,
    href: "/subside-assurance-maladie",
    subLinks: [
      { labelKey: "megaMenu.requestSubsidy", href: "/subside-assurance-maladie" },
    ]
  },
  { 
    id: "resiliation",
    labelKey: "nav.termination", 
    icon: FileX,
    href: "/resiliation",
    subLinks: [
      { labelKey: "megaMenu.terminateInsurance", href: "/resiliation" },
    ]
  },
];

interface MegaMenuCategoryProps {
  categories: typeof assurancesCategories;
  ctaTextKey: string;
}

const MegaMenuContent = forwardRef<HTMLDivElement, MegaMenuCategoryProps>(
  ({ categories, ctaTextKey }, ref) => {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
    const activeItem = categories.find((c) => c.id === activeCategory);
    const { t } = useTranslation();

    // CTA dynamique : redirige vers la page de la catégorie active
    const dynamicCtaHref = activeItem?.href || categories[0]?.href || "/";

    return (
      <div ref={ref} className="flex w-[950px] rounded-2xl border bg-background shadow-premium animate-scale-in">
      {/* Left sidebar with categories */}
      <div className="w-[300px] bg-muted/30 rounded-l-2xl py-6">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              className={`flex w-full items-center gap-4 px-8 py-5 text-left transition-all duration-200 hover:bg-primary/10 ${
                isActive ? "bg-primary/10 border-l-4 border-primary" : "border-l-4 border-transparent"
              }`}
              onMouseEnter={() => setActiveCategory(category.id)}
              onFocus={() => setActiveCategory(category.id)}
            >
              <Icon className={`h-7 w-7 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`font-semibold text-lg ${isActive ? "text-primary" : "text-foreground"}`}>
                {t(category.labelKey, category.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right content area */}
      <div className="flex-1 p-10">
        <div className="flex gap-10">
          {/* Links section */}
          <div className="flex-1">
            <h3 className="text-primary font-bold text-xl mb-6">{t('common.readMore')}</h3>
            <ul className="space-y-5">
              {activeItem?.subLinks.map((link, index) => (
                <li key={index}>
                  <NavigationMenuLink asChild>
                    <LocalizedLink
                      to={link.href}
                      className="flex items-center gap-4 text-lg text-foreground/80 transition-all duration-200 hover:text-primary hover:translate-x-1"
                    >
                      <span className="w-2.5 h-2.5 bg-primary/40 rounded-full" />
                      {t(link.labelKey, link.labelKey)}
                    </LocalizedLink>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Mascot + CTA section */}
          <div className="w-[240px] flex flex-col items-center text-center">
            <img 
              src={llamaMascot} 
              alt="Optimis Mascot" 
              className="w-48 h-auto mb-6 animate-float"
            />
            <p className="text-primary font-bold text-lg mb-2">{t('common.getQuote')}</p>
            <p className="text-foreground font-semibold text-base mb-5">{t('common.freeAndNoCommitment')}</p>
            <NavigationMenuLink asChild>
              <LocalizedLink to={dynamicCtaHref} className="inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg transition-all duration-300 h-14 px-8 w-full">
                {t(ctaTextKey, ctaTextKey)}
              </LocalizedLink>
            </NavigationMenuLink>
          </div>
        </div>
      </div>
      </div>
    );
  },
);

MegaMenuContent.displayName = "MegaMenuContent";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 bg-optimis-green-light backdrop-blur-md shadow-soft">
      <div className="w-full px-4 md:px-6 lg:px-8 xl:px-12 flex h-24 items-center">
        {/* Logo - pushed to left edge */}
        <LocalizedLink to="/" className="flex items-center gap-2 mr-6 lg:mr-10 transition-transform hover:scale-105">
          <img src={logo} alt="Optimis" className="h-14" />
        </LocalizedLink>

        {/* Desktop Navigation - aligned left */}
        <NavigationMenu className="hidden lg:flex flex-1 justify-start max-w-full w-full z-50">
          <NavigationMenuList className="gap-2">
            {/* Assurances Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-lg font-semibold h-12 px-5">
                {t('nav.insurances')}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-0">
                <MegaMenuContent 
                  categories={assurancesCategories}
                  ctaTextKey="common.compareOffers"
                />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Finances Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-lg font-semibold h-12 px-5">
                {t('nav.finances')}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-0">
                <MegaMenuContent 
                  categories={financesCategories}
                  ctaTextKey="common.compareOffers"
                />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Services Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-lg font-semibold h-12 px-5">
                {t('nav.services')}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="p-0">
                <MegaMenuContent 
                  categories={servicesCategories}
                  ctaTextKey="services.seeServices"
                />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Blog Link */}
            <NavigationMenuItem>
              <LocalizedLink
                to="/blog"
                className="inline-flex h-12 items-center justify-center rounded-xl px-5 py-2 text-lg font-semibold text-foreground/80 transition-all duration-200 hover:text-primary hover:bg-secondary"
              >
                {t('nav.blog')}
              </LocalizedLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Button + Language Switcher - pushed to right */}
        <div className="hidden lg:flex items-center gap-4 ml-auto">
          <LanguageSwitcher />
          <Button asChild size="lg" className="gap-2.5">
            <a
              href="https://calendly.com/lesiteoptimis/30min"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-5 w-5" />
              {t('common.takeAppointment')}
            </a>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="lg:hidden ml-auto">
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <Menu className="h-7 w-7" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] sm:w-[380px] overflow-y-auto p-0">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <div className="flex flex-col gap-6 p-8">
              <LocalizedLink
                to="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <img src={logo} alt="Optimis" className="h-12" />
              </LocalizedLink>

              <nav className="flex flex-col gap-6">
                {/* Assurances Section */}
                <div className="space-y-3">
                  <p className="text-base font-bold text-primary">{t('nav.insurances')}</p>
                  {assurancesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <LocalizedLink
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-3 py-3 pl-4 text-base text-foreground/80 transition-all duration-200 hover:text-primary hover:pl-6"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {t(category.labelKey, category.labelKey)}
                      </LocalizedLink>
                    );
                  })}
                </div>

                {/* Finances Section */}
                <div className="space-y-3">
                  <p className="text-base font-bold text-primary">{t('nav.finances')}</p>
                  {financesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <LocalizedLink
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-3 py-3 pl-4 text-base text-foreground/80 transition-all duration-200 hover:text-primary hover:pl-6"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {t(category.labelKey, category.labelKey)}
                      </LocalizedLink>
                    );
                  })}
                </div>

                {/* Services Section */}
                <div className="space-y-3">
                  <p className="text-base font-bold text-primary">{t('nav.services')}</p>
                  {servicesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <LocalizedLink
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-3 py-3 pl-4 text-base text-foreground/80 transition-all duration-200 hover:text-primary hover:pl-6"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-5 w-5" />
                        {t(category.labelKey, category.labelKey)}
                      </LocalizedLink>
                    );
                  })}
                </div>

                {/* Blog Link */}
                <LocalizedLink
                  to="/blog"
                  className="py-3 text-base font-semibold text-foreground/80 transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.blog')}
                </LocalizedLink>
              </nav>

              <div className="flex flex-col gap-4 mt-4">
                <LanguageSwitcher />
                <Button asChild size="lg" className="w-full gap-2.5">
                  <a
                    href="https://calendly.com/lesiteoptimis/30min"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="h-5 w-5" />
                    {t('common.takeAppointment')}
                  </a>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
