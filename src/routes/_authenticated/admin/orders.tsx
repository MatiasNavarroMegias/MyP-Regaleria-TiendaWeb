import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, X, Trash2, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: OrdersAdmin,
});

const STATUSES = ["Pendiente", "Enviado", "Entregado", "Cancelado"] as const;

type OrderItem = { id: string; product_id: string | null; product_name: string; quantity: number; unit_price: number };
type Order = {
  id: string; customer_name: string; customer_phone: string | null; customer_email: string | null;
  address: string | null; total: number; status: typeof STATUSES[number]; notes: string | null;
  created_at: string; stock_applied: boolean;
};

function OrdersAdmin() {
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: typeof STATUSES[number] }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-orders"] }); qc.invalidateQueries({ queryKey: ["admin-stats"] }); },
  });

  const confirmOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("confirm_order", { p_order_id: id });
      if (error) throw error;
      const { error: e2 } = await supabase.from("orders").update({ status: "Enviado" }).eq("id", id);
      if (e2) throw e2;
    },
    onSuccess: () => {
      toast.success("Pedido confirmado · stock descontado");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const removeOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Pedido eliminado"); qc.invalidateQueries({ queryKey: ["admin-orders"] }); },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl">Pedidos</h1>
          <p className="text-zinc-400 text-sm mt-1">Pedidos del carrito web y cargados manualmente. Al confirmar se descuenta el stock.</p>
        </div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200">
          <Plus className="size-4" /> Nuevo pedido
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
        {isLoading && <p className="px-5 py-10 text-center text-zinc-500 text-sm">Cargando…</p>}
        {!isLoading && orders.length === 0 && <p className="px-5 py-10 text-center text-zinc-500 text-sm">Sin pedidos todavía.</p>}
        <ul className="divide-y divide-zinc-800">
          {orders.map((o) => {
            const isOpen = expanded === o.id;
            return (
              <li key={o.id}>
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-900/60">
                  <button onClick={() => setExpanded(isOpen ? null : o.id)} className="text-zinc-400 hover:text-white">
                    {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{o.customer_name}</p>
                    <p className="text-xs text-zinc-500">{o.customer_phone ?? ""}{o.customer_email ? ` · ${o.customer_email}` : ""}</p>
                  </div>
                  <p className="text-sm">${Number(o.total).toLocaleString("es-AR")}</p>
                  <p className="text-xs text-zinc-500 w-24 text-right">{new Date(o.created_at).toLocaleDateString("es-AR")}</p>
                  <select
                    value={o.status}
                    onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value as typeof STATUSES[number] })}
                    className={`bg-zinc-950 border rounded px-2 py-1 text-xs ${statusColor(o.status)}`}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {!o.stock_applied && o.status !== "Cancelado" ? (
                    <button onClick={() => { if (confirm("¿Confirmar pedido y descontar stock?")) confirmOrder.mutate(o.id); }} className="flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1.5 rounded text-xs hover:bg-emerald-500" title="Confirmar y descontar stock">
                      <CheckCircle2 className="size-3.5" /> Confirmar
                    </button>
                  ) : o.stock_applied ? (
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest">Stock OK</span>
                  ) : <span className="w-20" />}
                  <button onClick={() => { if (confirm("¿Eliminar pedido? (no devuelve stock)")) removeOrder.mutate(o.id); }} className="p-1.5 text-zinc-500 hover:text-red-400"><Trash2 className="size-4" /></button>
                </div>
                {isOpen && <OrderDetail orderId={o.id} address={o.address} notes={o.notes} />}
              </li>
            );
          })}
        </ul>
      </div>

      {creating && <NewOrderModal onClose={() => setCreating(false)} onCreated={() => { setCreating(false); qc.invalidateQueries({ queryKey: ["admin-orders"] }); }} />}
    </div>
  );
}

function statusColor(s: string) {
  if (s === "Pendiente") return "border-amber-700 text-amber-400";
  if (s === "Enviado") return "border-sky-700 text-sky-400";
  if (s === "Entregado") return "border-emerald-700 text-emerald-400";
  return "border-zinc-700 text-zinc-400";
}

