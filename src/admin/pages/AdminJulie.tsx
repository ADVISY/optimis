import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/admin/components/AdminLayout";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Search, CalendarCheck2, Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type WaMessage = { wa_from: string; direction: string; body: string; created_at: string };
type WaRdv = { wa_from: string; creneau_label: string | null; creneau_iso: string | null; created_at: string };

const db = supabase as any;

const fmtPhone = (p: string) => (p?.startsWith("+") ? p : "+" + p);
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-CH", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminJulie() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: messages, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["julie-messages"],
    queryFn: async () => {
      const { data, error } = await db
        .from("wa_messages")
        .select("wa_from, direction, body, created_at")
        .order("created_at", { ascending: true })
        .limit(3000);
      if (error) throw error;
      return (data ?? []) as WaMessage[];
    },
    refetchInterval: 15000,
  });

  const { data: rdvs } = useQuery({
    queryKey: ["julie-rdv"],
    queryFn: async () => {
      const { data } = await db
        .from("wa_rdv")
        .select("wa_from, creneau_label, creneau_iso, created_at")
        .order("created_at", { ascending: false });
      return (data ?? []) as WaRdv[];
    },
    refetchInterval: 30000,
  });

  const rdvByPhone = useMemo(() => {
    const m = new Map<string, WaRdv>();
    for (const r of rdvs ?? []) if (!m.has(r.wa_from)) m.set(r.wa_from, r);
    return m;
  }, [rdvs]);

  const conversations = useMemo(() => {
    const map = new Map<string, WaMessage[]>();
    for (const msg of messages ?? []) {
      if (!map.has(msg.wa_from)) map.set(msg.wa_from, []);
      map.get(msg.wa_from)!.push(msg);
    }
    const list = Array.from(map.entries()).map(([phone, msgs]) => ({
      phone,
      msgs,
      last: msgs[msgs.length - 1],
      count: msgs.length,
    }));
    list.sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime());
    return list;
  }, [messages]);

  const filtered = useMemo(() => {
    const q = search.replace(/\D/g, "");
    return q ? conversations.filter((c) => c.phone.includes(q)) : conversations;
  }, [conversations, search]);

  const current = filtered.find((c) => c.phone === selected) ?? filtered[0] ?? null;

  return (
    <AdminLayout
      title="Conversations Julie"
      subtitle="Toutes les discussions WhatsApp de l'agent IA, en direct"
      actions={
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} /> Rafraîchir
        </button>
      }
    >
      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Liste des conversations */}
        <div className="w-80 flex-shrink-0 flex flex-col rounded-2xl border bg-white overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un numéro…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">
                Aucune conversation pour l'instant.
              </p>
            ) : (
              filtered.map((c) => {
                const rdv = rdvByPhone.get(c.phone);
                const active = current?.phone === c.phone;
                return (
                  <button
                    key={c.phone}
                    onClick={() => setSelected(c.phone)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition",
                      active && "bg-[hsl(var(--optimis-green-light))]"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm">{fmtPhone(c.phone)}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {fmtTime(c.last.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.last.direction === "out" ? "Julie : " : ""}
                      {c.last.body}
                    </p>
                    {rdv && (
                      <Badge className="mt-1 bg-[hsl(var(--optimis-green))] text-white text-[10px] border-0">
                        <CalendarCheck2 className="h-3 w-3 mr-1" /> RDV
                      </Badge>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Fil de la conversation */}
        <div className="flex-1 flex flex-col rounded-2xl border bg-[#efeae2] overflow-hidden">
          {current ? (
            <>
              <div className="px-5 py-3 bg-white border-b flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-[hsl(var(--optimis-green))] text-white flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{fmtPhone(current.phone)}</p>
                    <p className="text-xs text-muted-foreground">{current.count} messages</p>
                  </div>
                </div>
                {rdvByPhone.get(current.phone) && (
                  <Badge className="bg-[hsl(var(--optimis-green))] text-white border-0 flex-shrink-0">
                    <CalendarCheck2 className="h-3 w-3 mr-1" />
                    RDV : {rdvByPhone.get(current.phone)!.creneau_label ?? "pris"}
                  </Badge>
                )}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {current.msgs.map((m, i) => (
                  <div key={i} className={cn("flex", m.direction === "out" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-wrap break-words",
                        m.direction === "out"
                          ? "bg-[#d9fdd3] rounded-br-sm"
                          : "bg-white rounded-bl-sm"
                      )}
                    >
                      {m.body}
                      <div className="text-[10px] text-muted-foreground mt-1 text-right">
                        {fmtTime(m.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Sélectionne une conversation à gauche.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
