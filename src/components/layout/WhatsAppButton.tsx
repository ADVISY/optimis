import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  /**
   * Surcharge de position/taille. Utile dans le tunnel "figé" où la barre de
   * navigation est épinglée en bas : on remonte et on réduit le bouton pour
   * qu'il ne recouvre plus le bouton "Suivant".
   */
  className?: string;
  /** Taille de l'icône (Tailwind). Par défaut h-8 w-8. */
  iconClassName?: string;
}

const WhatsAppButton = ({ className, iconClassName }: WhatsAppButtonProps) => {
  const phoneNumber = "41782122360";
  const message = encodeURIComponent(
    "Bonjour, j'aimerais obtenir plus d'informations sur vos services d'assurance."
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-optimis-green to-optimis-green-dark text-white transition-all duration-300 hover:scale-110 animate-wa-glow",
        className
      )}
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className={cn("h-8 w-8", iconClassName)} />
    </a>
  );
};

export default WhatsAppButton;
