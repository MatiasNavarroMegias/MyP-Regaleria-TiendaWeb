import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/apariencia")({
  component: AparienciaAdmin,
});

const COLORS: { key: string; label: string; help: string; defaultVal: string }[] = [
  { key: "background", label: "Fondo del sitio", help: "Color de fondo general", defaultVal: "#fdfcf8" },
  { key: "foreground", label: "Texto principal", help: "Color del texto y elementos oscuros", defaultVal: "#1a1a1a" },
  { key: "primary", label: "Color de marca (acento)", help: "Botones, links activos, detalles", defaultVal: "#c4a484" },
  { key: "primary_foreground", label: "Texto sobre marca", help: "Texto que va sobre el color de marca", defaultVal: "#fdfcf8" },
  { key: "accent", label: "Acento secundario", help: "Para detalles complementarios", defaultVal: "#c4a484" },
  { key: "muted", label: "Fondo suave", help: "Secciones alternativas y tarjetas", defaultVal: "#f3f0e8" },
];

function AparienciaAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-theme"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_content").select("value").eq("key", "theme").maybeSingle();
      if (error) throw error;
      return (data?.value as Record<string, string>) ?? {};
    },
  });

  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => { if (data) setDraft(data); }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_content").upsert({ key: "theme", value: draft });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Apariencia actualizada");
      qc.invalidateQueries({ queryKey: ["admin-theme"] });
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Error"),
  });

  const reset = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_content").upsert({ key: "theme", value: {} });
      if (error) throw error;
    },
    onSuccess: () => {
      setDraft({});
      toast.success("Colores restaurados");
      qc.invalidateQueries({ queryKey: ["admin-theme"] });
      qc.invalidateQueries({ queryKey: ["site_content"] });
    },
  });

  return (
    <div>
      <h1 className="font-[var(--font-display)] text-3xl mb-2">Apariencia</h1>
      <p className="text-zinc-400 text-sm mb-10">
        Personalizá los colores de la tienda. Los cambios se aplican al guardar.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-md p-6 space-y-5">
        {COLORS.map((c) => {
          const val = draft[c.key] ?? "";
          const effective = val || c.defaultVal;
          return (
            <div key={c.key} className="flex items-center gap-4">
              <input
                type="color"
                value={effective}
                onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
                className="size-12 rounded border border-zinc-700 bg-transparent cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-zinc-500">{c.help}</p>
              </div>
              <input
                value={val}
                placeholder={c.defaultVal}
                onChange={(e) => setDraft({ ...draft, [c.key]: e.target.value })}
                className="w-32 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono"
              />
            </div>
          );
        })}

        <div className="flex justify-between pt-4 border-t border-zinc-800">
          <button
            onClick={() => { if (confirm("¿Restaurar colores por defecto?")) reset.mutate(); }}
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white"
          >
            Restaurar por defecto
          </button>
          <button
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="px-5 py-2 bg-white text-zinc-900 text-sm font-medium rounded-md hover:bg-zinc-200 disabled:opacity-50"
          >
            {save.isPending ? "Guardando…" : "Guardar apariencia"}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-md p-6">
        <h2 className="text-sm font-medium mb-4">Vista previa</h2>
        <div
          className="rounded-md p-8 border"
          style={{
            background: draft.background || "#fdfcf8",
            color: draft.foreground || "#1a1a1a",
            borderColor: (draft.foreground || "#1a1a1a") + "20",
          }}
        >
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: draft.primary || "#c4a484" }}>
            Selección
          </p>
          <h3 className="text-3xl font-serif mb-4">Fragancias destacadas</h3>
          <p className="text-sm opacity-70 mb-6">Así se verán tus textos sobre el fondo elegido.</p>
          <button
            className="px-6 py-3 text-xs uppercase tracking-widest"
            style={{ background: draft.primary || "#c4a484", color: draft.primary_foreground || "#fdfcf8" }}
          >
            Comprar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