function OrderDetail({ orderId, address, notes }: { orderId: string; address: string | null; notes: string | null }) {
  const { data: items = [] } = useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId);
      if (error) throw error;
      return (data ?? []) as OrderItem[];
    },
  });
  return (
    <div className="bg-zinc-950/60 px-12 py-4 text-xs text-zinc-400 space-y-3">
      {address && <p><span className="uppercase tracking-widest text-[10px] text-zinc-500">Dirección:</span> {address}</p>}
      {notes && <p><span className="uppercase tracking-widest text-[10px] text-zinc-500">Notas:</span> {notes}</p>}
      <table className="w-full">
        <thead className="text-[10px] uppercase tracking-widest text-zinc-500">
          <tr><th className="text-left py-1">Producto</th><th className="text-right">Cantidad</th><th className="text-right">P. unit</th><th className="text-right">Subtotal</th></tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t border-zinc-800/60">
              <td className="py-1.5">{it.product_name}</td>
              <td className="text-right">{it.quantity}</td>
              <td className="text-right">${Number(it.unit_price).toLocaleString("es-AR")}</td>
              <td className="text-right">${(it.quantity * Number(it.unit_price)).toLocaleString("es-AR")}</td>
            </tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="text-center py-2 text-zinc-600">Sin ítems.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

type DraftItem = { product_id: string; product_name: string; quantity: number; unit_price: number };

function NewOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ customer_name: "", customer_phone: "", customer_email: "", address: "", notes: "" });
  const [lines, setLines] = useState<DraftItem[]>([]);
  const [busy, setBusy] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products-min"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id,name,price,stock").order("name");
      if (error) throw error;
      return data ?? [];
    },
  });

  function addLine() {
    const p = products[0];
    if (!p) return;
    setLines([...lines, { product_id: p.id, product_name: p.name, quantity: 1, unit_price: Number(p.price) }]);
  }

  function updateLine(i: number, patch: Partial<DraftItem>) {
    const copy = [...lines];
    copy[i] = { ...copy[i], ...patch };
    setLines(copy);
  }

  function pickProduct(i: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    updateLine(i, { product_id: p.id, product_name: p.name, unit_price: Number(p.price) });
  }

  const total = lines.reduce((s, l) => s + l.quantity * l.unit_price, 0);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) { toast.error("Agregá al menos un producto"); return; }
    setBusy(true);
    const { data: orderId, error } = await supabase.rpc("place_order", {
      p_customer_name: form.customer_name,
      p_customer_phone: form.customer_phone,
      p_customer_email: form.customer_email,
      p_address: form.address,
      p_notes: form.notes,
      p_items: lines.map((l) => ({ product_id: l.product_id, quantity: l.quantity })),
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Pedido cargado. Confirmalo para descontar stock.");
    void orderId;
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-800 rounded-md w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="font-[var(--font-display)] text-xl">Nuevo pedido</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white"><X className="size-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Nombre del cliente*" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className={inp} />
            <input placeholder="Teléfono" value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className={inp} />
            <input placeholder="Email" value={form.customer_email} onChange={(e) => setForm({ ...form, customer_email: e.target.value })} className={`${inp} col-span-2`} />
            <input placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${inp} col-span-2`} />
            <textarea rows={2} placeholder="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inp} col-span-2`} />
          </div>

          <div className="border-t border-zinc-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Productos del pedido</h3>
              <button type="button" onClick={addLine} className="text-xs flex items-center gap-1 bg-zinc-800 text-white px-3 py-1.5 rounded hover:bg-zinc-700">
                <Plus className="size-3" /> Agregar producto
              </button>
            </div>
            {lines.length === 0 && <p className="text-xs text-zinc-500 text-center py-4">Sin productos cargados.</p>}
            <ul className="space-y-2">
              {lines.map((l, i) => (
                <li key={i} className="grid grid-cols-12 gap-2 items-center">
                  <select value={l.product_id} onChange={(e) => pickProduct(i, e.target.value)} className={`${inp} col-span-6`}>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name} (stock {p.stock})</option>)}
                  </select>
                  <input type="number" min={1} value={l.quantity} onChange={(e) => updateLine(i, { quantity: Math.max(1, Number(e.target.value)) })} className={`${inp} col-span-2`} />
                  <input type="number" min={0} value={l.unit_price} onChange={(e) => updateLine(i, { unit_price: Number(e.target.value) })} className={`${inp} col-span-3`} />
                  <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))} className="text-zinc-500 hover:text-red-400 col-span-1"><Trash2 className="size-4" /></button>
                </li>
              ))}
            </ul>
            <p className="text-right text-sm mt-3">Total: <span className="font-medium">${total.toLocaleString("es-AR")}</span></p>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancelar</button>
            <button type="submit" disabled={busy} className="px-5 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50">{busy ? "Guardando…" : "Guardar pedido"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inp = "px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm focus:outline-none focus:border-zinc-600";
