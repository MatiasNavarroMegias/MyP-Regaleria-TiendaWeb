import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import workshop from "@/assets/workshop.jpg";
import ig1 from "@/assets/ig-1.jpg";
import ig2 from "@/assets/ig-2.jpg";
import ig3 from "@/assets/ig-3.jpg";
import ig4 from "@/assets/ig-4.jpg";
import ig5 from "@/assets/ig-5.jpg";
import ig6 from "@/assets/ig-6.jpg";

export const Route = createFileRoute("/esencia")({
  head: () => ({
    meta: [
      { title: "Nuestra Esencia — Natalia Santos" },
      { name: "description", content: "Destilado en Buenos Aires: filosofía, taller y comunidad detrás de cada fragancia." },
      { property: "og:title", content: "Nuestra Esencia — Natalia Santos" },
      { property: "og:description", content: "El taller y la historia detrás de cada fragancia." },
      { property: "og:image", content: workshop },
    ],
  }),
  component: Esencia,
});

const igGrid = [ig1, ig2, ig3, ig4, ig5, ig6];

function Esencia() {
  return (
    <SiteChrome>
      <section className="py-24 md:py-32 px-6 md:px-24">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          <img src={workshop} alt="Taller de perfumería artesanal" width={1024} height={1280} loading="lazy" className="aspect-[4/5] w-full object-cover ring-1 ring-black/5 rounded-sm" />
          <div className="space-y-6">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">El Origen</span>
            <h1 className="font-[var(--font-display)] text-4xl md:text-5xl">Destilado en Buenos Aires</h1>
            <p className="text-foreground/70 leading-relaxed text-pretty max-w-[45ch]">
              Nuestra filosofía se basa en el respeto por la materia prima. En nuestro taller, cada fragancia es una composición artesanal que busca capturar la melancolía del campo y la sofisticación de la ciudad.
            </p>
            <p className="text-foreground/70 leading-relaxed text-pretty max-w-[45ch]">
              Utilizamos métodos de extracción lentos para preservar la integridad de cada nota olfativa, creando perfumes que evolucionan en la piel durante horas.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-24 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Reseñas</span>
            <h2 className="font-[var(--font-display)] text-4xl mt-3">Lo que dicen nuestras clientas</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { t: "Bruma pampeana se convirtió en mi firma. Estela duradera, elegante, no empalaga. Mil gracias Nati.", a: "@martinaperez" },
              { t: "Compré Jardín secreto para mi mamá y lloró. Cada detalle del packaging cuidado al máximo.", a: "@sofiagarcia" },
              { t: "Atención impecable. Me asesoraron por WhatsApp y acerté con el aroma a la primera. Recomendadísimo.", a: "@lucia.rmz" },
            ].map((r) => (
              <figure key={r.a} className="bg-background p-8 ring-1 ring-border rounded-sm">
                <blockquote className="font-[var(--font-display)] italic text-lg leading-relaxed mb-6 text-balance">“{r.t}”</blockquote>
                <figcaption className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/50">{r.a}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="px-6 text-center mb-16">
          <h2 className="font-[var(--font-display)] text-3xl mb-2 italic">@nataliasantos.1701</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">Nuestra comunidad en Instagram</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {igGrid.map((src, i) => (
            <a key={i} href="https://www.instagram.com/nataliasantos.1701" target="_blank" rel="noreferrer noopener" className="group relative aspect-square overflow-hidden bg-stone-100 ring-1 ring-black/5">
              <img src={src} alt={`Publicación ${i + 1}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300" />
            </a>
          ))}
        </div>
      </section>
    </SiteChrome>
  );
}
