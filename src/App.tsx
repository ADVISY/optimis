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
import Services from "./pages/Services";
import ForfaitMobile from "./pages/ForfaitMobile";
import SubsideAssuranceMaladie from "./pages/SubsideAssuranceMaladie";
import Resiliation from "./pages/Resiliation";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import LegalNotice from "./pages/LegalNotice";
import TermsOfService from "./pages/TermsOfService";
import NotFound from "./pages/NotFound";
import { languages } from "./i18n";

// Comparator pages
import ComparateurSante from "./pages/comparateurs/ComparateurSante";
import ComparateurVoiture from "./pages/comparateurs/ComparateurVoiture";
import ComparateurMenage from "./pages/comparateurs/ComparateurMenage";
import ComparateurProtectionJuridique from "./pages/comparateurs/ComparateurProtectionJuridique";
import ComparateurSubside from "./pages/comparateurs/ComparateurSubside";
import ComparateurResiliation from "./pages/comparateurs/ComparateurResiliation";
import ComparateurPilier3 from "./pages/comparateurs/ComparateurPilier3";
import ComparateurHypotheque from "./pages/comparateurs/ComparateurHypotheque";
import ComparateurProfessionnel from "./pages/comparateurs/ComparateurProfessionnel";

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

// Routes component with language prefix
const LanguageRoutes = () => {
  return (
    <LanguageWrapper>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/assurance-voiture" element={<AssuranceVoiture />} />
        <Route path="/assurance-sante" element={<AssuranceSante />} />
        <Route path="/protection-juridique" element={<ProtectionJuridique />} />
        <Route path="/assurance-menage" element={<AssuranceMenage />} />
        <Route path="/assurance-vie" element={<AssuranceVie />} />
        <Route path="/hypotheque" element={<Hypotheque />} />
        <Route path="/services" element={<Services />} />
        <Route path="/forfait-mobile" element={<ForfaitMobile />} />
        <Route path="/subside-assurance-maladie" element={<SubsideAssuranceMaladie />} />
        <Route path="/resiliation" element={<Resiliation />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
        <Route path="/mentions-legales" element={<LegalNotice />} />
        <Route path="/cgu" element={<TermsOfService />} />
        
        {/* Comparator routes */}
        <Route path="/comparateur/sante" element={<ComparateurSante />} />
        <Route path="/comparateur/voiture" element={<ComparateurVoiture />} />
        <Route path="/comparateur/menage" element={<ComparateurMenage />} />
        <Route path="/comparateur/protection-juridique" element={<ComparateurProtectionJuridique />} />
        <Route path="/comparateur/subside" element={<ComparateurSubside />} />
        <Route path="/comparateur/resiliation" element={<ComparateurResiliation />} />
        <Route path="/comparateur/pilier-3a" element={<ComparateurPilier3 />} />
        <Route path="/comparateur/hypotheque" element={<ComparateurHypotheque />} />
        <Route path="/comparateur/professionnel" element={<ComparateurProfessionnel />} />
        
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
          <Route path="/" element={<Navigate to="/fr" replace />} />
          
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
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
