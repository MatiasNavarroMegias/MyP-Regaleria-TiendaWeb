import { useEffect } from "react";
import { useSiteContent } from "@/lib/site-content";

const VAR_MAP: Record<string, string> = {
  background: "--background",
  foreground: "--foreground",
  primary: "--primary",
  primary_foreground: "--primary-foreground",
  accent: "--accent",
  muted: "--muted",
};

export function ThemeApplier() {
  const { data } = useSiteContent();
  const theme = (data?.theme ?? {}) as Record<string, string>;

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    Object.entries(VAR_MAP).forEach(([k, cssVar]) => {
      const v = theme[k];
      if (typeof v === "string" && v.trim()) root.style.setProperty(cssVar, v);
      else root.style.removeProperty(cssVar);
    });
  }, [theme]);

  return null;
}
