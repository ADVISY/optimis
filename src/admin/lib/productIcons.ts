// Icônes 3D glass par domaine produit (vert Optimis)
// Utilisées par défaut sur les cartes produits si aucune image custom n'est uploadée.

import assuranceMaladie from "@/assets/products/assurance-maladie.png";
import lpp from "@/assets/products/lpp.png";
import hypotheque from "@/assets/products/hypotheque.png";
import assuranceNonVie from "@/assets/products/assurance-non-vie.png";
import assuranceVie from "@/assets/products/assurance-vie.png";
import telecom from "@/assets/products/telecom.png";
import immobilier from "@/assets/products/immobilier.png";
import energie from "@/assets/products/energie.png";
import autre from "@/assets/products/autre.png";

import type { OrderDomain } from "@/admin/lib/productCategories";

export const PRODUCT_DOMAIN_ICONS: Record<OrderDomain, string> = {
  assurance_maladie: assuranceMaladie,
  lpp,
  hypotheque,
  assurance_non_vie: assuranceNonVie,
  assurance_vie: assuranceVie,
  telecom,
  immobilier,
  energie,
  autre,
};

export function getProductIcon(domain: string, customUrl?: string | null): string {
  if (customUrl) return customUrl;
  return PRODUCT_DOMAIN_ICONS[domain as OrderDomain] ?? autre;
}
