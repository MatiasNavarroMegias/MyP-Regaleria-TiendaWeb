import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/content")({
  component: ContentAdmin,
});

type Section = { key: string; label: string; fields: { name: string; label: string; type?: "text" | "textarea" | "url" }[] };

const SECTIONS: Section[] = [
  { key: "brand", label: "Marca", fields: [
    { name: "name", label: "Nombre" }, { name: "tagline", label: "Bajada" }, { name: "logo_url", label: "URL del logo", type: "url" },
  ]},
  { key: "hero", label: "Banner principal (Hero)", fields: [
    { name: "title", label: "Título", type: "textarea" }, { name: "subtitle", label: "Subtítulo", type: "textarea" },
    { name: "cta_label", label: "Texto del botón" }, { name: "cta_link", label: "Link del botón" },
    { name: "image_url", label: "Imagen de fondo (URL)", type: "url" },
  ]},
  { key: "featured_section", label: "Sección de productos destacados", fields: [
    { name: "eyebrow", label: "Etiqueta superior" }, { name: "title", label: "Título" },
  ]},
  { key: "categories_section", label: "Sección de categorías", fields: [
    { name: "eyebrow", label: "Etiqueta superior" }, { name: "title", label: "Título" },
  ]},
  { key: "category_amaderados", label: "Categoría · Amaderados", fields: [{ name: "tagline", label: "Bajada" }, { name: "image_url", label: "Imagen de portada", type: "url" }]},
  { key: "category_florales", label: "Categoría · Florales", fields: [{ name: "tagline", label: "Bajada" }, { name: "image_url", label: "Imagen de portada", type: "url" }]},
  { key: "category_orientales", label: "Categoría · Orientales", fields: [{ name: "tagline", label: "Bajada" }, { name: "image_url", label: "Imagen de portada", type: "url" }]},
  { key: "category_citricos", label: "Categoría · Cítricos", fields: [{ name: "tagline", label: "Bajada" }, { name: "image_url", label: "Imagen de portada", type: "url" }]},
  { key: "esencia", label: "Nuestra esencia", fields: [
    { name: "tagline", label: "Etiqueta" }, { name: "title", label: "Título" },
    { name: "paragraph_1", label: "Párrafo 1", type: "textarea" }, { name: "paragraph_2", label: "Párrafo 2", type: "textarea" },
    { name: "image_url", label: "Imagen", type: "url" },
  ]},
  { key: "contact", label: "Contacto / WhatsApp del carrito", fields: [
    { name: "eyebrow", label: "Etiqueta superior" }, { name: "title", label: "Título" },
    { name: "description", label: "Descripción", type: "textarea" },
    { name: "email", label: "Email" },
    { name: "whatsapp", label: "WhatsApp del carrito (solo números con código país, ej 5491112345678)" },
    { name: "whatsapp_message", label: "Mensaje pre-llenado de WhatsApp (botón flotante)" },
    { name: "instagram", label: "URL de Instagram" }, { name: "instagram_handle", label: "Usuario IG" },
    { name: "city", label: "Ciudad" },
  ]},
  { key: "shipping_bar", label: "Barra de envíos", fields: [{ name: "text", label: "Texto" }] },
  { key: "footer", label: "Footer", fields: [
    { name: "description", label: "Descripción", type: "textarea" },
    { name: "info_title", label: "Título columna info" },
  ]},
];

function ContentAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-content"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("key,value");
      if (error) throw error;
      const m: Record<string, Record<string, unknown>> = {};
      (data ?? []).forEach((r) => { m[r.key] = (r.value as Record<string, unknown>) ?? {}; });
      return m;
    },
  });

  const [draft, setDraft] = useState<Record<string, Record<string, unknown>>>({});
  useEffect(() => { if (data) setDraft(data); }, [data]);

  const save = useMutation({
    mutationFn: async (key: string) => {
      const value = draft[key] ?? {};
      const { error } = await supabase.from("site_content").upsert({ key, value });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Contenido actualizado");
      qc.invalidateQueries({ queryKey: ["admin-content"] });
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al guardar"),
  });

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-3xl mb-2">Contenido del sitio</h1>
      <p className="text-zinc-400 text-sm mb-10">Editá los textos e imágenes del sitio sin tocar código.</p>

      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <div key={s.key} className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
            <h2 className="font-[var(--font-display)] text-xl mb-4">{s.label}</h2>
            <div className="space-y-4">
              {s.fields.map((f) => {
                const val = (draft[s.key]?.[f.name] as string | undefined) ?? "";
                const setVal = (v: string) => setDraft({ ...draft, [s.key]: { ...(draft[s.key] ?? {}), [f.name]: v } });
                return (
                  <label key={f.name} className="block">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500">{f.label}</span>
                    {f.type === "textarea"
                      ? <textarea rows={3} value={val} onChange={(e) => setVal(e.target.value)} className={inp} />
                      : <input value={val} onChange={(e) => setVal(e.target.value)} className={inp} />}
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end mt-5">
              <button onClick={() => save.mutate(s.key)} disabled={save.isPending} className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50">
                Guardar sección
              </button>
            </div>
          </div>
        ))}

        <ShippingReturnsEditor draft={draft} setDraft={setDraft} onSave={() => save.mutate("shipping_returns")} saving={save.isPending} />
        <FaqEditor draft={draft} setDraft={setDraft} onSave={() => save.mutate("faqs")} saving={save.isPending} />
      </div>
    </div>
  );
}

