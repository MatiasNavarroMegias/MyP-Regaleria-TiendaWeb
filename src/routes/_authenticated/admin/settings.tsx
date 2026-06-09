import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsAdmin,
});

function SettingsAdmin() {
  return (
    <div>
      <h1 className="font-[var(--font-display)] text-3xl mb-2">Pagos y envíos</h1>
      <p className="text-zinc-400 text-sm mb-10">Activá o desactivá los métodos disponibles para tus clientes.</p>
      <div className="grid lg:grid-cols-2 gap-6">
        <Section title="Métodos de pago" table="payment_methods" hasPrice={false} />
        <Section title="Opciones de envío" table="shipping_options" hasPrice={true} />
      </div>
    </div>
  );
}

function Section({ title, table, hasPrice }: { title: string; table: "payment_methods" | "shipping_options"; hasPrice: boolean }) {
  const qc = useQueryClient();
  const [adding, setAdding] = useState("");
  const [addPrice, setAddPrice] = useState(0);

  const { data: items = [] } = useQuery({
    queryKey: [table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const toggle = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from(table).update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });

  const updatePrice = useMutation({
    mutationFn: async ({ id, price }: { id: string; price: number }) => {
      const { error } = await supabase.from(table).update({ price }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [table] }),
  });

  const add = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = { name: adding, enabled: true };
      if (hasPrice) payload.price = addPrice;
      const { error } = await supabase.from(table).insert(payload as never);
      if (error) throw error;
    },
    onSuccess: () => { setAdding(""); setAddPrice(0); qc.invalidateQueries({ queryKey: [table] }); toast.success("Agregado"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
      <h2 className="font-[var(--font-display)] text-xl mb-4">{title}</h2>
      <ul className="divide-y divide-zinc-800 mb-5">
        {items.map((it) => (
          <li key={it.id} className="py-3 flex items-center gap-3">
            <input
              type="checkbox"
              checked={it.enabled}
              onChange={(e) => toggle.mutate({ id: it.id, enabled: e.target.checked })}
              className="size-4"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{it.name}</p>
              {"description" in it && it.description && <p className="text-xs text-zinc-500 truncate">{it.description}</p>}
            </div>
            {hasPrice && "price" in it && (
              <input
                type="number"
                defaultValue={Number(it.price)}
                onBlur={(e) => { const v = Number(e.target.value); if (v !== Number(it.price)) updatePrice.mutate({ id: it.id, price: v }); }}
                className="w-24 px-2 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-right"
              />
            )}
            <button onClick={() => { if (confirm("¿Eliminar?")) remove.mutate(it.id); }} className="p-1.5 text-zinc-500 hover:text-red-400">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 pt-4 border-t border-zinc-800">
        <input value={adding} onChange={(e) => setAdding(e.target.value)} placeholder="Nuevo nombre" className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm" />
        {hasPrice && <input type="number" value={addPrice} onChange={(e) => setAddPrice(Number(e.target.value))} placeholder="Precio" className="w-24 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm" />}
        <button onClick={() => adding && add.mutate()} className="px-3 py-2 bg-white text-zinc-900 text-sm font-medium rounded hover:bg-zinc-200 flex items-center gap-1"><Plus className="size-4" /></button>
      </div>
    </div>
  );
}
