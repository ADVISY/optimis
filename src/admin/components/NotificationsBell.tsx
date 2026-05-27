import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";

const TYPE_ICONS: Record<string, string> = {
  commande_livree: "✓",
  commande_expiree: "⚠",
  lead_nouveau: "📥",
};

const TYPE_COLORS: Record<string, string> = {
  commande_livree: "text-green-600 bg-green-50",
  commande_expiree: "text-orange-600 bg-orange-50",
  lead_nouveau: "text-blue-600 bg-blue-50",
};

export function NotificationsBell() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAdminAuth();
  const [open, setOpen] = useState(false);

  // Fetch notifs non lues (broadcast NULL ou ciblées à l'admin courant)
  const { data: notifs } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("lu", false)
        .order("cree_le", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data ?? [];
    },
    refetchInterval: 30000, // refresh toutes les 30 sec
  });

  // Realtime subscription pour push instantané
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel("notifications-bell")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => qc.invalidateQueries({ queryKey: ["notifications"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, qc]);

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ lu: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const ids = (notifs ?? []).map((n: any) => n.id);
      if (ids.length === 0) return;
      const { error } = await supabase.from("notifications").update({ lu: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleClick = (notif: any) => {
    markReadMutation.mutate(notif.id);
    if (notif.lien) navigate(notif.lien);
    setOpen(false);
  };

  const count = notifs?.length ?? 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative h-10 w-10 p-0">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 text-[10px] rounded-full"
            >
              {count > 99 ? "99+" : count}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <span className="font-semibold text-sm">Notifications</span>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              className="text-xs h-7"
            >
              <CheckCheck className="h-3 w-3 mr-1" /> Tout marquer lu
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {count === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune notification</p>
            </div>
          ) : (
            (notifs ?? []).map((n: any) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className="w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors flex items-start gap-3"
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    TYPE_COLORS[n.type] ?? "bg-slate-100 text-slate-600"
                  }`}
                >
                  {TYPE_ICONS[n.type] ?? "•"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{n.titre}</div>
                  {n.message && (
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</div>
                  )}
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.cree_le).toLocaleString("fr-CH", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    markReadMutation.mutate(n.id);
                  }}
                  title="Marquer comme lu"
                >
                  <X className="h-3 w-3" />
                </Button>
              </button>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
