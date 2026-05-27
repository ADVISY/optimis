import { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Inbox, ShoppingBag, FileText, LogOut, User } from "lucide-react";
import { usePartnerAuth } from "@/partner/hooks/usePartnerAuth";
import { cn } from "@/lib/utils";
import logoOptimis from "@/assets/logo.svg";

const navItems = [
  { to: "/partner", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/partner/leads", label: "Mes leads", icon: Inbox, end: false },
  { to: "/partner/commandes", label: "Mes commandes", icon: ShoppingBag, end: false },
  { to: "/partner/factures", label: "Mes factures", icon: FileText, end: false },
];

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function PartnerLayout({ title, subtitle, children }: Props) {
  const { signOut, user, cabinets } = usePartnerAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/partner/login", { replace: true });
  };

  const cabinetLabel = cabinets[0]?.company_name ?? "Espace courtier";

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 h-screen flex-col bg-slate-900 text-white shadow-xl flex-shrink-0">
        <div className="px-6 py-6 border-b border-white/10 flex-shrink-0">
          <img src={logoOptimis} alt="Optimis" className="h-8 w-auto brightness-0 invert" />
          <p className="mt-2 text-xs uppercase tracking-wider text-white/60 font-semibold">Espace Partenaire</p>
          <p className="mt-1 text-sm font-medium text-white truncate">{cabinetLabel}</p>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/5">
            <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold flex-shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60 truncate">Connecté</p>
              <p className="text-sm font-medium truncate">{user?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-6 md:px-10 py-5">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </header>
        <div className="px-6 md:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
