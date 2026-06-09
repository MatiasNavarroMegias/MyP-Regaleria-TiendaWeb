import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Ingresar — Natalia Santos" },
      { name: "description", content: "Iniciá sesión o creá tu cuenta." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: redirect ?? "/", replace: true });
    });
  }, [navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Ya podés ingresar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenida de nuevo");
        navigate({ to: redirect ?? "/", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error(result.error.message || "No se pudo iniciar con Google");
        return;
      }
      if (result.redirected) return;
      navigate({ to: redirect ?? "/", replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Toaster />
      <div className="w-full max-w-md">
        <Link to="/" className="block text-center font-[var(--font-display)] text-2xl tracking-tight mb-2">
          NATALIA SANTOS
        </Link>
        <p className="text-center text-[10px] uppercase tracking-[0.25em] text-foreground/50 mb-10">
          Perfumería de Autor
        </p>
        <div className="border border-border p-8 bg-card">
          <h1 className="font-[var(--font-display)] text-3xl mb-1">
            {mode === "signin" ? "Ingresar" : "Crear cuenta"}
          </h1>
          <p className="text-sm text-foreground/60 mb-8">
            {mode === "signin"
              ? "Ingresá con tu email o con Google."
              : "Creá tu cuenta para guardar tus preferencias."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={busy}
            className="w-full py-3 border border-foreground text-[11px] uppercase tracking-[0.2em] mb-6 hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
          >
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/40">o</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="text-[10px] uppercase tracking-widest text-foreground/60">Nombre completo</span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-foreground"
                />
              </label>
            )}
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-foreground/60">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-foreground"
              />
            </label>
            <label className="block">
              <span className="text-[10px] uppercase tracking-widest text-foreground/60">Contraseña</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full px-4 py-3 bg-background border border-border text-sm focus:outline-none focus:border-foreground"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] hover:bg-primary transition-colors disabled:opacity-50"
            >
              {busy ? "Procesando…" : mode === "signin" ? "Ingresar" : "Crear cuenta"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="block w-full mt-6 text-xs text-foreground/60 hover:text-foreground"
          >
            {mode === "signin" ? "¿No tenés cuenta? Crear una" : "¿Ya tenés cuenta? Ingresar"}
          </button>
        </div>
        <Link to="/" className="block text-center mt-8 text-[10px] uppercase tracking-widest text-foreground/50 hover:text-foreground">
          ← Volver al sitio
        </Link>
      </div>
    </div>
  );
}
