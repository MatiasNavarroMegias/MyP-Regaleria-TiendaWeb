import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Family = { id: string; name: string; sort_order: number; active: boolean };

export function useFamilies() {
  return useQuery({
    queryKey: ["families"],
    queryFn: async (): Promise<Family[]> => {
      const { data, error } = await supabase
        .from("families")
        .select("id,name,sort_order,active")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Family[];
    },
  });
}
