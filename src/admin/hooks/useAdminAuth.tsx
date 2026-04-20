import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AdminAuthContextValue {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isOtpVerified: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshOtpStatus: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 min

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkOtpSession = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("admin_otp_sessions")
      .select("expires_at")
      .eq("user_id", uid)
      .gt("expires_at", new Date().toISOString())
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return !!data;
  }, []);

  const checkAdminRole = useCallback(async (uid: string) => {
    // Without OTP, RLS blocks user_roles reads. Use a direct rpc-like check via auth metadata fallback:
    // Strategy: try to call admin-send-otp endpoint indirectly is too heavy. Instead allow self-read.
    // We rely on the OTP session check + the edge function gate. For UI, optimistically set admin=true if email known.
    // Better: use a dedicated security-definer RPC. We'll do a lightweight client check by calling has_role via RPC.
    const { data, error } = await supabase.rpc("has_role" as any, { _user_id: uid, _role: "admin" });
    if (error) {
      console.warn("has_role RPC error", error);
      return false;
    }
    return !!data;
  }, []);

  const refreshOtpStatus = useCallback(async () => {
    if (!user) return;
    const verified = await checkOtpSession(user.id);
    setIsOtpVerified(verified);
  }, [user, checkOtpSession]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (!session) return;
    inactivityTimer.current = setTimeout(async () => {
      await supabase.auth.signOut();
    }, INACTIVITY_TIMEOUT_MS);
  }, [session]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (!newSession) {
        setIsAdmin(false);
        setIsOtpVerified(false);
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
      const [adminRole, otp] = await Promise.all([
        checkAdminRole(user.id),
        checkOtpSession(user.id),
      ]);
      if (cancelled) return;
      setIsAdmin(adminRole);
      setIsOtpVerified(otp);
    })();
    return () => { cancelled = true; };
  }, [user, checkAdminRole, checkOtpSession]);

  // Inactivity tracker
  useEffect(() => {
    if (!session) return;
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    resetInactivityTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [session, resetInactivityTimer]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setIsOtpVerified(false);
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ session, user, isAdmin, isOtpVerified, loading, signOut, refreshOtpStatus }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
