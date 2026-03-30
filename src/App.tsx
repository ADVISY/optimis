import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import ScrollToTop from "@/components/ScrollToTop";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AssuranceVoiture from "./pages/AssuranceVoiture";
import AssuranceSante from "./pages/AssuranceSante";
import ProtectionJuridique from "./pages/ProtectionJuridique";
import AssuranceMenage from "./pages/AssuranceMenage";
import AssuranceVie from "./pages/AssuranceVie";
import Hypotheque from "./pages/Hypotheque";
import AssurancePro from "./pages/AssurancePro";
import Services from "./pages/Services";
import ForfaitMobile from "./pages/ForfaitMobile";
import SubsideAssuranceMaladie from "./pages/SubsideAssuranceMaladie";
import Resiliation from "./pages/Resiliation";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";
import TermsOfService from "./pages/TermsOfService";
import About from "./pages/About";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ThankYou from "./pages/ThankYou";
import MerciHypotheque from "./pages/MerciHypotheque";
import Insurances from "./pages/Insurances";
import NotFound from "./pages/NotFound";
import { languages } from "./i18n";

// Comparator/Landing pages
import ComparateurSante from "./pages/comparateurs/ComparateurSante";
import ComparateurVoiture from "./pages/comparateurs/ComparateurVoiture";
import ComparateurMenage from "./pages/comparateurs/ComparateurMenage";
import ComparateurProtectionJuridique from "./pages/comparateurs/ComparateurProtectionJuridique";
import ComparateurSubside from "./pages/comparateurs/ComparateurSubside";
import ComparateurResiliation from "./pages/comparateurs/ComparateurResiliation";
import ComparateurPilier3 from "./pages/comparateurs/ComparateurPilier3";
import ComparateurHypotheque from "./pages/comparateurs/ComparateurHypotheque";
import ComparateurProfessionnel from "./pages/comparateurs/ComparateurProfessionnel";

import { localizedRoutes } from "./utils/localizedRoutes";

const queryClient = new QueryClient();

// Wrapper component to handle language from URL
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && languages.some(l => l.code === lang) && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <>{children}</>;
};

// Helper to create routes for all language variants of a path
const createLocalizedRoutes = (routeKey: keyof typeof localizedRoutes, element: React.ReactNode) => {
  const routes = localizedRoutes[routeKey];
  const uniqueSlugs = [...new Set([routes.fr, routes.de, routes.it])];
  return uniqueSlugs.map(slug => (
    <Route key={`${routeKey}-${slug}`} path={`/${slug}`} element={element} />
  ));
};

