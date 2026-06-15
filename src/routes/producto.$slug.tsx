import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Star, MessageCircle, ChevronLeft, ChevronRight, ShoppingBag, Minus, Plus } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice, type Review } from "@/lib/products";
import { useProduct } from "@/lib/useProducts";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/producto/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Natalia Santos` },
      { property: "og:title", content: `${params.slug} — Natalia Santos` },
    ],
  }),
  notFoundComponent: () => (
    <SiteChrome>
      <section className="py-32 text-center px-6">
        <p className="font-[var(--font-display)] text-3xl italic mb-4">Fragancia no encontrada</p>
        <Link to="/catalogo" className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest underline">Volver al catálogo</Link>
      </section>
    </SiteChrome>
  ),
  errorComponent: () => (
    <SiteChrome>
      <section className="py-32 text-center px-6">
        <p className="font-[var(--font-display)] text-3xl italic">Algo salió mal</p>
      </section>
    </SiteChrome>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { product: p, products, isLoading } = useProduct(slug);
  const { add, setOpen: setCartOpen } = useCart();
  const [qty, setQty] = useState(1);

  if (isLoading && !p) {
    return (
      <SiteChrome>
        <section className="py-32 text-center px-6">
          <p className="font-[var(--font-display)] text-2xl italic text-foreground/60">Cargando…</p>
        </section>
      </SiteChrome>
    );
  }

  if (!p) {
    return (
      <SiteChrome>
        <section className="py-32 text-center px-6">
          <p className="font-[var(--font-display)] text-3xl italic mb-4">Fragancia no encontrada</p>
          <Link to="/catalogo" className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest underline">Volver al catálogo</Link>
        </section>
      </SiteChrome>
    );
  }

  const related = products.filter((x) => x.family === p.family && x.slug !== p.slug).slice(0, 3);

  const reviews = p.reviews as Review[];
  const avg = reviews.length
    ? reviews.reduce((s: number, r: Review) => s + r.rating, 0) / reviews.length
    : 0;

  const waLink = `https://wa.me/5491100000000?text=${encodeURIComponent(`Hola Natalia, me interesa "${p.name}".`)}`;

  return (
    <SiteChrome>
      <section className="pt-28 pb-24 md:pt-36 md:pb-32">
        <div className="px-6 md:px-24 max-w-7xl mx-auto">
          <Link to="/catalogo" className="inline-flex items-center gap-2 text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-foreground/60 hover:text-foreground mb-12">
            <ArrowLeft className="size-3" strokeWidth={1.5} /> Volver al catálogo
          </Link>

          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
            <ProductGallery images={p.images && p.images.length ? p.images : [p.img]} name={p.name} />

            <div>
              <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">
                {p.family} • {p.gender}
              </span>
              <h1 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3 mb-6">{p.name}</h1>

              {p.reviews.length > 0 && (
                <div className="flex items-center gap-3 mb-8">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3.5 ${i < Math.round(avg) ? "fill-primary text-primary" : "text-foreground/20"}`} strokeWidth={1.5} />
                    ))}
                  </div>
                  <span className="text-[11px] text-foreground/60 font-[var(--font-mono)] uppercase tracking-widest">
                    {avg.toFixed(1)} · {p.reviews.length} {p.reviews.length === 1 ? "opinión" : "opiniones"}
                  </span>
                </div>
              )}

              <p className="text-foreground/80 leading-relaxed mb-10">{p.description}</p>

              <div className="border-t border-b border-border py-6 mb-8 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/60">Precio</span>
                  <span className="text-2xl font-[var(--font-display)]">{formatPrice(p.price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/60">Disponibilidad</span>
                  {p.stock > 0 ? (
                    <span className="inline-flex items-center gap-2 text-xs">
                      <span className="size-1.5 rounded-full bg-emerald-600" />
                      {p.stock} en stock
                    </span>
                  ) : (
                    <span className="text-xs text-foreground/60">Agotado</span>
                  )}
                </div>
                <div className="flex justify-between items-start gap-6">
                  <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/60 shrink-0">Notas</span>
                  <span className="text-xs text-right italic font-[var(--font-display)]">{p.notes}</span>
                </div>
              </div>

              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full bg-foreground text-background py-4 text-[10px] uppercase tracking-widest font-[var(--font-mono)] hover:bg-foreground/90 transition-colors"
              >
                <MessageCircle className="size-4" strokeWidth={1.5} />
                Consultar por WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-24 md:mt-32">
            <h2 className="font-[var(--font-display)] text-3xl mb-10">Opiniones</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-foreground/60 italic">Todavía no hay opiniones para esta fragancia.</p>
            ) : (
              <ul className="grid md:grid-cols-2 gap-8">
                {reviews.map((rv: Review, i: number) => (
                  <li key={i} className="border-t border-border pt-6">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`size-3 ${j < rv.rating ? "fill-primary text-primary" : "text-foreground/20"}`} strokeWidth={1.5} />
                      ))}
                    </div>
                    <p className="text-foreground/80 italic font-[var(--font-display)] text-lg mb-3">"{rv.text}"</p>
                    <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/50">
                      {rv.author} · {rv.date}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {related.length > 0 && (
            <div className="mt-24 md:mt-32">
              <h2 className="font-[var(--font-display)] text-3xl mb-10">También te puede gustar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {related.map((x) => <ProductCard key={x.slug} p={x} />)}
              </div>
            </div>
          )}
        </div>
      </section>
    </SiteChrome>
  );
}

function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const safe = images.length ? images : [""];
  const current = safe[Math.min(idx, safe.length - 1)];
  const prev = () => setIdx((i) => (i - 1 + safe.length) % safe.length);
  const next = () => setIdx((i) => (i + 1) % safe.length);
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 ring-1 ring-black/5 group">
        <img src={current} alt={name} className="w-full h-full object-cover" />
        {safe.length > 1 && (
          <>
            <button onClick={prev} aria-label="Anterior" className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background size-10 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition">
              <ChevronLeft className="size-5" strokeWidth={1.5} />
            </button>
            <button onClick={next} aria-label="Siguiente" className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background size-10 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition">
              <ChevronRight className="size-5" strokeWidth={1.5} />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {safe.map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} aria-label={`Foto ${i + 1}`} className={`size-1.5 rounded-full transition ${i === idx ? "bg-foreground w-6" : "bg-foreground/30"}`} />
              ))}
            </div>
          </>
        )}
      </div>
      {safe.length > 1 && (
        <div className="grid grid-cols-5 gap-2 mt-3">
          {safe.map((url, i) => (
            <button key={url + i} onClick={() => setIdx(i)} className={`aspect-square overflow-hidden ring-1 transition ${i === idx ? "ring-foreground" : "ring-black/10 opacity-60 hover:opacity-100"}`}>
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
