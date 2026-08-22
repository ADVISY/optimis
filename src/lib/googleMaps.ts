// Chargement paresseux de l'API Google Maps (librairie Places) + helper
// d'autocomplétion d'adresse restreinte à la Suisse. La clé est une clé front
// (restreinte par referrer HTTP côté Google Cloud), donc exposable côté client.

// Clé lue UNIQUEMENT depuis l'environnement (jamais en dur dans le code :
// le repo est public). À définir : `.env` en local + variable Vercel en prod
// (VITE_GOOGLE_MAPS_KEY). Sans clé → pas d'autocomplétion, saisie manuelle.
const GOOGLE_MAPS_KEY = (import.meta.env.VITE_GOOGLE_MAPS_KEY as string | undefined) || "";

let loaderPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!GOOGLE_MAPS_KEY) {
    return Promise.reject(new Error("VITE_GOOGLE_MAPS_KEY manquante"));
  }
  const w = window as unknown as { google?: { maps?: { places?: unknown } } };
  if (w.google?.maps?.places) return Promise.resolve();
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places&language=fr&region=CH&loading=async`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Échec du chargement de Google Maps"));
    document.head.appendChild(script);
  });
  return loaderPromise;
}

export type ParsedAddress = {
  route: string;
  streetNumber: string;
  postalCode: string;
  city: string;
  canton: string;
  formatted: string;
};

/**
 * Attache l'autocomplétion Google à un input adresse (Suisse uniquement).
 * Appelle onSelect avec les composants parsés à chaque sélection.
 * Retourne l'instance Autocomplete (pour nettoyage des listeners).
 */
export async function attachAddressAutocomplete(
  input: HTMLInputElement,
  onSelect: (a: ParsedAddress) => void,
): Promise<unknown> {
  await loadGoogleMaps();
  const g = (window as unknown as { google: any }).google;

  const ac = new g.maps.places.Autocomplete(input, {
    types: ["address"],
    componentRestrictions: { country: "ch" },
    fields: ["address_components", "formatted_address"],
  });

  ac.addListener("place_changed", () => {
    const place = ac.getPlace();
    const comp: Record<string, { long: string; short: string }> = {};
    (place.address_components || []).forEach((c: any) => {
      (c.types || []).forEach((t: string) => {
        comp[t] = { long: c.long_name, short: c.short_name };
      });
    });
    onSelect({
      route: comp.route?.long || "",
      streetNumber: comp.street_number?.long || "",
      postalCode: comp.postal_code?.long || "",
      city: comp.locality?.long || comp.postal_town?.long || "",
      canton: comp.administrative_area_level_1?.short || "",
      formatted: place.formatted_address || "",
    });
  });

  return ac;
}
