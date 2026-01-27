import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.svg";

const Footer = () => {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <img src={logo} alt="Optimis" className="h-10" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Le comparateur d'assurances suisse qui vous aide à trouver les
              meilleures offres pour votre budget.
            </p>
          </div>

          {/* Assurances */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Assurances</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/assurance-voiture"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Assurance Voiture
                </Link>
              </li>
              <li>
                <Link
                  to="/assurance-sante"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Assurance Santé
                </Link>
              </li>
              <li>
                <Link
                  to="/protection-juridique"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Protection Juridique
                </Link>
              </li>
              <li>
                <Link
                  to="/assurance-menage"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Assurance Ménage
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/politique-confidentialite"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  to="/mentions-legales"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  to="/cgu"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Conditions générales
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+41791234567" className="hover:text-primary">
                  +41 79 123 45 67
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href="mailto:contact@optimis.ch"
                  className="hover:text-primary"
                >
                  contact@optimis.ch
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>Genève, Suisse</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Optimis. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
