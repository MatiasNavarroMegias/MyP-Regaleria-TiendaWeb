import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
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
  featured: false,
  active: true,
};

function ProductsAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

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
      const payload = {
        name: p.name ?? "",
        family: p.family ?? "Amaderados",
        gender: p.gender ?? "Unisex",
        notes_text: p.notes_text ?? null,
        description: p.description ?? null,
        price: Number(p.price ?? 0),
        stock: Number(p.stock ?? 0),
        image_url: p.image_url ?? null,
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
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Producto eliminado");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error al eliminar"),
  });

  async function uploadImage(file: File) {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error(error.message);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setEditing((cur) => ({ ...(cur ?? empty), image_url: data.publicUrl }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl">Productos</h1>
          <p className="text-zinc-400 text-sm mt-1">Gestioná las fragancias del catálogo.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2.5 rounded-md text-sm font-medium hover:bg-zinc-200">
          <Plus className="size-4" /> Nuevo producto
        </button>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900/80 text-zinc-500 text-[10px] uppercase tracking-widest">
            <tr>
              <th className="text-left px-5 py-3">Producto</th>
              <th className="text-left px-5 py-3">Familia</th>
              <th className="text-right px-5 py-3">Precio</th>
              <th className="text-right px-5 py-3">Stock</th>
              <th className="text-center px-5 py-3">Activo</th>
              <th className="text-right px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {isLoading && <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-500">Cargando…</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-zinc-500">Sin productos aún.</td></tr>}
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-900/60">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? <img src={p.image_url} alt="" className="size-10 object-cover rounded" /> : <div className="size-10 bg-zinc-800 rounded" />}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.gender}{p.featured ? " · Destacado" : ""}</p>
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
                  <button onClick={() => { if (confirm(`¿Eliminar "${p.name}"?`)) remove.mutate(p.id); }} className="p-2 text-zinc-400 hover:text-red-400"><Trash2 className="size-4" /></button>
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
              <Field label="Imagen">
                <div className="flex gap-3 items-start">
                  {editing.image_url && <img src={editing.image_url} alt="" className="size-20 object-cover rounded border border-zinc-800" />}
                  <div className="flex-1 space-y-2">
                    <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} className="text-xs text-zinc-400" />
                    <input placeholder="o pegá una URL" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className={inputCls} />
                  </div>
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
