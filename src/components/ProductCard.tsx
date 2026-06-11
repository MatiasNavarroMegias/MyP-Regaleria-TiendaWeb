import { Link } from "@tanstack/react-router";
import { formatPrice, type Product } from "@/lib/products";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link to="/producto/$slug" params={{ slug: p.slug }} className="group block">
      <article className="cursor-pointer">
        <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-stone-100 ring-1 ring-black/5">
          <img
            src={p.img}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-8 text-center">
            <p className="font-[var(--font-mono)] text-[9px] uppercase tracking-widest mb-4">
              Notas principales
            </p>
            <p className="text-sm italic font-[var(--font-display)]">{p.notes}</p>
          </div>
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
