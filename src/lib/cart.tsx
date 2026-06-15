import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type CartItem = {
  id: string; // product id (or slug fallback)
  slug: string;
  name: string;
  price: number;
  img?: string;
  qty: number;
  maxStock?: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => boolean;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const LS_KEY = "ns_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items, hydrated]);

  const add = useCallback((it: Omit<CartItem, "qty">, qty = 1) => {
    let added = true;
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === it.id);
      const max = typeof it.maxStock === "number" ? it.maxStock : Infinity;
      if (max <= 0) {
        toast.error("Sin stock disponible");
        added = false;
        return prev;
      }
      if (i >= 0) {
        const current = prev[i].qty;
        const next = Math.min(max, current + qty);
        if (next === current) {
          toast.error(`Sólo hay ${max} unidades disponibles`);
          added = false;
          return prev;
        }
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: next, maxStock: max };
        return copy;
      }
      const next = Math.min(max, qty);
      return [...prev, { ...it, qty: next, maxStock: max }];
    });
    return added;
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const max = typeof p.maxStock === "number" ? p.maxStock : Infinity;
      const clamped = Math.min(max, Math.max(1, qty));
      if (clamped < qty) toast.error(`Sólo hay ${max} unidades disponibles`);
      return { ...p, qty: clamped };
    }));
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => ({
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    total: items.reduce((s, i) => s + i.qty * i.price, 0),
    add, setQty, remove, clear, open, setOpen,
  }), [items, add, setQty, remove, clear, open]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}
