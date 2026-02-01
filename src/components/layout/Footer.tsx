import { Phone, Mail, MapPin, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import LocalizedLink from "@/components/LocalizedLink";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo-white.svg";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t bg-optimis-green-dark text-white">
      {/* CTA Banner */}
      <div className="container py-8 md:py-16">
        <div className="bg-primary rounded-xl md:rounded-2xl p-5 md:p-12 text-center text-primary-foreground">
          <h3 className="text-lg md:text-3xl font-bold mb-2 md:mb-4">
            {t('footer.ctaTitle', { defaultValue: 'Prêt à économiser sur vos assurances ?' })}
          </h3>
          <p className="text-sm md:text-lg mb-4 md:mb-8 opacity-90 max-w-xl mx-auto">
            {t('footer.ctaDescription', { defaultValue: 'Comparez gratuitement et sans engagement les meilleures offres du marché.' })}
          </p>
          <Button asChild size="default" className="gap-2 h-10 md:h-12 text-sm md:text-base px-4 md:px-6">
            <LocalizedLink to="/assurance-sante">
              {t('common.compareNow')}
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </LocalizedLink>
          </Button>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <LocalizedLink to="/" className="inline-block transition-transform hover:scale-105">
              <img src={logo} alt="Optimis" className="h-14" />
            </LocalizedLink>
            <p className="text-base text-white/80 leading-relaxed max-w-sm">
              {t('footer.aboutDescription')}
            </p>
            {/* Contact Info */}
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/80">
                <div className="p-2 rounded-lg bg-white/10">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <a href="tel:+41782122360" className="text-base hover:text-optimis-gold transition-colors">
                  +41 78 212 23 60
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <div className="p-2 rounded-lg bg-white/10">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <a href="mailto:contact@optimis.ch" className="text-base hover:text-optimis-gold transition-colors">
                  contact@optimis.ch
                </a>
              </li>
              <li className="flex items-center gap-3 text-white/80">
                <div className="p-2 rounded-lg bg-white/10">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-base">Genève, Suisse</span>
              </li>
            </ul>
          </div>

          {/* Assurances */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white">{t('nav.insurances')}</h3>
            <ul className="space-y-4">
              <li>
                <LocalizedLink
                  to="/assurance-voiture"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.carInsurance')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/assurance-sante"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.healthInsurance')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/protection-juridique"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.legalProtection')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/assurance-menage"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.homeInsurance')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/assurance-vie"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.lifeInsurance')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/hypotheque"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('services.mortgage')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white">{t('nav.services')}</h3>
            <ul className="space-y-4">
              <li>
                <LocalizedLink
                  to="/forfait-mobile"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.mobilePackage')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/subside-assurance-maladie"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.subsidyInsurance')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/resiliation"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.termination')}
                </LocalizedLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-6">
            <h3 className="font-bold text-lg text-white">{t('footer.legal')}</h3>
            <ul className="space-y-4">
              <li>
                <LocalizedLink
                  to="/politique-confidentialite"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('footer.privacyPolicy')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/mentions-legales"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('footer.legalNotice')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/cgu"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('footer.termsOfService')}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  to="/blog"
                  className="text-base text-white/80 transition-all duration-200 hover:text-optimis-gold hover:translate-x-1 inline-block"
                >
                  {t('nav.blog')}
                </LocalizedLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-base text-white/80">
            © {new Date().getFullYear()} Optimis. {t('footer.allRightsReserved')}
          </p>
          <p className="text-sm text-white/60">
            🇨🇭 {t('footer.madeInSwitzerland', { defaultValue: 'Conçu avec ❤️ en Suisse' })}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
