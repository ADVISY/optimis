import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
