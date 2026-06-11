import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, MessageCircle } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { findProduct, formatPrice, products, type Review } from "@/lib/products";

export const Route = createFileRoute("/producto/$slug")({
  loader: ({ params }) => {
    const product = findProduct(params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Producto — Natalia Santos" }] };
    return {
      meta: [
        { title: `${p.name} — Natalia Santos` },
        { name: "description", content: p.description.slice(0, 160) },
        { property: "og:title", content: `${p.name} — Natalia Santos` },
        { property: "og:description", content: p.description.slice(0, 160) },
        { property: "og:image", content: p.img },
      ],
    };
  },
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
  const { product: p } = Route.useLoaderData();
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
            <div className="aspect-[3/4] overflow-hidden bg-stone-100 ring-1 ring-black/5">
              <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
            </div>

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
