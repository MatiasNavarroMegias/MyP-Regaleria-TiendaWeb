import { useState } from "react";
import { X, Plus, Minus, Trash2, MessageCircle, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";

type Props = {
  whatsappNumber: string;
  brandName: string;
};

export function CartDrawer({ whatsappNumber, brandName }: Props) {
  const { items, count, total, open, setOpen, setQty, remove, clear } = useCart();
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [sending, setSending] = useState(false);

  async function checkout() {
    if (!form.name.trim()) { toast.error("Ingresá tu nombre"); return; }
    if (items.length === 0) { toast.error("Tu carrito está vacío"); return; }
    setSending(true);
    try {
      // Create order in DB (Pendiente, stock NOT decremented yet)
      const { error } = await supabase.rpc("place_order", {
        p_customer_name: form.name,
        p_customer_phone: form.phone || "",
        p_customer_email: form.email || "",
        p_address: form.address || "",
        p_notes: form.notes || "",
        p_items: items.map((i) => ({ product_id: i.id, quantity: i.qty })),
      });
      if (error) throw error;

      // Build WhatsApp message
      const lines = [
        `Hola ${brandName}, quiero hacer un pedido:`,
        "",
        ...items.map((i) => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`),
        "",
        `Total: ${formatPrice(total)}`,
        "",
        `Nombre: ${form.name}`,
        form.phone ? `Tel: ${form.phone}` : "",
        form.email ? `Email: ${form.email}` : "",
        form.address ? `Dirección: ${form.address}` : "",
        form.notes ? `Notas: ${form.notes}` : "",
      ].filter(Boolean);
      const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(url, "_blank", "noopener");

      toast.success("Pedido enviado por WhatsApp");
      clear();
      setForm({ name: "", phone: "", email: "", address: "", notes: "" });
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar el pedido");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[55] flex">
      <div className="flex-1 bg-black/50" onClick={() => setOpen(false)} />
      <aside className="w-full max-w-md bg-background border-l border-border flex flex-col h-full">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-[var(--font-display)] text-xl flex items-center gap-2">
            <ShoppingBag className="size-4" strokeWidth={1.5} /> Tu carrito ({count})
          </h3>
          <button onClick={() => setOpen(false)} className="text-foreground/60 hover:text-foreground"><X className="size-5" /></button>
        </div>

        <div className="flex-1 overflow-auto p-5 space-y-4">
          {items.length === 0 ? (
            <p className="text-sm text-foreground/60 text-center py-12">Tu carrito está vacío.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex gap-3 pb-4 border-b border-border">
                {it.img && <img src={it.img} alt={it.name} className="size-16 object-cover rounded" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{it.name}</p>
                  <p className="text-xs text-foreground/60 mt-0.5">{formatPrice(it.price)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button onClick={() => setQty(it.id, it.qty - 1)} className="size-7 border border-border flex items-center justify-center hover:bg-accent"><Minus className="size-3" /></button>
                    <span className="w-8 text-center text-sm">{it.qty}</span>
                    <button
                      onClick={() => setQty(it.id, it.qty + 1)}
                      disabled={typeof it.maxStock === "number" && it.qty >= it.maxStock}
                      className="size-7 border border-border flex items-center justify-center hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus className="size-3" />
                    </button>
                    {typeof it.maxStock === "number" && (
                      <span className="text-[10px] text-foreground/50 ml-1">/ {it.maxStock}</span>
                    )}
                    <button onClick={() => remove(it.id)} className="ml-auto text-foreground/60 hover:text-destructive"><Trash2 className="size-4" /></button>
                  </div>
                </div>
                <p className="text-sm font-medium whitespace-nowrap">{formatPrice(it.price * it.qty)}</p>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-5 space-y-3 bg-background">
            <div className="flex justify-between text-sm">
              <span className="text-foreground/60">Total</span>
              <span className="font-[var(--font-display)] text-xl">{formatPrice(total)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Nombre*" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
              <input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={`${inp} col-span-2`} />
              <input placeholder="Dirección" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={`${inp} col-span-2`} />
              <textarea placeholder="Notas (opcional)" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={`${inp} col-span-2 resize-none`} />
            </div>
            <button onClick={checkout} disabled={sending} className="w-full bg-emerald-600 text-white py-3 text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-emerald-500 disabled:opacity-50">
              <MessageCircle className="size-4" /> {sending ? "Enviando…" : "Finalizar por WhatsApp"}
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

const inp = "px-3 py-2 bg-background border border-border text-sm focus:outline-none focus:border-foreground";
