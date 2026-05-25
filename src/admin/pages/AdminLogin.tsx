import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import { Loader2, ShieldCheck } from "lucide-react";
import logoOptimis from "@/assets/logo.svg";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { session, isAdmin, isOtpVerified, loading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate(isOtpVerified ? "/admin" : "/admin/verify", { replace: true });
    }
  }, [session, isAdmin, isOtpVerified, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);

    if (signInError) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    // Effect above will redirect once role check completes
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--optimis-green))] to-[hsl(var(--optimis-green-dark))] p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoOptimis} alt="Optimis" className="h-14 w-auto mx-auto brightness-0 invert" />
          <p className="mt-3 text-white/80 text-sm uppercase tracking-widest font-semibold">Espace Admin</p>
        </div>

        <Card className="shadow-2xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <ShieldCheck className="h-5 w-5 text-[hsl(var(--optimis-green))]" />
              <h2 className="text-xl font-bold text-[hsl(var(--optimis-green))]">Connexion sécurisée</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@optimis.ch"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Se connecter"}
              </Button>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Étape suivante : validation par SMS
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
