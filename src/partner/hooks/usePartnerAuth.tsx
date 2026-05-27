import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface PartnerAuthContextValue {
  session: Session | null;
  user: User | null;
  isPartner: boolean;
  clientIds: string[];
  cabinets: { id: string; company_name: string }[];
  loading: boolean;
  signOut: () => Promise<void>;
}

const PartnerAuthContext = createContext<PartnerAuthContextValue | undefined>(undefined);

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isPartner, setIsPartner] = useState(false);
  const [clientIds, setClientIds] = useState<string[]>([]);
  const [cabinets, setCabinets] = useState<{ id: string; company_name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const checkPartnerRole = useCallback(async (uid: string) => {
    const { data, error } = await supabase.rpc("has_role" as any, { _user_id: uid, _role: "partner" });
    if (error) {
      console.warn("has_role partner error", error);
      return false;
    }
    return !!data;
  }, []);

  const loadCabinets = useCallback(async () => {
    const { data, error } = await supabase
      .from("partner_user_clients")
      .select("client_id, admin_clients(id, company_name)");
    if (error) {
      console.error("loadCabinets error", error);
      return { ids: [], cabinets: [] };
    }
    const ids = (data ?? []).map((r: any) => r.client_id);
    const cabinets = (data ?? []).map((r: any) => r.admin_clients).filter(Boolean);
    return { ids, cabinets };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession) {
        setIsPartner(false);
        setClientIds([]);
        setCabinets([]);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const isP = await checkPartnerRole(user.id);
      if (cancelled) return;
      setIsPartner(isP);
      if (isP) {
        const { ids, cabinets: cabs } = await loadCabinets();
        if (cancelled) return;
        setClientIds(ids);
        setCabinets(cabs);
      }
    })();
    return () => { cancelled = true; };
  }, [user, checkPartnerRole, loadCabinets]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsPartner(false);
    setClientIds([]);
    setCabinets([]);
  }, []);

  return (
    <PartnerAuthContext.Provider value={{ session, user, isPartner, clientIds, cabinets, loading, signOut }}>
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const ctx = useContext(PartnerAuthContext);
  if (!ctx) throw new Error("usePartnerAuth must be used inside PartnerAuthProvider");
  return ctx;
}
