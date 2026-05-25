import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, KeyRound, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";

interface AdminProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone_e164: string;
}

export default function AdminProfile() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAdminAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as AdminProfile | null;
    },
  });

  useEffect(() => {
    if (data) {
      const full = (data.full_name ?? "").trim();
      const parts = full.split(/\s+/);
      setFirstName(parts[0] ?? "");
      setLastName(parts.slice(1).join(" "));
      setEmail(data.email ?? user?.email ?? "");
      setPhone(data.phone_e164 ?? "");
    } else if (user) {
      setEmail(user.email ?? "");
    }
  }, [data, user]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Non connecté");
      const fullName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

      // 1. Update profil (nom + tel)
      if (data?.id) {
        const { error } = await supabase
          .from("admin_profiles")
          .update({
            full_name: fullName || null,
            phone_e164: phone.trim(),
          })
          .eq("id", data.id);
        if (error) throw error;
      }

      // 2. Update email auth (déclenche email de confirmation Supabase)
      if (email && email !== user.email) {
        const { error } = await supabase.auth.updateUser({ email });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-profile"] });
      toast({
        title: "Profil enregistré",
        description:
          email && email !== user?.email
            ? "Un email de confirmation a été envoyé à la nouvelle adresse."
            : undefined,
      });
    },
    onError: (e: any) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const changePwd = useMutation({
    mutationFn: async () => {
      if (pwd.length < 8) throw new Error("8 caractères minimum");
      if (pwd !== pwd2) throw new Error("Les mots de passe ne correspondent pas");
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) throw error;
    },
    onSuccess: () => {
      setPwd("");
      setPwd2("");
      toast({ title: "Mot de passe modifié" });
    },
    onError: (e: any) =>
      toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <AdminLayout title="Mon profil">
        <div className="p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Mon profil"
      subtitle="Modifiez vos informations personnelles et votre mot de passe"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        {/* Identité */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--optimis-green))]">
              Informations personnelles
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Prénom</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {email && email !== user?.email && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Un email de confirmation sera envoyé à la nouvelle adresse.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Téléphone (format E.164)</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+41791234567"
              />
              <p className="text-xs text-muted-foreground">
                Utilisé pour la réception des codes OTP.
              </p>
            </div>
            <Button
              onClick={() => saveProfile.mutate()}
              disabled={saveProfile.isPending}
              className="w-full"
            >
              {saveProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Enregistrer le profil
            </Button>
          </CardContent>
        </Card>

        {/* Mot de passe */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-bold text-[hsl(var(--optimis-green))] flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Changer mon mot de passe
            </h3>
            <div className="space-y-2">
              <Label>Nouveau mot de passe</Label>
              <Input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
            </div>
            <div className="space-y-2">
              <Label>Confirmer le mot de passe</Label>
              <Input
                type="password"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button
              onClick={() => changePwd.mutate()}
              disabled={changePwd.isPending || !pwd || !pwd2}
              variant="outline"
              className="w-full"
            >
              {changePwd.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <KeyRound className="h-4 w-4" />
              )}
              Modifier le mot de passe
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
