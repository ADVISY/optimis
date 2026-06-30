import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { captureAttribution } from "./lib/attribution";

// Capture UTM / ttclid / fbclid / gclid dès le tout premier chargement,
// avant même le rendu React, pour ne rien perdre en cas de redirection.
captureAttribution();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
