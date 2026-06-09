import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["Pendiente", "Enviado", "Entregado", "Cancelado"] as const;

function OrdersAdmin() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: typeof STATUSES[number] }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl">Pedidos</h1>
          <p className="text-zinc-400 text-sm mt-1">Cargá manualmente los pedidos que recibís por WhatsApp.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200">
          <Plus className="size-4" /> Nuevo pedido
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-zinc-500 text-[10px] uppercase tracking-widest">
            <tr>
              <th className="text-left px-5 py-3">Cliente</th>
              <th className="text-left px-5 py-3">Contacto</th>
              <th className="text-right px-5 py-3">Total</th>
              <th className="text-left px-5 py-3">Fecha</th>
              <th className="text-left px-5 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading && <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500">Cargando…</td></tr>}
            {!isLoading && orders.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-zinc-500">Sin pedidos todavía.</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-zinc-900/60">
                <td className="px-5 py-3">
                  <p className="font-medium">{o.customer_name}</p>
                  {o.notes && <p className="text-xs text-zinc-500 line-clamp-1">{o.notes}</p>}
                </td>
                <td className="px-5 py-3 text-zinc-400 text-xs">
                  {o.customer_phone && <div>{o.customer_phone}</div>}
                  {o.customer_email && <div>{o.customer_email}</div>}
                </td>
                <td className="px-5 py-3 text-right">${Number(o.total).toLocaleString("es-AR")}</td>
                <td className="px-5 py-3 text-zinc-400 text-xs">{new Date(o.created_at).toLocaleDateString("es-AR")}</td>
                <td className="px-5 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value as typeof STATUSES[number] })}
                    className={`bg-zinc-950 border rounded px-2 py-1 text-xs ${statusColor(o.status)}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating && <NewOrderModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); qc.invalidateQueries({ queryKey: ["admin-orders"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); }} />}
    </div>
  );
}

function statusColor(s: string) {
  if (s === "Pendiente") return "border-amber-700 text-amber-400";
  if (s === "Enviado") return "border-sky-700 text-sky-400";
  if (s === "Entregado") return "border-emerald-700 text-emerald-400";
  return "border-zinc-700 text-zinc-400";
}

function NewOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", address: "", total: 0, notes: "", payment_method: "", shipping_option: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.from("orders").insert({ ...form, status: "Pendiente" });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Pedido cargado");
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-md w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-[var(--font-display)] text-xl">Nuevo pedido</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="size-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Cliente"><input required value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={inp} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp"><input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={inp} /></Field>
            <Field label="Email"><input type="email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={inp} /></Field>
          </div>
          <Field label="Dirección"><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inp} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pago"><input value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className={inp} /></Field>
            <Field label="Envío"><input value={form.shipping_option} onChange={(e) => setForm({ ...form, shipping_option: e.target.value })} className={inp} /></Field>
          </div>
          <Field label="Total ARS"><input type="number" min={0} required value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} className={inp} /></Field>
          <Field label="Notas / productos"><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inp} /></Field>
          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancelar</button>
            <button type="submit" disabled={busy} className="px-5 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50">{busy ? "Guardando…" : "Crear pedido"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp = "w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm focus:outline-none focus:border-zinc-600";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span><div className="mt-1.5">{children}</div></label>;
}
