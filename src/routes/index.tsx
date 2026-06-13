import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { type Family } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";
import { useSiteContent, pickString, resolveImage } from "@/lib/site-content";
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

const categoryDefaults: Record<Family, { img: string; tagline: string; key: string }> = {
  Amaderados: { img: perfume1, tagline: "Profundos y telúricos", key: "category_amaderados" },
  Florales: { img: perfume2, tagline: "Delicados y luminosos", key: "category_florales" },
  Orientales: { img: perfume3, tagline: "Cálidos y envolventes", key: "category_orientales" },
  Cítricos: { img: featured, tagline: "Frescos y vibrantes", key: "category_citricos" },
};

function Index() {
  const { data: content } = useSiteContent();
  const c = content ?? {};
  const heroC = (c.hero ?? {}) as Record<string, string>;
  const featuredC = (c.featured_section ?? {}) as Record<string, string>;
  const catSection = (c.categories_section ?? {}) as Record<string, string>;
  const contactC = (c.contact ?? {}) as Record<string, string>;

  const { products } = useProducts();
  const destacados = products.slice(0, 4);
  const heroImg = resolveImage(heroC.image_url, hero);
  const heroTitle = pickString(heroC.title, "Fragancias que cuentan tu historia");
  const ctaLabel = pickString(heroC.cta_label, "Comprar ahora");
  const ctaLink = pickString(heroC.cta_link, "/catalogo");

  const whatsappNum = pickString(contactC.whatsapp, "5491100000000");
  const whatsappMsg = encodeURIComponent(pickString(contactC.whatsapp_message, "Hola, me gustaría una asesoría de aromas"));
  const email = pickString(contactC.email, "hola@nataliasantos.com.ar");
  const igUrl = pickString(contactC.instagram, "https://www.instagram.com/nataliasantos.1701");
  const igHandle = pickString(contactC.instagram_handle, "@nataliasantos.1701");
  const city = pickString(contactC.city, "Buenos Aires, Argentina");

  return (
    <SiteChrome>
      <section className="relative h-[90vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 animate-scale-in">
          <img src={heroImg} alt="Banner" width={1920} height={1280} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-up [animation-delay:300ms]">
          <h1 className="font-[var(--font-display)] text-5xl md:text-7xl text-balance mb-8 text-white drop-shadow-sm">
            {heroTitle}
          </h1>
          {heroC.subtitle && <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">{heroC.subtitle}</p>}
          <Link
            to={ctaLink.startsWith("/") ? ctaLink : "/catalogo"}
            className="inline-block px-10 py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-all duration-300"
          >
            {ctaLabel}
          </Link>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">
                {pickString(featuredC.eyebrow, "Selección")}
              </span>
              <h2 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3">
                {pickString(featuredC.title, "Productos destacados")}
              </h2>
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

      <section className="py-24 md:py-32 px-6 md:px-24 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">
              {pickString(catSection.eyebrow, "Familias olfativas")}
            </span>
            <h2 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3">
              {pickString(catSection.title, "Explorá por categoría")}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(Object.keys(categoryDefaults) as Family[]).map((family) => {
              const def = categoryDefaults[family];
              const catC = (c[def.key] ?? {}) as Record<string, string>;
              const img = resolveImage(catC.image_url, def.img);
              const tagline = pickString(catC.tagline, def.tagline);
              return (
                <Link
                  key={family}
                  to="/catalogo"
                  search={{ familia: family }}
                  className="group relative aspect-[3/4] overflow-hidden ring-1 ring-black/5 bg-stone-100"
                >
                  <img src={img} alt={family} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                    <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest opacity-80 mb-1">{tagline}</p>
                    <h3 className="font-[var(--font-display)] text-2xl">{family}</h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contacto" className="py-24 md:py-32 px-6 md:px-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">
            {pickString(contactC.eyebrow, "Contacto")}
          </span>
          <h2 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3 mb-8">
            {pickString(contactC.title, "Conversemos sobre tu aroma")}
          </h2>
          <p className="text-foreground/70 leading-relaxed mb-10 max-w-xl mx-auto">
            {pickString(contactC.description, "Asesoría personalizada para encontrar la fragancia que te represente. Escribinos por WhatsApp o por correo y te respondemos a la brevedad.")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
              target="_blank"
              rel="noreferrer noopener"
              className="px-8 py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`mailto:${email}`}
              className="px-8 py-4 border border-foreground text-foreground text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              {email}
            </a>
          </div>
          <div className="mt-12 font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/60">
            {city} • <a href={igUrl} target="_blank" rel="noreferrer noopener" className="underline-offset-4 hover:underline">{igHandle}</a>
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
