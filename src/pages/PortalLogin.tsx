import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Building2, ArrowRight } from "lucide-react";
import logoOptimis from "@/assets/logo.svg";

export default function PortalLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[hsl(var(--optimis-green-dark))] p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <img src={logoOptimis} alt="Optimis" className="h-14 w-auto mx-auto brightness-0 invert" />
          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-white">
            Bienvenue sur Optimis
          </h1>
          <p className="mt-3 text-white/70 text-base">
            Choisissez votre espace de connexion
          </p>
        </div>

        {/* 2 cards côte à côte */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Espace Admin */}
          <Card
            className="overflow-hidden border-0 shadow-2xl hover:shadow-[hsl(var(--optimis-green))]/30 hover:scale-[1.02] transition-all cursor-pointer group"
            onClick={() => navigate("/admin/login")}
          >
            <div className="h-2 bg-[hsl(var(--optimis-green))]" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-[hsl(var(--optimis-green))]/10 flex items-center justify-center">
                  <ShieldCheck className="h-7 w-7 text-[hsl(var(--optimis-green))]" />
                </div>
                <span className="text-xs uppercase tracking-widest text-[hsl(var(--optimis-green))] font-bold">
                  Administrateur
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Espace Admin</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Gérer les leads, les courtiers, les commandes, les factures et la distribution.
                Réservé à l'équipe Optimislink.
              </p>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/admin/login");
                }}
                size="lg"
                className="w-full bg-[hsl(var(--optimis-green))] hover:bg-[hsl(var(--optimis-green-dark))] text-white group-hover:gap-3 transition-all"
              >
                Se connecter en tant qu'admin
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Espace Courtier */}
          <Card
            className="overflow-hidden border-0 shadow-2xl hover:shadow-slate-900/30 hover:scale-[1.02] transition-all cursor-pointer group"
            onClick={() => navigate("/partner/login")}
          >
            <div className="h-2 bg-slate-800" />
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Building2 className="h-7 w-7 text-slate-800" />
                </div>
                <span className="text-xs uppercase tracking-widest text-slate-700 font-bold">
                  Courtier partenaire
                </span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Espace Courtier</h2>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                Consulter vos leads reçus, suivre vos commandes et factures, mettre à jour le statut
                commercial de chaque prospect.
              </p>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/partner/login");
                }}
                size="lg"
                className="w-full bg-slate-800 hover:bg-slate-900 text-white group-hover:gap-3 transition-all"
              >
                Se connecter en tant que courtier
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-xs text-white/40">
            Pas encore inscrit ? Contactez{" "}
            <a href="mailto:lesiteoptimis@gmail.com" className="text-white/60 hover:text-white underline">
              lesiteoptimis@gmail.com
            </a>
          </p>
          <a
            href="/"
            className="inline-block mt-3 text-xs text-white/40 hover:text-white/70 underline"
          >
            ← Retour au site public
          </a>
        </div>
      </div>
    </div>
  );
}
