import { Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/LocalizedLink";
import logo from "@/assets/logo.svg";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-secondary/30">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <LocalizedLink to="/" className="inline-block">
              <img src={logo} alt="Optimis" className="h-10" />
            </LocalizedLink>
            <p className="text-sm text-muted-foreground">
              {t('footer.aboutDescription')}
            </p>
          </div>

          {/* Assurances */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('nav.insurances')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <LocalizedLink
                  to="/assurance-voiture"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('nav.carInsurance')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/assurance-sante"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('nav.healthInsurance')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/protection-juridique"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('nav.legalProtection')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/assurance-menage"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('nav.homeInsurance')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <LocalizedLink
                  to="/politique-confidentialite"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.privacyPolicy')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/mentions-legales"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.legalNotice')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/cgu"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {t('footer.termsOfService')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">{t('common.contact')}</h3>
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
            © {new Date().getFullYear()} Optimis. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
