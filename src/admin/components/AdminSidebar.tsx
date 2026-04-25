import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, ShoppingBag, FileText, LogOut, User, Settings, Package } from "lucide-react";
import { useAdminAuth } from "@/admin/hooks/useAdminAuth";
import logoOptimis from "@/assets/logo.svg";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Clients", icon: Users, end: false },
  { to: "/admin/commandes", label: "Commandes", icon: ShoppingBag, end: false },
  { to: "/admin/factures", label: "Factures", icon: FileText, end: false },
  { to: "/admin/produits", label: "Produits", icon: Package, end: false },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings, end: false },
];

export function AdminSidebar() {
  const { signOut, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const initials = (user?.email ?? "A").slice(0, 1).toUpperCase();

  return (
    // Sidebar 100vh, ne défile jamais avec le contenu
    <aside className="hidden md:flex w-64 h-screen flex-col bg-[hsl(var(--optimis-green))] text-white shadow-xl flex-shrink-0">
      {/* Logo - fixe en haut */}
      <div className="px-6 py-6 border-b border-white/10 flex-shrink-0">
        <img src={logoOptimis} alt="Optimis" className="h-10 w-auto brightness-0 invert" />
        <p className="mt-2 text-xs uppercase tracking-wider text-white/60 font-semibold">Espace Admin</p>
      </div>

      {/* Navigation - scrollable uniquement si trop d'items */}
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

      {/* Widget profil - toujours visible en bas */}
      <div className="px-3 py-4 border-t border-white/10 flex-shrink-0 bg-[hsl(var(--optimis-green))]">
        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-white/5">
          <div className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-white/60 truncate">Connecté</p>
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
        </div>
        <NavLink
          to="/admin/profil"
          className={({ isActive }) =>
            cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all",
              isActive
                ? "bg-white text-[hsl(var(--optimis-green))] shadow-md"
                : "text-white/80 hover:bg-white/10 hover:text-white"
            )
          }
        >
          <User className="h-4 w-4" />
          Mon profil
        </NavLink>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
