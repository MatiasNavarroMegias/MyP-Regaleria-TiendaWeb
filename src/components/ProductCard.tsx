import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

type CardProduct = Product & { id?: string };

export function ProductCard({ p }: { p: CardProduct }) {
  const { add, setOpen } = useCart();
  const outOfStock = p.stock <= 0;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    add({ id: p.id ?? p.slug, slug: p.slug, name: p.name, price: p.price, img: p.img }, 1);
    toast.success(`${p.name} agregado al carrito`);
    setOpen(true);
  }

  return (
    <Link to="/producto/$slug" params={{ slug: p.slug }} className="group block">
      <article className={`cursor-pointer ${outOfStock ? "opacity-80" : ""}`}>
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-stone-100 ring-1 ring-black/5">
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${outOfStock ? "grayscale" : ""}`}
          />
          {outOfStock && (
            <span className="absolute top-3 left-3 bg-foreground/80 text-background text-[9px] uppercase tracking-[0.2em] px-2.5 py-1">
              Sin stock
            </span>
          )}
          {!outOfStock && (
            <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-8 text-center">
              <p className="font-[var(--font-mono)] text-[9px] uppercase tracking-widest mb-4">Notas principales</p>
              <p className="text-sm italic font-[var(--font-display)] mb-6">{p.notes}</p>
              <button
                onClick={handleAdd}
                className="mx-auto inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 text-[10px] uppercase tracking-[0.2em] hover:opacity-90"
              >
                <ShoppingBag className="size-3.5" /> Agregar al carrito
              </button>
            </div>
          )}
        </div>
        <h3 className="font-[var(--font-display)] text-2xl mb-1">{p.name}</h3>
        <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/50 mb-4">
          {p.family} • {p.gender}
        </p>
        <p className="text-sm font-medium">{formatPrice(p.price)}</p>
      </article>
    </Link>
  );
}
