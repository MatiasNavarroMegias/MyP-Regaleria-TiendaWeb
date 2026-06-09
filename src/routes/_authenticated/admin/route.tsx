import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Package, FileText, Settings, ShoppingBag, LogOut, ExternalLink } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useIsAdmin } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Natalia Santos" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

type NavItem = { to: "/admin" | "/admin/products" | "/admin/content" | "/admin/orders" | "/admin/settings"; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const navItems: NavItem[] = [
  { to: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { to: "/admin/products", label: "Productos", icon: Package },
  { to: "/admin/content", label: "Contenido", icon: FileText },
  { to: "/admin/orders", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/settings", label: "Pagos y envíos", icon: Settings },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useIsAdmin();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!isLoading && isAdmin === false) navigate({ to: "/", replace: true });
  }, [isAdmin, isLoading, navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center text-sm">Cargando panel…</div>;
  }
  if (!isAdmin) {
    return <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center text-sm">Acceso restringido. Redirigiendo…</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <Toaster theme="dark" />
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900/60 flex flex-col">
        <div className="px-6 py-6 border-b border-zinc-800">
          <p className="font-[var(--font-display)] text-lg tracking-tight">NATALIA SANTOS</p>
          <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Panel de admin</p>
        </div>
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((it) => {
            const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
            const Icon = it.icon;
            return (
              <Link
                key={it.to}
                to={it.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active ? "bg-zinc-800 text-white" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
                }`}
              >
                <Icon className="size-4" strokeWidth={1.5} />
                {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-800 p-3 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100">
            <ExternalLink className="size-4" strokeWidth={1.5} />
            Ver tienda
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100">
            <LogOut className="size-4" strokeWidth={1.5} />
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
