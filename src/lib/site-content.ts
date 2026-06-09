import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ContentMap = Record<string, Record<string, unknown>>;

export const siteContentQuery = queryOptions({
  queryKey: ["site_content"],
  queryFn: async (): Promise<ContentMap> => {
    const { data, error } = await supabase.from("site_content").select("key,value");
    if (error) throw error;
    const map: ContentMap = {};
    (data ?? []).forEach((r) => {
      map[r.key] = (r.value as Record<string, unknown>) ?? {};
    });
    return map;
  },
});

export function useSiteContent() {
  return useQuery(siteContentQuery);
}

export function pickString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export const productsListQuery = (opts?: { featuredOnly?: boolean }) =>
  queryOptions({
    queryKey: ["products", opts?.featuredOnly ? "featured" : "all"],
    queryFn: async () => {
      let q = supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (opts?.featuredOnly) q = q.eq("featured", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

export function useProducts(opts?: { featuredOnly?: boolean }) {
  return useQuery(productsListQuery(opts));
}

// Resolve image_url: support legacy local path "/src/assets/x.jpg" via Vite import map fallback.
import perfume1 from "@/assets/perfume-1.jpg";
import perfume2 from "@/assets/perfume-2.jpg";
import perfume3 from "@/assets/perfume-3.jpg";
import featured from "@/assets/featured.jpg";
import hero from "@/assets/hero.jpg";
import workshop from "@/assets/workshop.jpg";

const legacyMap: Record<string, string> = {
  "/src/assets/perfume-1.jpg": perfume1,
  "/src/assets/perfume-2.jpg": perfume2,
  "/src/assets/perfume-3.jpg": perfume3,
  "/src/assets/featured.jpg": featured,
  "/src/assets/hero.jpg": hero,
  "/src/assets/workshop.jpg": workshop,
};

export function resolveImage(url: string | null | undefined, fallback?: string): string {
  if (!url) return fallback ?? "";
  if (legacyMap[url]) return legacyMap[url];
  return url;
}
