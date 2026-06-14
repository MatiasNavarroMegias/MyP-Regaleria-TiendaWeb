import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { products as staticProducts, type Product, type Family } from "@/lib/products";

const KNOWN_FAMILIES: Family[] = ["Amaderados", "Florales", "Cítricos", "Orientales"];
const fallbackImg = staticProducts[0]?.img ?? "";

export type DBProduct = Product & { id?: string };

function mapRow(row: Record<string, unknown>): DBProduct {
  const familyVal = row.family as Family;
  const family = (KNOWN_FAMILIES.includes(familyVal) ? familyVal : (familyVal || "Amaderados")) as Family;
  const slug =
    (row.slug as string | null) ||
    String(row.name ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const imagesArr = Array.isArray(row.images) ? (row.images as string[]).filter(Boolean) : [];
  const mainImg = (row.image_url as string) || imagesArr[0] || fallbackImg;
  return {
    id: row.id as string | undefined,
    slug,
    name: String(row.name ?? ""),
    family,
    gender: String(row.gender ?? "Unisex"),
    notes: String(row.notes_text ?? ""),
    price: Number(row.price ?? 0),
    stock: Number(row.stock ?? 0),
    img: mainImg,
    images: imagesArr.length ? imagesArr : (row.image_url ? [String(row.image_url)] : []),
    description: String(row.description ?? ""),
    reviews: [],
  };
}

async function fetchProducts(): Promise<DBProduct[]> {
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
  const list = q.data && q.data.length > 0 ? q.data : (staticProducts as DBProduct[]);
  // Sort: in-stock first (preserve original relative order), out-of-stock at the end
  const sorted = [...list].sort((a, b) => {
    const ao = a.stock > 0 ? 0 : 1;
    const bo = b.stock > 0 ? 0 : 1;
    return ao - bo;
  });
  return { products: sorted, isLoading: q.isLoading };
}

export function useProduct(slug: string) {
  const { products, isLoading } = useProducts();
  const fromDb = products.find((p) => p.slug === slug);
  const fromStatic = staticProducts.find((p) => p.slug === slug);
  const product = fromDb
    ? { ...fromDb, reviews: fromDb.reviews.length ? fromDb.reviews : fromStatic?.reviews ?? [] }
    : fromStatic;
  return { product, isLoading, products };
}
