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
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-optimis-green-dark text-white shadow-lg transition-transform hover:scale-110"
      aria-label="Contacter via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
