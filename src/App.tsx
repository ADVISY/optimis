import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AssuranceVoiture from "./pages/AssuranceVoiture";
import AssuranceSante from "./pages/AssuranceSante";
import ProtectionJuridique from "./pages/ProtectionJuridique";
import AssuranceMenage from "./pages/AssuranceMenage";
import Finances from "./pages/Finances";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import { languages } from "./i18n";

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
        <Route path="/finances" element={<Finances />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
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
          <Route path="/finances" element={<Navigate to="/fr/finances" replace />} />
          <Route path="/services" element={<Navigate to="/fr/services" replace />} />
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
