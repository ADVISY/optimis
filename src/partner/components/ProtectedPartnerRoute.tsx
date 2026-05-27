import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePartnerAuth } from "@/partner/hooks/usePartnerAuth";
import { Loader2 } from "lucide-react";

export function ProtectedPartnerRoute({ children }: { children: ReactNode }) {
  const { session, isPartner, loading, user } = usePartnerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/partner/login" replace state={{ from: location.pathname }} />;
  }

  if (user && !isPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center bg-white rounded-2xl p-10 shadow-xl">
          <h2 className="text-2xl font-bold text-destructive mb-3">Accès refusé</h2>
          <p className="text-muted-foreground">Votre compte n'a pas le rôle "partner". Contactez votre administrateur Optimis.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
