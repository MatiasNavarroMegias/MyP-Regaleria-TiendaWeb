import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SiteChrome } from "@/components/SiteChrome";
import { useSiteContent, pickString } from "@/lib/site-content";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Preguntas Frecuentes — Natalia Santos" },
      { name: "description", content: "Respuestas a las consultas más comunes sobre nuestras fragancias, envíos y compras." },
      { property: "og:title", content: "Preguntas Frecuentes — Natalia Santos" },
    ],
  }),
  component: FaqPage,
});

type Item = { q?: string; a?: string };

function FaqPage() {
  const { data } = useSiteContent();
  const c = (data?.faqs ?? {}) as { title?: string; items?: Item[] };
  const items = Array.isArray(c.items) ? c.items : [];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <SiteChrome>
      <section className="py-24 md:py-32">
        <div className="px-6 md:px-24 max-w-3xl mx-auto">
          <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Ayuda</span>
          <h1 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3 mb-10">
            {pickString(c.title, "Preguntas Frecuentes")}
          </h1>
          <ul className="divide-y divide-border border-t border-b border-border">
            {items.map((it, i) => {
              const isOpen = open === i;
              return (
                <li key={i}>
                  <button onClick={() => setOpen(isOpen ? null : i)} className="w-full flex items-center justify-between gap-4 py-5 text-left">
                    <span className="font-[var(--font-display)] text-lg">{it.q}</span>
                    <ChevronDown className={`size-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && <p className="pb-6 text-foreground/80 leading-relaxed whitespace-pre-line">{it.a}</p>}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </SiteChrome>
  );
}
