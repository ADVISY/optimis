import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.svg";

const insuranceLinks = [
  { label: "Assurance Voiture", href: "/assurance-voiture" },
  { label: "Assurance Santé", href: "/assurance-sante" },
  { label: "Protection Juridique", href: "/protection-juridique" },
  { label: "Assurance Ménage", href: "/assurance-menage" },
];

const navLinks = [
  { label: "Finances", href: "/finances" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Optimis" className="h-10" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {/* Assurances Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-primary">
              Assurances
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {insuranceLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link to={link.href} className="w-full cursor-pointer">
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex">
          <Button asChild className="gap-2">
            <a
              href="https://calendly.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Calendar className="h-4 w-4" />
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
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
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
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-primary">
                    Assurances
                  </p>
                  {insuranceLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      className="block py-2 pl-4 text-sm text-foreground/80 transition-colors hover:text-primary"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <Button asChild className="w-full gap-2">
                <a
                  href="https://calendly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Calendar className="h-4 w-4" />
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
