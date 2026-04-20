import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, FileText, LogOut } from "lucide-react";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import logoOptimis from "@/assets/logo.svg";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users, end: false },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag, end: false },
  { to: "/admin/factures", label: "Factures", icon: FileText, end: false },
];

export function AdminSidebar() {
  const { signOut, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-[hsl(var(--optimis-green))] text-white shadow-xl">
      <div className="px-6 py-6 border-b border-white/10">
        <img src={logoOptimis} alt="Optimis" className="h-10 w-auto brightness-0 invert" />
        <p className="mt-2 text-xs uppercase tracking-wider text-white/60 font-semibold">Espace Admin</p>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-[hsl(var(--optimis-green))] shadow-md"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs text-white/60">Connecté</p>
          <p className="text-sm font-medium truncate">{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
