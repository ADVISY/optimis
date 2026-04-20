import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ title, subtitle, actions, children }: AdminLayoutProps) {
  return (
    <div className="h-screen flex bg-[hsl(var(--optimis-green-light))] overflow-hidden">
      {/* Sidebar fixe */}
      <AdminSidebar />

      {/* Zone principale scrollable */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-border px-6 md:px-10 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[hsl(var(--optimis-green))]">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>
        <div className="px-6 md:px-10 py-8">{children}</div>
      </main>
    </div>
  );
}
