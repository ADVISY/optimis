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
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-optimis-green to-optimis-green-dark text-white shadow-lg shadow-optimis-green-dark/40 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-optimis-green-dark/50 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]"
      aria-label="Contacter via WhatsApp"
    >
      {/* Glow ring effect */}
      <span className="absolute inset-0 rounded-full bg-optimis-green/30 animate-ping" />
      <MessageCircle className="relative h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
