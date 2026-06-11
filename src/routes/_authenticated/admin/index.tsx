import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, FileText, ShoppingBag, Settings, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [products, orders, pending] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "Pendiente"),
      ]);
      return {
        products: products.count ?? 0,
        orders: orders.count ?? 0,
        pending: pending.count ?? 0,
      };
    },
  });

  const cards = [
    { label: "Productos", value: stats.data?.products, to: "/admin/products", icon: Package },
    { label: "Pedidos totales", value: stats.data?.orders, to: "/admin/orders", icon: ShoppingBag },
    { label: "Pedidos pendientes", value: stats.data?.pending, to: "/admin/orders", icon: ShoppingBag },
  ];

  const links = [
    { to: "/admin/products", label: "Gestionar productos", icon: Package, desc: "Agregar, editar y eliminar fragancias" },
    { to: "/admin/content", label: "Contenido del sitio", icon: FileText, desc: "Editar banner, categorías, contacto y footer" },
    { to: "/admin/apariencia", label: "Apariencia y colores", icon: Palette, desc: "Personalizar la paleta de colores del sitio" },
    { to: "/admin/orders", label: "Pedidos", icon: ShoppingBag, desc: "Cargar y actualizar pedidos manuales" },
    { to: "/admin/settings", label: "Pagos y envíos", icon: Settings, desc: "Activar métodos de pago y opciones de envío" },
  ] as const;

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-3xl mb-2">Buenas, Natalia</h1>
      <p className="text-zinc-400 text-sm mb-10">Resumen rápido de tu tienda.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.label} to={c.to} className="block bg-zinc-900 border border-zinc-800 rounded-md p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500">{c.label}</span>
                <Icon className="size-4 text-zinc-600" strokeWidth={1.5} />
              </div>
              <p className="text-4xl font-[var(--font-display)]">{c.value ?? "—"}</p>
            </Link>
          );
        })}
      </div>

      <h2 className="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Accesos rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {links.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.to} to={l.to} className="flex items-start gap-4 bg-zinc-900 border border-zinc-800 rounded-md p-5 hover:border-zinc-700 transition-colors">
              <Icon className="size-5 text-zinc-400 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="font-medium">{l.label}</p>
                <p className="text-sm text-zinc-500">{l.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
