import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Globe, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { languages, LanguageCode } from '@/i18n';
import { localizedRoutes } from '@/utils/localizedRoutes';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();

  const currentLangCode = lang && languages.some(l => l.code === lang) ? lang : i18n.language;
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

  // Find the route key for a given slug in any language
  const findRouteKeyFromSlug = (slug: string): string | null => {
    for (const [key, routes] of Object.entries(localizedRoutes)) {
      if (routes.fr === slug || routes.de === slug || routes.it === slug) {
        return key;
      }
    }
    return null;
  };

  const handleLanguageChange = (newLangCode: LanguageCode) => {
    if (newLangCode === currentLangCode) return;

    // Get current path parts
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Check if first part is a language code
    const firstPartIsLang = languages.some(l => l.code === pathParts[0]);
    
    if (firstPartIsLang && pathParts.length > 1) {
      // Translate the slug if it's a known route
      const currentSlug = pathParts[1];
      const routeKey = findRouteKeyFromSlug(currentSlug);
      
      if (routeKey) {
        const routes = localizedRoutes[routeKey];
        const newSlug = routes[newLangCode as keyof typeof routes] || routes.fr;
        pathParts[0] = newLangCode;
        pathParts[1] = newSlug;
      } else {
        // Just change the language prefix, keep the slug as is
        pathParts[0] = newLangCode;
      }
    } else if (firstPartIsLang) {
      // Just the language prefix, replace it
      pathParts[0] = newLangCode;
    } else {
      // Add language prefix (shouldn't happen normally)
      pathParts.unshift(newLangCode);
    }

    const newPath = '/' + pathParts.join('/');

    // Change i18n language
    i18n.changeLanguage(newLangCode);
    
    // Navigate to new path
    navigate(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-3">
          <Globe className="h-4 w-4" />
          <span>{currentLang.flag}</span>
          <span className="hidden sm:inline font-medium">{currentLang.code.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${currentLangCode === lang.code ? 'bg-primary/10 text-primary' : ''}`}
          >
            <span className="mr-3 text-lg">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;