// ============================================================================
// Entrée SSR pour le prerender SSG (scripts/prerender.mjs)
// ============================================================================
// Rend l'arbre React réel en HTML côté build, afin d'injecter le CONTENU (body)
// dans dist/<lang>/<slug>/index.html — et pas seulement le <head>.
//
// Objectif SEO : les crawlers qui n'exécutent pas (ou peu) le JS — Bing en tête,
// mais aussi Google en première passe — voient immédiatement le contenu réel.
//
// ⚠️ Contraintes SSR (React 18 renderToString) :
//   - On OMET <Toaster/> et <Sonner/> : ils utilisent createPortal, non
//     supporté par renderToString (fermés par défaut = jamais montés côté client
//     au chargement, donc sans impact sur l'affichage initial).
//   - La langue i18n doit être fixée AVANT le rendu (renderToString ne lance pas
//     les effets, donc LanguageWrapper.changeLanguage ne s'exécuterait pas).
//   - <StaticRouter> remplace <BrowserRouter> (pas d'accès à window côté Node).
//   - <HelmetProvider> capture les balises Helmet hors du body (le <head> est
//     géré séparément par applySeoToDoc dans prerender.mjs — source de vérité).
//
// Le client (main.tsx) fait toujours un createRoot().render() classique : il
// remplace le DOM prérendu par un rendu client neuf (pas d'hydratation, donc
// pas de risque de mismatch avec les branches responsive/état de formulaire).
// ============================================================================

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
// react-helmet-async est publié en CommonJS : sous Vite SSR, on force sa
// transformation via ssr.noExternal dans scripts/prerender.mjs, ce qui rend les
// imports nommés (ici + dans src/components/Seo.tsx) résolvables normalement.
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppRoutes } from "./App";
import i18n from "./i18n";

/**
 * Rend le body d'une route localisée en chaîne HTML.
 * @param url  chemin complet avec préfixe de langue, ex. "/fr/assurance-voiture"
 * @param lng  code langue ("fr" | "de" | "it" | "en")
 */
export async function render(url: string, lng: string): Promise<string> {
  if (i18n.language !== lng) {
    await i18n.changeLanguage(lng);
  }

  const queryClient = new QueryClient();
  const helmetContext = {};

  return renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <StaticRouter location={url}>
            <AppRoutes />
          </StaticRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
