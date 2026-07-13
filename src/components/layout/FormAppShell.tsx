import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import logo from "@/assets/logo.svg";

// ----------------------------------------------------------------------------
// FormAppShell — coque "application" pour les tunnels de formulaire Optimis.
// À la manière d'Intimy : PAS de méga-menu, PAS de footer de site. Uniquement :
//   • une barre supérieure minimale : logo Optimis + sélecteur de langue +
//     lien discret « Retour au site »
//   • une scène de marque plein écran (fond dégradé + halos)
//   • le formulaire (questions + mascotte, fournis par FormContainer/FormGuide)
//   • une fine ligne de réassurance en pied
//   • le bouton WhatsApp flottant (support rapide pendant le tunnel)
// Les pages « landing / comparateur » l'utilisent à la place de <Layout>.
// ----------------------------------------------------------------------------

interface FormAppShellProps {
  children: ReactNode;
  /** Petit intitulé de section au-dessus de la carte (ex. « L'expérience Optimis »). */
  eyebrow?: string;
  /** Accroche courte affichée en tête du tunnel (façon « On avance ensemble »). */
  tagline?: string;
}

const FormAppShell = ({ children, eyebrow, tagline }: FormAppShellProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative flex h-[100dvh] overflow-hidden flex-col bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50">
      {/* Halo de marque décoratif (fixe, ne défile pas) */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-16 top-8 h-56 w-56 rounded-full bg-emerald-300/20 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-emerald-200/25 blur-3xl" />
      </div>

      {/* Barre d'app minimale : logo + langue + sortie */}
      <header className="shrink-0 z-40 w-full border-b border-emerald-100/70 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex h-12 w-full max-w-6xl items-center justify-between px-3 md:h-14 md:px-6">
          <LocalizedLink
            to="/"
            aria-label="Optimis"
            className="flex items-center transition-transform hover:scale-105"
          >
            <img src={logo} alt="Optimis" className="h-7 md:h-9" />
          </LocalizedLink>

          <div className="flex items-center gap-1.5 md:gap-3">
            <LanguageSwitcher />
            <LocalizedLink
              to="/"
              className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 sm:inline-flex md:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("appShell.backToSite", "Retour au site")}
            </LocalizedLink>
          </div>
        </div>
      </header>

      {/* Scène du tunnel — verrouillée : occupe la hauteur restante, ne pousse pas la page */}
      <main className="flex-1 min-h-0 flex flex-col">
        <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col overflow-y-auto px-3 py-2 md:px-6 md:py-3">
          {(eyebrow || tagline) && (
            <div className="mb-2 shrink-0 text-center md:mb-3">
              {eyebrow && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600 md:text-xs">
                  {eyebrow}
                </p>
              )}
              {tagline && (
                <h1 className="mt-1 text-lg font-bold leading-tight text-emerald-900 md:text-3xl">
                  {tagline}
                </h1>
              )}
            </div>
          )}

          {children}
        </div>
      </main>

      {/* Ligne de réassurance minimale (pas de footer de site) */}
      <footer className="w-full shrink-0 px-4 py-1.5 md:py-2">
        <p className="mx-auto flex max-w-xl items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-700/70 md:text-xs">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          {t("appShell.trustLine", "Confidentiel · 100% gratuit · Sans engagement")}
        </p>
      </footer>

      {/* Support rapide pendant le tunnel — remonté et réduit pour ne pas
          recouvrir le bouton "Suivant" de la barre de navigation épinglée. */}
      <WhatsAppButton
        className="bottom-28 right-4 z-40 h-12 w-12 md:bottom-28 md:right-6 md:h-14 md:w-14"
        iconClassName="h-6 w-6 md:h-7 md:w-7"
      />
    </div>
  );
};

export default FormAppShell;
