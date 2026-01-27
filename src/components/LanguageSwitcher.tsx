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

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams<{ lang: string }>();

  const currentLangCode = lang && languages.some(l => l.code === lang) ? lang : i18n.language;
  const currentLang = languages.find(l => l.code === currentLangCode) || languages[0];

  const handleLanguageChange = (newLangCode: LanguageCode) => {
    if (newLangCode === currentLangCode) return;

    // Get current path parts
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Check if first part is a language code
    const firstPartIsLang = languages.some(l => l.code === pathParts[0]);
    
    let newPath: string;
    if (firstPartIsLang) {
      // Replace the language prefix
      pathParts[0] = newLangCode;
      newPath = '/' + pathParts.join('/');
    } else {
      // Add language prefix (shouldn't happen normally)
      newPath = '/' + newLangCode + location.pathname;
    }

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