// Routes component with language prefix
const LanguageRoutes = () => {
  return (
    <LanguageWrapper>
      <Routes>
        <Route path="/" element={<Index />} />
        
        {/* Main pages - all language variants */}
        {createLocalizedRoutes("carInsurance", <AssuranceVoiture />)}
        {createLocalizedRoutes("healthInsurance", <AssuranceSante />)}
        {createLocalizedRoutes("legalProtection", <ProtectionJuridique />)}
        {createLocalizedRoutes("homeInsurance", <AssuranceMenage />)}
        {createLocalizedRoutes("lifeInsurance", <AssuranceVie />)}
        {createLocalizedRoutes("mortgage", <Hypotheque />)}
        {createLocalizedRoutes("professionalInsurance", <AssurancePro />)}
        {createLocalizedRoutes("services", <Services />)}
        {createLocalizedRoutes("mobilePackage", <ForfaitMobile />)}
        {createLocalizedRoutes("healthSubsidy", <SubsideAssuranceMaladie />)}
        {createLocalizedRoutes("termination", <Resiliation />)}
        
        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Institutional pages - all language variants */}
        {createLocalizedRoutes("privacyPolicy", <PrivacyPolicy />)}
        {createLocalizedRoutes("legalNotice", <LegalNotice />)}
        {createLocalizedRoutes("terms", <TermsOfService />)}
        {createLocalizedRoutes("about", <About />)}
        {createLocalizedRoutes("aboutAlt", <About />)}
        {createLocalizedRoutes("contact", <Contact />)}
        {createLocalizedRoutes("faq", <FAQ />)}
        {createLocalizedRoutes("insurances", <Insurances />)}
        {createLocalizedRoutes("thankYou", <ThankYou />)}
        {createLocalizedRoutes("thankYouMortgage", <MerciHypotheque />)}
        
        {/* Landing/Comparator pages - all language variants */}
        {createLocalizedRoutes("healthLanding", <ComparateurSante />)}
        {createLocalizedRoutes("carLanding", <ComparateurVoiture />)}
        {createLocalizedRoutes("homeLanding", <ComparateurMenage />)}
        {createLocalizedRoutes("legalLanding", <ComparateurProtectionJuridique />)}
        {createLocalizedRoutes("subsidyLanding", <ComparateurSubside />)}
        {createLocalizedRoutes("terminationLanding", <ComparateurResiliation />)}
        {createLocalizedRoutes("pillar3Landing", <ComparateurPilier3 />)}
        {createLocalizedRoutes("mortgageLanding", <ComparateurHypotheque />)}
        {createLocalizedRoutes("businessLanding", <ComparateurProfessionnel />)}
        
        {/* Legacy comparateur routes - redirect to new URLs */}
        <Route path="/comparateur/sante" element={<Navigate to="../assurance-maladie-landing" replace />} />
        <Route path="/comparateur/voiture" element={<Navigate to="../assurance-voiture-landing" replace />} />
        <Route path="/comparateur/menage" element={<Navigate to="../assurance-menage-landing" replace />} />
        <Route path="/comparateur/protection-juridique" element={<Navigate to="../protection-juridique-landing" replace />} />
        <Route path="/comparateur/subside" element={<Navigate to="../subside-assurance-maladie-demande" replace />} />
        <Route path="/comparateur/resiliation" element={<Navigate to="../resiliation-assurance" replace />} />
        <Route path="/comparateur/pilier-3a" element={<Navigate to="../3eme-pilier-offres" replace />} />
        <Route path="/comparateur/hypotheque" element={<Navigate to="../hypotheque-offres" replace />} />
        <Route path="/comparateur/professionnel" element={<Navigate to="../assurance-entreprise-offres" replace />} />
        
        {/* Legacy routes - redirect to new slugs */}
        <Route path="/politique-confidentialite" element={<Navigate to="../politique-de-confidentialite" replace />} />
        <Route path="/mentions-legales" element={<Navigate to="../legal" replace />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageWrapper>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Root redirect to French */}
          {/* Root redirect to German */}
          <Route path="/" element={<Navigate to="/de" replace />} />
          
          {/* Language-prefixed routes */}
          <Route path="/:lang/*" element={<LanguageRoutes />} />
          
          {/* Fallback for old routes without language prefix - redirect to French */}
          <Route path="/assurance-voiture" element={<Navigate to="/fr/assurance-voiture" replace />} />
          <Route path="/assurance-sante" element={<Navigate to="/fr/assurance-sante" replace />} />
          <Route path="/protection-juridique" element={<Navigate to="/fr/protection-juridique" replace />} />
          <Route path="/assurance-menage" element={<Navigate to="/fr/assurance-menage" replace />} />
          <Route path="/assurance-vie" element={<Navigate to="/fr/assurance-vie" replace />} />
          <Route path="/hypotheque" element={<Navigate to="/fr/hypotheque" replace />} />
          <Route path="/finances" element={<Navigate to="/fr/hypotheque" replace />} />
          <Route path="/services" element={<Navigate to="/fr/services" replace />} />
          <Route path="/subside-assurance-maladie" element={<Navigate to="/fr/subside-assurance-maladie" replace />} />
          <Route path="/forfait-mobile" element={<Navigate to="/fr/forfait-mobile" replace />} />
          <Route path="/resiliation" element={<Navigate to="/fr/resiliation" replace />} />
          <Route path="/blog" element={<Navigate to="/fr/blog" replace />} />
          <Route path="/blog/:slug" element={<Navigate to="/fr/blog/:slug" replace />} />
          
          {/* Institutional pages without language prefix */}
          <Route path="/a-propos" element={<Navigate to="/fr/a-propos" replace />} />
          <Route path="/contactez-nous" element={<Navigate to="/fr/contactez-nous" replace />} />
          <Route path="/qui-sommes-nous" element={<Navigate to="/fr/qui-sommes-nous" replace />} />
          <Route path="/faqs" element={<Navigate to="/fr/faqs" replace />} />
          <Route path="/assurances" element={<Navigate to="/fr/assurances" replace />} />
          <Route path="/merci" element={<Navigate to="/fr/merci" replace />} />
          <Route path="/politique-de-confidentialite" element={<Navigate to="/fr/politique-de-confidentialite" replace />} />
          <Route path="/legal" element={<Navigate to="/fr/legal" replace />} />
          
          {/* Legacy WordPress URLs without language prefix - SEO redirects */}
          <Route path="/assurance-maladie-landing" element={<Navigate to="/fr/assurance-maladie-landing" replace />} />
          <Route path="/assurance-voiture-landing" element={<Navigate to="/fr/assurance-voiture-landing" replace />} />
          <Route path="/assurance-menage-landing" element={<Navigate to="/fr/assurance-menage-landing" replace />} />
          <Route path="/protection-juridique-landing" element={<Navigate to="/fr/protection-juridique-landing" replace />} />
          <Route path="/subside-assurance-maladie-demande" element={<Navigate to="/fr/subside-assurance-maladie-demande" replace />} />
          <Route path="/resiliation-assurance" element={<Navigate to="/fr/resiliation-assurance" replace />} />
          <Route path="/3eme-pilier-offres" element={<Navigate to="/fr/3eme-pilier-offres" replace />} />
          <Route path="/hypotheque-offres" element={<Navigate to="/fr/hypotheque-offres" replace />} />
          <Route path="/assurance-entreprise-offres" element={<Navigate to="/fr/assurance-entreprise-offres" replace />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;