type SectionBlock = { title?: string; body?: string };

function ShippingReturnsEditor({ draft, setDraft, onSave, saving }: { draft: Record<string, Record<string, unknown>>; setDraft: (d: Record<string, Record<string, unknown>>) => void; onSave: () => void; saving: boolean }) {
  const k = "shipping_returns";
  const cur = (draft[k] ?? {}) as { title?: string; intro?: string; sections?: SectionBlock[] };
  const sections = Array.isArray(cur.sections) ? cur.sections : [];

  function set(patch: Partial<typeof cur>) {
    setDraft({ ...draft, [k]: { ...cur, ...patch } });
  }
  function setSections(s: SectionBlock[]) { set({ sections: s }); }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
      <h2 className="font-[var(--font-display)] text-xl mb-4">Envíos y Devoluciones</h2>
      <div className="space-y-3">
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Título</span>
          <input value={cur.title ?? ""} onChange={(e) => set({ title: e.target.value })} className={inp} />
        </label>
        <label className="block">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">Intro</span>
          <textarea rows={2} value={cur.intro ?? ""} onChange={(e) => set({ intro: e.target.value })} className={inp} />
        </label>
        <div className="space-y-3 pt-2">
          {sections.map((s, i) => (
            <div key={i} className="border border-zinc-800 rounded p-3 space-y-2 relative">
              <button onClick={() => setSections(sections.filter((_, j) => j !== i))} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"><Trash2 className="size-4" /></button>
              <input placeholder="Título de la sección" value={s.title ?? ""} onChange={(e) => { const c = [...sections]; c[i] = { ...c[i], title: e.target.value }; setSections(c); }} className={inp} />
              <textarea rows={3} placeholder="Texto" value={s.body ?? ""} onChange={(e) => { const c = [...sections]; c[i] = { ...c[i], body: e.target.value }; setSections(c); }} className={inp} />
            </div>
          ))}
          <button onClick={() => setSections([...sections, { title: "", body: "" }])} className="text-xs flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded">
            <Plus className="size-3" /> Agregar sección
          </button>
        </div>
      </div>
      <div className="flex justify-end mt-5">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50">Guardar sección</button>
      </div>
    </div>
  );
}

type FaqItem = { q?: string; a?: string };

function FaqEditor({ draft, setDraft, onSave, saving }: { draft: Record<string, Record<string, unknown>>; setDraft: (d: Record<string, Record<string, unknown>>) => void; onSave: () => void; saving: boolean }) {
  const k = "faqs";
  const cur = (draft[k] ?? {}) as { title?: string; items?: FaqItem[] };
  const items = Array.isArray(cur.items) ? cur.items : [];

  function set(patch: Partial<typeof cur>) {
    setDraft({ ...draft, [k]: { ...cur, ...patch } });
  }
  function setItems(s: FaqItem[]) { set({ items: s }); }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6">
      <h2 className="font-[var(--font-display)] text-xl mb-4">Preguntas Frecuentes</h2>
      <label className="block mb-3">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Título</span>
        <input value={cur.title ?? ""} onChange={(e) => set({ title: e.target.value })} className={inp} />
      </label>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="border border-zinc-800 rounded p-3 space-y-2 relative">
            <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="absolute top-2 right-2 text-zinc-500 hover:text-red-400"><Trash2 className="size-4" /></button>
            <input placeholder="Pregunta" value={it.q ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...c[i], q: e.target.value }; setItems(c); }} className={inp} />
            <textarea rows={3} placeholder="Respuesta" value={it.a ?? ""} onChange={(e) => { const c = [...items]; c[i] = { ...c[i], a: e.target.value }; setItems(c); }} className={inp} />
          </div>
        ))}
        <button onClick={() => setItems([...items, { q: "", a: "" }])} className="text-xs flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded">
          <Plus className="size-3" /> Agregar pregunta
        </button>
      </div>
      <div className="flex justify-end mt-5">
        <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50">Guardar sección</button>
      </div>
    </div>
  );
}

const inp = "mt-1.5 w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm focus:outline-none focus:border-zinc-600";
