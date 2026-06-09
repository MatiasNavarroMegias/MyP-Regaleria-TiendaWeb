import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteChrome } from "@/components/SiteChrome";
import { ProductCard } from "@/components/ProductCard";
import { products, families, type Family } from "@/lib/products";

const searchSchema = z.object({
  familia: z.enum(["Amaderados", "Florales", "Cítricos", "Orientales"]).optional(),
});

export const Route = createFileRoute("/catalogo")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Catálogo — Natalia Santos" },
      { name: "description", content: "Explorá todas las fragancias de autor: amaderados, florales, cítricos y orientales." },
      { property: "og:title", content: "Catálogo — Natalia Santos" },
      { property: "og:description", content: "Explorá todas las fragancias de autor." },
    ],
  }),
  component: Catalogo,
});

const sortOptions = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "alfabetico", label: "Alfabético (A-Z)" },
] as const;

type SortKey = (typeof sortOptions)[number]["value"];

function Catalogo() {
  const { familia } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [activeFamily, setActiveFamily] = useState<(typeof families)[number]>(
    (familia as Family) ?? "Todos",
  );
  const [sortKey, setSortKey] = useState<SortKey>("destacados");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = products.filter((p) => {
      const matchesFamily = activeFamily === "Todos" || p.family === activeFamily;
      const matchesQuery =
        q === "" ||
        p.name.toLowerCase().includes(q) ||
        p.notes.toLowerCase().includes(q) ||
        p.family.toLowerCase().includes(q);
      return matchesFamily && matchesQuery;
    });
    switch (sortKey) {
      case "precio-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "precio-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "alfabetico": list = [...list].sort((a, b) => a.name.localeCompare(b.name, "es")); break;
    }
    return list;
  }, [query, activeFamily, sortKey]);

  return (
    <SiteChrome>
      <section className="py-24 md:py-32">
        <div className="px-6 md:px-24 max-w-7xl mx-auto">
          <div className="mb-10">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">Tienda</span>
            <h1 className="font-[var(--font-display)] text-4xl md:text-5xl mt-3">Catálogo</h1>
            <p className="text-foreground/60 text-sm mt-2">
              Explorá las fragancias por nombre, familia olfativa o nota.
            </p>
          </div>

          <div className="flex flex-col gap-6 mb-12 pb-6 border-b border-border">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <label className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground/40" strokeWidth={1.5} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o nota olfativa"
                  className="w-full pl-10 pr-4 py-3 bg-background border border-border text-sm placeholder:text-foreground/40 focus:outline-none focus:border-foreground transition-colors"
                />
              </label>
              <div className="flex items-center gap-3">
                <label className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/60">Ordenar</label>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors min-w-[14rem]"
                >
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/60 self-center mr-2">Filtrar</span>
              {families.map((f) => {
                const active = f === activeFamily;
                return (
                  <button
                    key={f}
                    onClick={() => setActiveFamily(f)}
                    className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-colors ${active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}
                  >
                    {f}
                  </button>
                );
              })}
            </div>

            <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/50">
              {filtered.length} {filtered.length === 1 ? "fragancia" : "fragancias"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="font-[var(--font-display)] text-2xl italic mb-2">Sin resultados</p>
              <p className="text-sm text-foreground/60">Probá con otra búsqueda o quitá los filtros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {filtered.map((p) => <ProductCard key={p.name} p={p} />)}
            </div>
          )}
        </div>
      </section>
    </SiteChrome>
  );
}
