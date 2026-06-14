import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/families")({
  component: FamiliesAdmin,
});

type Family = { id: string; name: string; sort_order: number; active: boolean };

function FamiliesAdmin() {
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-families"],
    queryFn: async () => {
      const { data, error } = await supabase.from("families").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as Family[];
    },
  });

  const create = useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("families").insert({ name, sort_order: items.length + 1 });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Familia creada"); setNewName(""); qc.invalidateQueries({ queryKey: ["admin-families"] }); qc.invalidateQueries({ queryKey: ["families"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const update = useMutation({
    mutationFn: async (f: Family) => {
      const { error } = await supabase.from("families").update({ name: f.name, sort_order: f.sort_order, active: f.active }).eq("id", f.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Guardado"); qc.invalidateQueries({ queryKey: ["admin-families"] }); qc.invalidateQueries({ queryKey: ["families"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("families").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Familia eliminada"); qc.invalidateQueries({ queryKey: ["admin-families"] }); qc.invalidateQueries({ queryKey: ["families"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "No se puede borrar: tiene productos asignados"),
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[var(--font-display)] text-3xl">Familias olfativas</h1>
        <p className="text-zinc-400 text-sm mt-1">Categorías que clasifican a los productos. No se puede borrar una familia que tenga productos asignados.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (newName.trim()) create.mutate(newName.trim()); }} className="flex gap-2 mb-6">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nueva familia (ej: Acuáticos)" className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-sm focus:outline-none focus:border-zinc-600" />
        <button type="submit" disabled={!newName.trim() || create.isPending} className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-zinc-200 disabled:opacity-50">
          <Plus className="size-4" /> Agregar
        </button>
      </form>

      <div className="bg-zinc-900 border border-zinc-800 rounded-md divide-y divide-zinc-800">
        {isLoading && <p className="px-5 py-10 text-center text-zinc-500 text-sm">Cargando…</p>}
        {!isLoading && items.length === 0 && <p className="px-5 py-10 text-center text-zinc-500 text-sm">Sin familias.</p>}
        {items.map((f) => <FamilyRow key={f.id} initial={f} onSave={(x) => update.mutate(x)} onDelete={() => { if (confirm(`¿Eliminar familia "${f.name}"?`)) remove.mutate(f.id); }} />)}
      </div>
    </div>
  );
}

function FamilyRow({ initial, onSave, onDelete }: { initial: Family; onSave: (f: Family) => void; onDelete: () => void }) {
  const [f, setF] = useState(initial);
  const dirty = f.name !== initial.name || f.sort_order !== initial.sort_order || f.active !== initial.active;
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} className="w-16 px-2 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-sm" />
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-sm" />
      <label className="flex items-center gap-2 text-xs text-zinc-400">
        <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> Activa
      </label>
      <button onClick={() => onSave(f)} disabled={!dirty} className="p-2 text-zinc-400 hover:text-white disabled:opacity-30"><Save className="size-4" /></button>
      <button onClick={onDelete} className="p-2 text-zinc-400 hover:text-red-400"><Trash2 className="size-4" /></button>
    </div>
  );
}
