import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
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
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-optimis-green to-optimis-green-dark text-white transition-all duration-300 hover:scale-110 animate-wa-glow"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="h-8 w-8" />
    </a>
  );
};

export default WhatsAppButton;
