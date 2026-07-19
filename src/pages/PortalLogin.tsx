import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import logoOptimis from "@/assets/logo.svg";

export default function PortalLogin() {
  const navigate = useNavigate();
  const [courtierLogoError, setCourtierLogoError] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b font-sans"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--optimis-green-light)) 0%, hsl(var(--optimis-green-pastel)) 100%)",
      }}
    >
      {/* Header minimaliste */}
      <header className="px-8 py-6 flex items-center justify-between">
        <img src={logoOptimis} alt="Optimis" className="h-7 w-auto" />
        <a
          href="/"
          className="text-xs text-[hsl(var(--optimis-green))]/60 hover:text-[hsl(var(--optimis-green))] transition-colors"
        >
          Site public ↗
        </a>
      </header>

      {/* Contenu centré */}
      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-md">
          {/* Titre épuré */}
          <h1
            className="font-heading text-5xl text-[hsl(var(--optimis-green))] mb-2 tracking-tight"
            style={{ fontFamily: "Lovelo, Ruda, system-ui, sans-serif" }}
          >
            Bienvenue.
          </h1>
          <p className="text-base text-[hsl(var(--optimis-green))]/60 mb-12">
            Sélectionnez votre espace.
          </p>

          {/* Card Admin */}
          <button
            onClick={() => navigate("/admin/login")}
            className="group w-full bg-white rounded-2xl p-6 mb-3 flex items-center justify-between text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[hsl(var(--optimis-green))] flex items-center justify-center">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div>
                <div className="text-base font-semibold text-[hsl(var(--optimis-green))]">
                  Administrateur
                </div>
                <div className="text-xs text-[hsl(var(--optimis-green))]/50">
                  Optimislink
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-[hsl(var(--optimis-green))]/40 group-hover:text-[hsl(var(--optimis-green))] group-hover:rotate-45 transition-all duration-300" />
          </button>

          {/* Card Courtier */}
          <button
            onClick={() => navigate("/partner/login")}
            className="group w-full bg-white rounded-2xl p-6 flex items-center justify-between text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                {courtierLogoError ? (
                  <span className="text-white text-xl font-bold">C</span>
                ) : (
                  <img
                    src="/lyta-courtier.png"
                    alt="LYTA"
                    className="h-full w-full object-contain p-1"
                    onError={() => setCourtierLogoError(true)}
                  />
                )}
              </div>
              <div>
                <div className="text-base font-semibold text-[hsl(var(--optimis-green))]">
                  Courtier
                </div>
                <div className="text-xs text-[hsl(var(--optimis-green))]/50">
                  Suivi de vos leads
                </div>
              </div>
            </div>
            <ArrowUpRight className="h-5 w-5 text-[hsl(var(--optimis-green))]/40 group-hover:text-[hsl(var(--optimis-green))] group-hover:rotate-45 transition-all duration-300" />
          </button>
        </div>
      </main>

      {/* Footer ultra-discret */}
      <footer className="px-8 py-6 text-center">
        <a
          href="mailto:lesiteoptimis@gmail.com"
          className="text-xs text-[hsl(var(--optimis-green))]/40 hover:text-[hsl(var(--optimis-green))]/70 transition-colors"
        >
          lesiteoptimis@gmail.com
        </a>
      </footer>
    </div>
  );
}
