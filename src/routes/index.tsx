import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { products, families, type Family } from "@/lib/products";
import hero from "@/assets/hero.jpg";
import perfume1 from "@/assets/perfume-1.jpg";
import perfume2 from "@/assets/perfume-2.jpg";
import perfume3 from "@/assets/perfume-3.jpg";
import featured from "@/assets/featured.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Natalia Santos — Perfumería de Autor" },
      { name: "description", content: "Fragancias de autor maceradas artesanalmente en Buenos Aires. Perfumes que cuentan tu historia." },
      { property: "og:title", content: "Natalia Santos — Perfumería de Autor" },
      { property: "og:description", content: "Fragancias de autor maceradas artesanalmente en Buenos Aires." },
      { property: "og:image", content: hero },
    ],
  }),
  component: Index,
});

const categoryCovers: Array<{ family: Family; img: string; tagline: string }> = [
  { family: "Amaderados", img: perfume1, tagline: "Profundos y telúricos" },
  { family: "Florales", img: perfume2, tagline: "Delicados y luminosos" },
  { family: "Orientales", img: perfume3, tagline: "Cálidos y envolventes" },
  { family: "Cítricos", img: featured, tagline: "Frescos y vibrantes" },
];

function Index() {
  const destacados = products.slice(0, 4);

  return (
    <SiteChrome>
      {/* Hero banner */}
      <section className="relative h-[90vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 animate-scale-in">
          <img src={hero} alt="Frasco ámbar de perfume sobre lino crema" width={1920} height={1280} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-up [animation-delay:300ms]">
          <h1 className="font-[var(--font-display)] text-5xl md:text-7xl text-balance mb-8 text-white drop-shadow-sm">
            Fragancias que cuentan tu historia
          </h1>
          <Link
            to="/catalogo"
            className="inline-block px-10 py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-all duration-300"
          >
            Comprar ahora
          </Link>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Selección</span>
              <h2 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3">Productos destacados</h2>
            </div>
            <Link to="/catalogo" className="text-[11px] uppercase tracking-[0.2em] underline-offset-4 hover:underline">
              Ver catálogo completo →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
            {destacados.map((p) => <ProductCard key={p.name} p={p} />)}
          </div>
        </div>
      </section>

      {/* Portadas de categorías */}
      <section className="py-24 md:py-32 px-6 md:px-24 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Familias olfativas</span>
            <h2 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3">Explorá por categoría</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryCovers.map((c) => (
              <Link
                key={c.family}
                to="/catalogo"
                search={{ familia: c.family }}
                className="group relative aspect-[3/4] overflow-hidden ring-1 ring-black/5 bg-stone-100"
              >
                <img src={c.img} alt={c.family} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                  <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest opacity-80 mb-1">{c.tagline}</p>
                  <h3 className="font-[var(--font-display)] text-2xl">{c.family}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="contacto" className="py-24 md:py-32 px-6 md:px-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Contacto</span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3 mb-8">Conversemos sobre tu aroma</h2>
          <p className="text-foreground/70 leading-relaxed mb-10 max-w-xl mx-auto">
            Asesoría personalizada para encontrar la fragancia que te represente. Escribinos por WhatsApp o por correo y te respondemos a la brevedad.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/5491100000000?text=Hola%20Natalia%2C%20me%20gustar%C3%ADa%20una%20asesor%C3%ADa%20de%20aromas"
              target="_blank"
              rel="noreferrer noopener"
              className="px-8 py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:hola@nataliasantos.com.ar"
              className="px-8 py-4 border border-foreground text-foreground text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              hola@nataliasantos.com.ar
            </a>
          </div>
          <div className="mt-12 font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/60">
            Buenos Aires, Argentina • <a href="https://www.instagram.com/nataliasantos.1701" target="_blank" rel="noreferrer noopener" className="underline-offset-4 hover:underline">@nataliasantos.1701</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
