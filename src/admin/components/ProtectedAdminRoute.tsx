import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { Loader2 } from "lucide-react";

export function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const { session, isAdmin, isOtpVerified, loading, user } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--optimis-green-light))]">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--optimis-green))]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in but role check still pending OR not admin
  if (user && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--optimis-green-light))] p-6">
        <div className="max-w-md text-center bg-white rounded-2xl p-10 shadow-xl">
          <h2 className="text-2xl font-bold text-destructive mb-3">Accès refusé</h2>
          <p className="text-muted-foreground">Votre compte n'a pas les droits d'administration.</p>
        </div>
      </div>
    );
  }

  if (!isOtpVerified) {
    return <Navigate to="/admin/verify" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
