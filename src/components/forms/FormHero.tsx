import { cn } from "@/lib/utils";

// ----------------------------------------------------------------------------
// FormHero — en-tête compact et unifié des pages "app funnel".
//   • 5 étoiles + un H1 (essentiel pour le SEO), rien d'autre.
//   • Titre COURT sur mobile (titleMobile) et complet dès sm+.
//   • PAS de sous-titre ni de badges de réassurance : ces arguments sont
//     désormais portés par la mascotte Optimis, ce qui libère de la place
//     pour que le formulaire tienne sur un seul écran.
// ----------------------------------------------------------------------------

interface FormHeroProps {
  /** Titre complet (desktop / SEO). */
  title: string;
  /** Variante courte affichée sur mobile (< sm). Repli sur `title` si absent. */
  titleMobile?: string;
  className?: string;
}

const FormHero = ({ title, titleMobile, className }: FormHeroProps) => (
  <div className={cn("mx-auto max-w-3xl shrink-0 text-center mb-2 md:mb-3", className)}>
    <div className="mb-1 flex justify-center gap-1" aria-hidden>
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-accent text-xs drop-shadow-sm md:text-sm">
          ★
        </span>
      ))}
    </div>
    <h1 className="font-heading text-base font-black uppercase leading-tight tracking-tight text-foreground sm:text-xl md:text-2xl lg:text-3xl">
      {titleMobile ? (
        <>
          <span className="sm:hidden">{titleMobile}</span>
          <span className="hidden sm:inline">{title}</span>
        </>
      ) : (
        title
      )}
    </h1>
  </div>
);

export default FormHero;
