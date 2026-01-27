import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { languages } from '@/i18n';

export const useLocalizedPath = () => {
  const { i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();

  const currentLang = lang && languages.some(l => l.code === lang) ? lang : i18n.language;

  const localizedPath = (path: string) => {
    // If path already starts with a language prefix, return as is
    if (languages.some(l => path.startsWith(`/${l.code}/`) || path === `/${l.code}`)) {
      return path;
    }
    
    // Add current language prefix
    if (path.startsWith('/')) {
      return `/${currentLang}${path}`;
    }
    return `/${currentLang}/${path}`;
  };

  return { localizedPath, currentLang };
};
