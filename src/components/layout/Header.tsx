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
  FileX
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
      { labelKey: "megaMenu.in2Minutes", href: "/assurance-vie" },
      { labelKey: "megaMenu.prepareRetirement", href: "/assurance-vie" },
      { labelKey: "megaMenu.save2700Taxes", href: "/assurance-vie" },
      { labelKey: "megaMenu.save7056Taxes", href: "/assurance-vie" },
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
      <div ref={ref} className="flex w-[900px] rounded-xl border bg-background shadow-2xl">
      {/* Left sidebar with categories */}
      <div className="w-[280px] bg-muted/30 rounded-l-xl py-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              className={`flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-primary/10 ${
                isActive ? "bg-primary/10 border-l-4 border-primary" : "border-l-4 border-transparent"
              }`}
              onMouseEnter={() => setActiveCategory(category.id)}
              onFocus={() => setActiveCategory(category.id)}
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`font-medium text-base ${isActive ? "text-primary" : "text-foreground"}`}>
                {t(category.labelKey, category.labelKey)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right content area */}
      <div className="flex-1 p-8">
        <div className="flex gap-8">
          {/* Links section */}
          <div className="flex-1">
            <h3 className="text-primary font-semibold text-lg mb-6">{t('common.readMore')}</h3>
            <ul className="space-y-4">
              {activeItem?.subLinks.map((link, index) => (
                <li key={index}>
                  <NavigationMenuLink asChild>
                    <LocalizedLink
                      to={link.href}
                      className="flex items-center gap-3 text-base text-foreground/80 transition-colors hover:text-primary"
                    >
                      <span className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
                      {t(link.labelKey, link.labelKey)}
                    </LocalizedLink>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Mascot + CTA section */}
          <div className="w-[220px] flex flex-col items-center text-center">
            <img 
              src={llamaMascot} 
              alt="Optimis Mascot" 
              className="w-40 h-auto mb-4"
            />
            <p className="text-primary font-semibold text-base mb-2">{t('common.getQuote')}</p>
            <p className="text-foreground font-bold text-base mb-4">{t('common.freeAndNoCommitment')}</p>
            <NavigationMenuLink asChild>
              <LocalizedLink to={dynamicCtaHref} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        {/* Logo */}
        <LocalizedLink to="/" className="flex items-center gap-2 mr-8">
          <img src={logo} alt="Optimis" className="h-12" />
        </LocalizedLink>

        {/* Desktop Navigation - aligned left */}
        <NavigationMenu className="hidden md:flex flex-1 justify-start max-w-full w-full z-50">
          <NavigationMenuList className="gap-1">
            {/* Assurances Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-base font-medium">
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
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-base font-medium">
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
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent text-base font-medium">
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
                className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-base font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {t('nav.blog')}
              </LocalizedLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Button + Language Switcher - pushed to right */}
        <div className="hidden md:flex items-center gap-2 ml-auto">
          <LanguageSwitcher />
          <Button asChild className="gap-2">
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-4 w-4" />
              {t('common.takeAppointment')}
            </a>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden ml-auto">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <LocalizedLink
                to="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <img src={logo} alt="Optimis" className="h-8" />
              </LocalizedLink>

              <nav className="flex flex-col gap-4">
                {/* Assurances Section */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">{t('nav.insurances')}</p>
                  {assurancesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <LocalizedLink
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-2 py-2 pl-4 text-sm text-foreground/80 transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {t(category.labelKey, category.labelKey)}
                      </LocalizedLink>
                    );
                  })}
                </div>

                {/* Finances Section */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">{t('nav.finances')}</p>
                  {financesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <LocalizedLink
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-2 py-2 pl-4 text-sm text-foreground/80 transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {t(category.labelKey, category.labelKey)}
                      </LocalizedLink>
                    );
                  })}
                </div>

                {/* Services Section */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">{t('nav.services')}</p>
                  {servicesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <LocalizedLink
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-2 py-2 pl-4 text-sm text-foreground/80 transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {t(category.labelKey, category.labelKey)}
                      </LocalizedLink>
                    );
                  })}
                </div>

                {/* Blog Link */}
                <LocalizedLink
                  to="/blog"
                  className="py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {t('nav.blog')}
                </LocalizedLink>
              </nav>

              <div className="flex flex-col gap-4">
                <LanguageSwitcher />
                <Button asChild className="w-full gap-2">
                  <a
                    href="https://calendly.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Phone className="h-4 w-4" />
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
