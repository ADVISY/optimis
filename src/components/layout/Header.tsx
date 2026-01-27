import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Menu, 
  ChevronDown, 
  Phone, 
  HeartPulse, 
  Car, 
  Scale, 
  Home, 
  Plus,
  Banknote,
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
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/logo.svg";
import llamaMascot from "@/assets/llama-mascot.png";

// Assurances menu data
const assurancesCategories = [
  { 
    id: "sante",
    label: "Assurance Santé", 
    icon: HeartPulse,
    href: "/assurance-sante",
    subLinks: [
      { label: "Choisir entre LAMal et CMU en tant que frontalier ?", href: "/blog/lamal-ou-cmu-comment-choisir" },
      { label: "Évaluer les options d'assurance complémentaire", href: "/assurance-sante" },
      { label: "Comprendre l'assurance maladie de base :", href: "/blog/lamal" },
      { label: "Planification de l'assurance maladie pour 2024", href: "/blog/les-primes-lamal-en-hausse-de-6-pourquoi" },
    ]
  },
  { 
    id: "vehicule",
    label: "Assurance Véhicule", 
    icon: Car,
    href: "/assurance-voiture",
    subLinks: [
      { label: "Comparer les assurances auto", href: "/assurance-voiture" },
      { label: "Assurance casco complète", href: "/blog/assurance-casco-complete-suisse" },
      { label: "Assurance responsabilité civile", href: "/blog/assurance-responsabilite-civile-voiture" },
    ]
  },
  { 
    id: "juridique",
    label: "Protection Juridique", 
    icon: Scale,
    href: "/protection-juridique",
    subLinks: [
      { label: "Protection juridique en Suisse", href: "/blog/le-meilleur-de-la-protection-juridique-en-suisse" },
    ]
  },
  { 
    id: "menage",
    label: "Assurance Ménage", 
    icon: Home,
    href: "/assurance-menage",
    subLinks: [
      { label: "Assurance RC et ménage", href: "/blog/lassurance-menage-en-suisse-les-7-choses-a-savoir" },
    ]
  },
  { 
    id: "autres",
    label: "Autres Assurances", 
    icon: Plus,
    href: "/assurances",
    subLinks: [
      { label: "Assurance voyage", href: "/assurances" },
      { label: "Assurance animaux", href: "/blog/assurance-chien-suisse" },
      { label: "Assurance accident", href: "/blog/assurance-accident-suisse" },
    ]
  },
];

// Finances menu data
const financesCategories = [
  { 
    id: "vie",
    label: "Assurance Vie", 
    icon: HeartPulse,
    href: "/finances",
    subLinks: [
      { label: "En 2 minutes", href: "/finances" },
      { label: "Préparez votre retraite", href: "/finances" },
      { label: "+ de 2700 CHF d'impôts", href: "/finances" },
      { label: "Jusqu'à 7056 CHF d'impôts", href: "/finances" },
    ]
  },
];

// Services menu data
const servicesCategories = [
  { 
    id: "mobile",
    label: "Forfait Mobile", 
    icon: Smartphone,
    href: "/services",
    subLinks: [
      { label: "En 2 minutes", href: "/services" },
      { label: "Abonnements de téléphone mobile", href: "/services" },
      { label: "+ de 200 CHF d'économies", href: "/services" },
      { label: "100% illimité dans le monde", href: "/services" },
    ]
  },
  { 
    id: "subside",
    label: "Subside Assurance", 
    icon: CreditCard,
    href: "/services",
    subLinks: [
      { label: "Demander un subside", href: "/blog/subside-dassurance-maladie-comment-ca-marche-et-comment-faire-sa-demande" },
    ]
  },
  { 
    id: "resiliation",
    label: "Résiliation", 
    icon: FileX,
    href: "/services",
    subLinks: [
      { label: "Résilier votre assurance", href: "/blog/tout-savoir-sur-la-resiliation-de-votre-assurance-assura" },
    ]
  },
];

interface MegaMenuCategoryProps {
  categories: typeof assurancesCategories;
  ctaText: string;
  ctaHref: string;
}

const MegaMenuContent = ({ categories, ctaText, ctaHref }: MegaMenuCategoryProps) => {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "");
  const activeItem = categories.find(c => c.id === activeCategory);

  return (
    <div className="flex w-[900px] bg-background rounded-xl shadow-2xl border">
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
            >
              <Icon className={`h-6 w-6 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`font-medium text-base ${isActive ? "text-primary" : "text-foreground"}`}>
                {category.label}
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
            <h3 className="text-primary font-semibold text-lg mb-6">En savoir plus</h3>
            <ul className="space-y-4">
              {activeItem?.subLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.href} 
                    className="text-base text-foreground/80 hover:text-primary transition-colors flex items-center gap-3"
                  >
                    <span className="w-2 h-2 bg-muted-foreground/40 rounded-full" />
                    {link.label}
                  </Link>
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
            <p className="text-primary font-semibold text-base mb-2">Obtenir une estimation</p>
            <p className="text-foreground font-bold text-base mb-4">Gratuite & sans engagement</p>
            <Button asChild className="w-full">
              <Link to={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-8">
          <img src={logo} alt="Optimis" className="h-12" />
        </Link>

        {/* Desktop Navigation - aligned left */}
        <NavigationMenu className="hidden md:flex flex-1 justify-start">
          <NavigationMenuList className="gap-1">
            {/* Assurances Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                Assurances
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <MegaMenuContent 
                  categories={assurancesCategories}
                  ctaText="Comparer les offres"
                  ctaHref="/assurance-sante"
                />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Finances Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                Finances
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <MegaMenuContent 
                  categories={financesCategories}
                  ctaText="Comparer les offres"
                  ctaHref="/finances"
                />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Services Mega Menu */}
            <NavigationMenuItem>
              <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent">
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <MegaMenuContent 
                  categories={servicesCategories}
                  ctaText="Voir les offres"
                  ctaHref="/services"
                />
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Blog Link */}
            <NavigationMenuItem>
              <Link
                to="/blog"
                className="inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                Blog
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* CTA Button - pushed to right */}
        <div className="hidden md:flex ml-auto">
          <Button asChild className="gap-2">
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="h-4 w-4" />
              Prendre Rendez-vous
            </a>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px] overflow-y-auto">
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <Link
                to="/"
                className="flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <img src={logo} alt="Optimis" className="h-8" />
              </Link>

              <nav className="flex flex-col gap-4">
                {/* Assurances Section */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Assurances</p>
                  {assurancesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-2 py-2 pl-4 text-sm text-foreground/80 transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Finances Section */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Finances</p>
                  {financesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-2 py-2 pl-4 text-sm text-foreground/80 transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Services Section */}
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">Services</p>
                  {servicesCategories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Link
                        key={category.id}
                        to={category.href}
                        className="flex items-center gap-2 py-2 pl-4 text-sm text-foreground/80 transition-colors hover:text-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        {category.label}
                      </Link>
                    );
                  })}
                </div>

                {/* Blog Link */}
                <Link
                  to="/blog"
                  className="py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Blog
                </Link>
              </nav>

              <Button asChild className="w-full gap-2">
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="h-4 w-4" />
                  Prendre Rendez-vous
                </a>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
