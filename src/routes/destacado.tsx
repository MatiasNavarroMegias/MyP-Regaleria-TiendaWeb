import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import featured from "@/assets/featured.jpg";

export const Route = createFileRoute("/destacado")({
  head: () => ({
    meta: [
      { title: "Amanecer Cítrico — Edición destacada" },
      { name: "description", content: "Edición de temporada: una fragancia luminosa con pomelo, neroli y ámbar gris." },
      { property: "og:title", content: "Amanecer Cítrico — Edición destacada" },
      { property: "og:description", content: "Edición de temporada de Natalia Santos." },
      { property: "og:image", content: featured },
    ],
  }),
  component: Destacado,
});

function Destacado() {
  return (
    <SiteChrome>
      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center max-w-7xl mx-auto">
          <div className="order-2 md:order-1">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Edición de temporada</span>
            <h1 className="font-[var(--font-display)] text-5xl mt-3 mb-8">Amanecer Cítrico</h1>

            <div className="flex gap-4 mb-12">
              <button className="w-14 h-14 border border-foreground flex items-center justify-center text-[10px] font-[var(--font-mono)]">30ml</button>
              <button className="w-14 h-14 border border-border flex items-center justify-center text-[10px] font-[var(--font-mono)] text-foreground/40 hover:border-foreground hover:text-foreground transition-colors">50ml</button>
              <button className="w-14 h-14 border border-border flex items-center justify-center text-[10px] font-[var(--font-mono)] text-foreground/40 hover:border-foreground hover:text-foreground transition-colors">100ml</button>
            </div>

            <div className="space-y-10">
              {[
                { k: "Salida", v: "Pomelo rosado, Mandarina y Neroli" },
                { k: "Corazón", v: "Flor de azahar y Pimienta blanca" },
                { k: "Fondo", v: "Vetiver de Haití y Ámbar gris" },
              ].map((n) => (
                <div key={n.k} className="relative pl-8 border-l border-primary/30">
                  <span className="block font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary mb-2">{n.k}</span>
                  <p className="text-lg">{n.v}</p>
                </div>
              ))}
            </div>

            <button className="mt-12 w-full py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-colors">
              Agregar al carrito — $78.000 ARS
            </button>
          </div>
          <div className="order-1 md:order-2">
            <img src={featured} alt="Amanecer Cítrico, fragancia destacada" loading="lazy" className="aspect-[4/5] w-full object-cover ring-1 ring-black/5 rounded-sm" />
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
