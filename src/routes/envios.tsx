import { createFileRoute } from "@tanstack/react-router";
import { SiteChrome } from "@/components/SiteChrome";
import { useSiteContent, pickString } from "@/lib/site-content";

export const Route = createFileRoute("/envios")({
  head: () => ({
    meta: [
      { title: "Envíos y Devoluciones — Natalia Santos" },
      { name: "description", content: "Información sobre envíos a todo el país, tiempos de entrega, cambios y devoluciones." },
      { property: "og:title", content: "Envíos y Devoluciones — Natalia Santos" },
    ],
  }),
  component: EnviosPage,
});

type Section = { title?: string; body?: string };

function EnviosPage() {
  const { data } = useSiteContent();
  const c = (data?.shipping_returns ?? {}) as { title?: string; intro?: string; sections?: Section[] };
  const sections = Array.isArray(c.sections) ? c.sections : [];
  return (
    <SiteChrome>
      <section className="py-24 md:py-32">
        <div className="px-6 md:px-24 max-w-3xl mx-auto">
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Información</span>
          <h1 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3 mb-6">
            {pickString(c.title, "Envíos y Devoluciones")}
          </h1>
          {c.intro && <p className="text-foreground/80 leading-relaxed mb-12">{c.intro}</p>}
          <div className="space-y-10">
            {sections.map((s, i) => (
              <div key={i} className="border-t border-border pt-8">
                <h2 className="font-[var(--font-display)] text-2xl mb-3">{s.title}</h2>
                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteChrome>
  );
}
