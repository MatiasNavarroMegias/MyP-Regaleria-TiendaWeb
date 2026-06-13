import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as staticProducts, type Product, type Family } from "@/lib/products";

const FAMILIES: Family[] = ["Amaderados", "Florales", "Cítricos", "Orientales"];
const fallbackImg = staticProducts[0]?.img ?? "";

function mapRow(row: Record<string, unknown>): Product {
  const family = (FAMILIES.includes(row.family as Family) ? row.family : "Amaderados") as Family;
  const slug =
    (row.slug as string | null) ||
    String(row.name ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  return {
    slug,
    name: String(row.name ?? ""),
    family,
    gender: String(row.gender ?? "Unisex"),
    notes: String(row.notes_text ?? ""),
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    img: (row.image_url as string) || fallbackImg,
    description: String(row.description ?? ""),
    reviews: [],
  };
}

async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
}

export function useProducts() {
  const q = useQuery({ queryKey: ["products"], queryFn: fetchProducts });
  const list = q.data && q.data.length > 0 ? q.data : staticProducts;
  return { products: list, isLoading: q.isLoading };
}

export function useProduct(slug: string) {
  const { products, isLoading } = useProducts();
  const fromDb = products.find((p) => p.slug === slug);
  const fromStatic = staticProducts.find((p) => p.slug === slug);
  // Prefer DB but merge in reviews from static if available
  const product = fromDb
    ? { ...fromDb, reviews: fromDb.reviews.length ? fromDb.reviews : fromStatic?.reviews ?? [] }
    : fromStatic;
  return { product, isLoading, products };
}
