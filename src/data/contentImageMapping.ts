// Mapping of WordPress content image URLs to local assets
// These replace the broken images from le-comparateur-optimis.ch/wp-content/uploads/

import choisirModeleImg from "@/assets/blog/content/choisir-modele-assurance.jpg";
import dateLimiteImg from "@/assets/blog/content/date-limite-changement.jpg";
import prixProtectionImg from "@/assets/blog/content/prix-protection-juridique.jpg";
import typesProtectionImg from "@/assets/blog/content/types-protection-juridique.jpg";
import souscriptionProtectionImg from "@/assets/blog/content/souscription-protection-juridique.jpg";
import subsideAssuranceImg from "@/assets/blog/content/subside-assurance.jpg";
import questionsAssuranceImg from "@/assets/blog/content/questions-assurance.jpg";
import changementAssuranceImg from "@/assets/blog/content/changement-assurance.jpg";
import prixDentaireImg from "@/assets/blog/content/prix-assurance-dentaire.jpg";
import assuranceMenageImg from "@/assets/blog/content/assurance-menage.jpg";
import comparerAssurancesImg from "@/assets/blog/content/comparer-assurances.jpg";
import reduirePrimesImg from "@/assets/blog/content/reduire-primes.jpg";

// Map WordPress filenames (partial matches) to local images
const imageMapping: Record<string, string> = {
  "Choisir-son-modele-d-assurance-maladie-tableau": choisirModeleImg,
  "La-date-limite-de-changement-est-depassee": dateLimiteImg,
  "Quel-est-le-prix-de-lassurance-protection-juridique": prixProtectionImg,
  "Quelles-sont-les-differentes-types-de-protection-juridique": typesProtectionImg,
  "Vous-ne-savez-pas-ce-que-vous-devez-savoir-pour-la-souscription": souscriptionProtectionImg,
  "Vous-ne-savezpas-si-votre-assurance-3": questionsAssuranceImg,
  "Vous-ne-savezpas-si-votre-assurance-5": questionsAssuranceImg,
  "Vous-ne-savezpas-si-votre-assurance-copie-1": subsideAssuranceImg,
  "Vous-ne-savezpas-si-votre-assurance-copie-2-1": subsideAssuranceImg,
  "Vous-ne-savezpas-si-votre-assurance-copie-2": subsideAssuranceImg,
  "Vous-avez-probablement-des-questions-avant-de-vous-lancer-dans-un-changement-dassurance-1-1": changementAssuranceImg,
  "Vous-avez-probablement-des-questions-avant-de-vous-lancer-dans-un-changement-dassurance-1-2": changementAssuranceImg,
  "quel-est-le-prix-dune-assurance-dentaire": prixDentaireImg,
  "menage": assuranceMenageImg,
  "comparer-assurances-suisse-optimis": comparerAssurancesImg,
  "comment-reduire-primes-assurance-maladie-suisse": reduirePrimesImg,
};

/**
 * Resolve a WordPress image URL to a local asset path.
 * Returns the local import path if matched, or null if no match found.
 */
export function resolveContentImage(src: string): string | null {
  // Extract filename from full URL or template literal
  const filename = src
    .replace("https://le-comparateur-optimis.ch/wp-content/uploads/", "")
    .replace("${WP_IMAGE_BASE}/", "");

  for (const [key, localPath] of Object.entries(imageMapping)) {
    if (filename.includes(key)) {
      return localPath;
    }
  }
  return null;
}
