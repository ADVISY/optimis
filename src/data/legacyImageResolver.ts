import allianzLogo from "@/assets/blog/allianz-assurance-voiture.png";
import axaLogo from "@/assets/blog/axa-assurance-voiture.png";
import generaliLogo from "@/assets/blog/generali-assurance-voiture.png";
import mobiliereLogo from "@/assets/blog/mobiliere-assurance-voiture.png";
import zurichLogo from "@/assets/blog/zurich-assurance-voiture.png";
import modeleAssuranceImg from "@/assets/blog/modele-assurance-maladie.jpg";
import comparerAssurancesImg from "@/assets/blog/comparer-assurances.jpg";
import resiliationImg from "@/assets/blog/resiliation-assurance.jpg";
import helsanaLogo from "@/assets/insurers/helsana-logo.svg";
import groupeMutuelLogo from "@/assets/insurers/groupe-mutuel-logo.svg";
import swicaLogo from "@/assets/insurers/swica-logo.svg";
import swissLifeLogo from "@/assets/insurers/swiss-life-logo.svg";
import swisscomLogo from "@/assets/providers/swisscom-logo.svg";
import sunriseLogo from "@/assets/providers/sunrise-logo.svg";
import saltLogo from "@/assets/providers/salt-logo.svg";
import wingoLogo from "@/assets/providers/wingo-logo.svg";
import dasLogo from "@/assets/providers/das-logo.svg";
import mobilePhoneIllustration from "@/assets/services/mobile-phone.svg";
import subsideIllustration from "@/assets/blog/content/subside-assurance.jpg";
import laurentAvatar from "@/assets/testimonials/laurent-weber.svg";
import claireAvatar from "@/assets/testimonials/claire-muller.svg";
import philippeAvatar from "@/assets/testimonials/philippe-dupont.svg";
import sophieAvatar from "@/assets/testimonials/sophie-girard.svg";

const legacyImageMap: Record<string, string> = {
  "general-1.svg": generaliLogo,
  "allianz-logo.svg": allianzLogo,
  "helsana-logo.svg": helsanaLogo,
  "logo-groupe-mutuel.svg": groupeMutuelLogo,
  "SWICA_Logo_Mobile.svg": swicaLogo,
  "images.png": mobiliereLogo,
  "0001_0003782804_2-640.jpg": axaLogo,
  "thumb_3715_page_big.png": zurichLogo,
  "Swiss_Life_AG_logo.svg": swissLifeLogo,
  "das-logo.svg": dasLogo,
  "swisscom-logo.svg": swisscomLogo,
  "sunrise-logo.svg": sunriseLogo,
  "salt-logo.svg": saltLogo,
  "wingo-logo.svg": wingoLogo,
  "mobile-phone.png": mobilePhoneIllustration,
  "coins-5946827.jpg": subsideIllustration,
  "contract-cancel.png": resiliationImg,
  "car-sales.jpg": comparerAssurancesImg,
  "health-consultation.jpg": modeleAssuranceImg,
  "theluckycharm_delete_the_extra_things": modeleAssuranceImg,
  "Vous-ne-savezpas-si-votre-assurance-copie-2-1024x576.jpg": comparerAssurancesImg,
  "telechargement-1.jpeg": laurentAvatar,
  "telechargement-4.jpeg": claireAvatar,
  "telechargement-3.jpeg": philippeAvatar,
  "telechargement-2.jpeg": sophieAvatar,
};

export const resolveLegacyImageUrl = (src: string): string => {
  if (!src) return src;

  for (const [key, resolved] of Object.entries(legacyImageMap)) {
    if (src.includes(key)) return resolved;
  }

  return src;
};
