import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { languages } from '@/i18n';
import { localizedRoutes, getLocalizedPath as getRouteSlug } from '@/utils/localizedRoutes';

export const useLocalizedPath = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  const currentLang = lang && languages.some(l => l.code === lang) ? lang : i18n.language;

  // Get the localized slug for a route key
  const getLocalizedSlug = (routeKey: string): string => {
    return getRouteSlug(routeKey, currentLang);
  };

  // Build a full localized path using route key
  const getLocalizedRoutePath = (routeKey: string, suffix?: string): string => {
    const slug = getLocalizedSlug(routeKey);
    const basePath = slug ? `/${currentLang}/${slug}` : `/${currentLang}`;
    return suffix ? `${basePath}${suffix}` : basePath;
  };

  // Original function for backward compatibility - adds language prefix to any path
  const localizedPath = (path: string) => {
    // If path already starts with a language prefix, return as is
    if (languages.some(l => path.startsWith(`/${l.code}/`) || path === `/${l.code}`)) {
      return path;
    }
    
    // Check if path matches a route key pattern and translate it
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const pathParts = cleanPath.split('/');
    const firstPart = pathParts[0];
    
    // Find if this path corresponds to a localized route
    for (const [routeKey, routes] of Object.entries(localizedRoutes)) {
      // Check if the path starts with any known French slug
      if (routes.fr === firstPart) {
        // Translate to current language
        const langCode = currentLang as keyof typeof routes;
        const translatedSlug = routes[langCode] || routes.fr;
        pathParts[0] = translatedSlug;
        const translatedPath = pathParts.join('/');
        return `/${currentLang}/${translatedPath}`;
      }
    }
    
    // Add current language prefix (fallback)
    if (path.startsWith('/')) {
      return `/${currentLang}${path}`;
    }
    return `/${currentLang}/${path}`;
  };

  return { localizedPath, currentLang, getLocalizedSlug, getLocalizedRoutePath };
};