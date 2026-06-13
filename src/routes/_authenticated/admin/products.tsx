import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

type Product = Tables<"products">;

const empty: TablesInsert<"products"> = {
  name: "",
  family: "Amaderados",
  gender: "Unisex",
  notes_text: "",
  description: "",
  price: 0,
  stock: 0,
  image_url: "",
  images: [],
  featured: false,
  active: true,
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const save = useMutation({
    mutationFn: async (p: Partial<Product>) => {
      const imgs = (p.images as string[] | null | undefined) ?? [];
      const payload = {
        name: p.name ?? "",
        family: p.family ?? "Amaderados",
        gender: p.gender ?? "Unisex",
        notes_text: p.notes_text ?? null,
        description: p.description ?? null,
        price: Number(p.price ?? 0),
        stock: Number(p.stock ?? 0),
        image_url: (p.image_url || imgs[0]) ?? null,
        images: imgs,
        featured: !!p.featured,
        active: p.active !== false,
      };
      if (p.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Producto guardado");
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al guardar"),
  });

  const remove = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase.from("products").delete().in("id", ids);
      if (error) throw error;
    },
    onSuccess: (_d, ids) => {
      toast.success(`${ids.length} producto${ids.length === 1 ? "" : "s"} eliminado${ids.length === 1 ? "" : "s"}`);
      setSelected(new Set());
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al eliminar"),
  });

  async function uploadImages(files: FileList) {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) {
        toast.error(error.message);
        continue;
      }
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setEditing((cur) => {
      const base = cur ?? empty;
      const existing = (base.images as string[] | null | undefined) ?? [];
      const next = [...existing, ...urls];
      return { ...base, images: next, image_url: base.image_url || next[0] || "" };
    });
    setUploading(false);
  }

  function removeImage(url: string) {
    setEditing((cur) => {
      if (!cur) return cur;
      const next = ((cur.images as string[] | null | undefined) ?? []).filter((u) => u !== url);
      return { ...cur, images: next, image_url: cur.image_url === url ? next[0] ?? "" : cur.image_url };
    });
  }

  function moveImage(idx: number, dir: -1 | 1) {
    setEditing((cur) => {
      if (!cur) return cur;
      const arr = [...(((cur.images as string[] | null | undefined) ?? []))];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return cur;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...cur, images: arr, image_url: arr[0] ?? cur.image_url };
    });
  }

  const allChecked = items.length > 0 && selected.size === items.length;
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(items.map((p) => p.id)));
  const toggleOne = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const editingImages = ((editing?.images as string[] | null | undefined) ?? []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl">Productos</h1>
          <p className="text-zinc-400 text-sm mt-1">Gestioná las fragancias del catálogo.</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button
              onClick={() => { if (confirm(`¿Eliminar ${selected.size} producto(s) seleccionado(s)?`)) remove.mutate(Array.from(selected)); }}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-md text-sm font-medium hover:bg-red-500"
            >
              <Trash2 className="size-4" /> Eliminar ({selected.size})
            </button>
          )}
          <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200">
            <Plus className="size-4" /> Nuevo producto
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80 text-zinc-500 text-[10px] uppercase tracking-widest">
            <tr>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
              </th>
              <th className="text-left px-5 py-3">Producto</th>
              <th className="text-left px-5 py-3">Familia</th>
              <th className="text-right px-5 py-3">Precio</th>
              <th className="text-right px-5 py-3">Stock</th>
              <th className="text-center px-5 py-3">Activo</th>
              <th className="text-right px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading && <tr><td colSpan={7} className="px-5 py-10 text-center text-zinc-500">Cargando…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={7} className="px-5 py-10 text-center text-zinc-500">Sin productos aún.</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className={`hover:bg-zinc-900/60 ${selected.has(p.id) ? "bg-zinc-800/40" : ""}`}>
                <td className="px-4 py-3 text-center">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} />
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? <img src={p.image_url} alt="" className="size-10 object-cover rounded" /> : <div className="size-10 bg-zinc-800 rounded" />}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-zinc-500">
                        {p.gender}{p.featured ? " · Destacado" : ""}
                        {p.images && p.images.length > 1 ? ` · ${p.images.length} fotos` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-zinc-400">{p.family}</td>
                <td className="px-5 py-3 text-right">${Number(p.price).toLocaleString("es-AR")}</td>
                <td className="px-5 py-3 text-right">{p.stock}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-block size-2 rounded-full ${p.active ? "bg-emerald-500" : "bg-zinc-600"}`} />
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => setEditing(p)} className="p-2 text-zinc-400 hover:text-white"><Pencil className="size-4" /></button>
                  <button onClick={() => { if (confirm(`¿Eliminar "${p.name}"?`)) remove.mutate([p.id]); }} className="p-2 text-zinc-400 hover:text-red-400"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-md w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="font-[var(--font-display)] text-xl">{editing.id ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setEditing(null)} className="text-zinc-400 hover:text-white"><X className="size-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="p-6 space-y-4">
              <Field label="Nombre"><input required value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Familia olfativa">
                  <select value={editing.family ?? "Amaderados"} onChange={(e) => setEditing({ ...editing, family: e.target.value })} className={inputCls}>
                    {["Amaderados", "Florales", "Cítricos", "Orientales"].map((f) => <option key={f}>{f}</option>)}
                  </select>
                </Field>
                <Field label="Género"><input value={editing.gender ?? ""} onChange={(e) => setEditing({ ...editing, gender: e.target.value })} className={inputCls} /></Field>
              </div>
              <Field label="Notas (texto libre)"><input value={editing.notes_text ?? ""} onChange={(e) => setEditing({ ...editing, notes_text: e.target.value })} className={inputCls} /></Field>
              <Field label="Descripción"><textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Precio (ARS)"><input type="number" min={0} value={editing.price ?? 0} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} className={inputCls} /></Field>
                <Field label="Stock"><input type="number" min={0} value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} className={inputCls} /></Field>
              </div>

              <Field label={`Galería de imágenes (${editingImages.length}) — la primera es la principal`}>
                <div className="space-y-3">
                  {editingImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {editingImages.map((url, idx) => (
                        <div key={url + idx} className="relative group border border-zinc-800 rounded overflow-hidden">
                          <img src={url} alt="" className="w-full aspect-square object-cover" />
                          {idx === 0 && <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] uppercase px-1.5 py-0.5 rounded">Principal</span>}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                            <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="p-1 text-white disabled:opacity-30" title="Mover izquierda"><GripVertical className="size-4 rotate-180" /></button>
                            <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === editingImages.length - 1} className="p-1 text-white disabled:opacity-30" title="Mover derecha"><GripVertical className="size-4" /></button>
                            <button type="button" onClick={() => removeImage(url)} className="p-1 text-red-400 hover:text-red-300"><X className="size-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => { const fs = e.target.files; if (fs && fs.length) uploadImages(fs); e.currentTarget.value = ""; }}
                    className="text-xs text-zinc-400"
                  />
                  {uploading && <p className="text-xs text-zinc-500">Subiendo…</p>}
                  <input
                    placeholder="o pegá una URL y presioná Enter"
                    className={inputCls}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const v = (e.target as HTMLInputElement).value.trim();
                        if (v) {
                          const next = [...editingImages, v];
                          setEditing({ ...editing, images: next, image_url: editing.image_url || next[0] });
                          (e.target as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                </div>
              </Field>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Destacado en home</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active !== false} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Visible en tienda</label>
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancelar</button>
                <button type="submit" disabled={save.isPending} className="px-5 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50">{save.isPending ? "Guardando…" : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm focus:outline-none focus:border-zinc-600";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="text-[10px] uppercase tracking-widest text-zinc-500">{label}</span><div className="mt-1.5">{children}</div></label>;
}
