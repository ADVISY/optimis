// Insurer logos mapping - using existing assets from blog images
// These logos were extracted from the WordPress XML

import allianzLogo from "@/assets/blog/allianz-assurance-voiture.png";
import axaLogo from "@/assets/blog/axa-assurance-voiture.png";
import baloiseLogo from "@/assets/blog/baloise-assurance-voiture.png";
import generaliLogo from "@/assets/blog/generali-assurance-voiture.png";
import helvetiaLogo from "@/assets/blog/helvetia-assurance-voiture.png";
import mobiliereLogo from "@/assets/blog/mobiliere-assurance-voiture.png";
import tcsLogo from "@/assets/blog/tcs-assurance-voiture.png";
import vaudoiseLogo from "@/assets/blog/vaudoise-assurance-voiture.png";
import zurichLogo from "@/assets/blog/zurich-assurance-voiture.png";

export interface InsurerInfo {
  name: string;
  logo: string;
  color: string; // Brand color for accent
}

// Map insurer names to their logos and brand colors
export const insurerLogos: Record<string, InsurerInfo> = {
  // Health insurers (LAMal)
  "Assura": {
    name: "Assura",
    logo: "", // No specific logo available
    color: "#1a5f7a",
  },
  "CSS": {
    name: "CSS",
    logo: "",
    color: "#e30613",
  },
  "Helsana": {
    name: "Helsana",
    logo: "",
    color: "#003366",
  },
  "SWICA": {
    name: "SWICA",
    logo: "",
    color: "#009ee3",
  },
  "Groupe Mutuel": {
    name: "Groupe Mutuel",
    logo: "",
    color: "#0066b3",
  },
  "Sanitas": {
    name: "Sanitas",
    logo: "",
    color: "#e4002b",
  },
  "Concordia": {
    name: "Concordia",
    logo: "",
    color: "#00457c",
  },
  "Visana": {
    name: "Visana",
    logo: "",
    color: "#00a0e1",
  },
  "KPT": {
    name: "KPT",
    logo: "",
    color: "#004d87",
  },
  "Atupri": {
    name: "Atupri",
    logo: "",
    color: "#e30613",
  },
  "ÖKK": {
    name: "ÖKK",
    logo: "",
    color: "#00a0e1",
  },
  "Sympany": {
    name: "Sympany",
    logo: "",
    color: "#ffd100",
  },
  
  // Car/General insurers (with logos)
  "La Mobilière": {
    name: "La Mobilière",
    logo: mobiliereLogo,
    color: "#ff6600",
  },
  "AXA": {
    name: "AXA",
    logo: axaLogo,
    color: "#00008f",
  },
  "Zurich": {
    name: "Zurich",
    logo: zurichLogo,
    color: "#003366",
  },
  "TCS Assurance": {
    name: "TCS Assurance",
    logo: tcsLogo,
    color: "#004c93",
  },
  "TCS Protection": {
    name: "TCS Protection",
    logo: tcsLogo,
    color: "#004c93",
  },
  "Baloise": {
    name: "Baloise",
    logo: baloiseLogo,
    color: "#006eb8",
  },
  "Generali": {
    name: "Generali",
    logo: generaliLogo,
    color: "#c8102e",
  },
  "Helvetia": {
    name: "Helvetia",
    logo: helvetiaLogo,
    color: "#e30513",
  },
  "Vaudoise": {
    name: "Vaudoise",
    logo: vaudoiseLogo,
    color: "#00a651",
  },
  "Allianz": {
    name: "Allianz",
    logo: allianzLogo,
    color: "#003781",
  },
  
  // Other insurers
  "Swiss Life": {
    name: "Swiss Life",
    logo: "",
    color: "#e30613",
  },
  "VIAC": {
    name: "VIAC",
    logo: "",
    color: "#00c389",
  },
  "PostFinance": {
    name: "PostFinance",
    logo: "",
    color: "#ffcc00",
  },
  "UBS": {
    name: "UBS",
    logo: "",
    color: "#e60000",
  },
  "Credit Suisse": {
    name: "Credit Suisse",
    logo: "",
    color: "#003b6f",
  },
  "Raiffeisen": {
    name: "Raiffeisen",
    logo: "",
    color: "#fdc300",
  },
  "BCV": {
    name: "BCV",
    logo: "",
    color: "#003e6a",
  },
  "Smile": {
    name: "Smile",
    logo: "",
    color: "#ff6600",
  },
  "Dextra": {
    name: "Dextra",
    logo: "",
    color: "#00274d",
  },
  "ARAG": {
    name: "ARAG",
    logo: "",
    color: "#0053a3",
  },
  "CAP": {
    name: "CAP",
    logo: "",
    color: "#003366",
  },
};

// Get insurer info with fallback
export const getInsurerInfo = (name: string): InsurerInfo => {
  return insurerLogos[name] || {
    name,
    logo: "",
    color: "#2D5A3D", // Default to primary brand color
  };
};

// Generate initials for insurers without logos
export const getInsurerInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};
