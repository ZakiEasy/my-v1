// src/app/page.tsx
import { supabaseServer } from "@/lib/supabase";
import FrontParcours from "@/components/FrontParcours";

type CatalogRow = {
  id: string;
  company_id: string | null;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string;
  supplier_name: string | null;
  supplier_country: string | null;
  kyc_level: number | null;
  supplier_score: string | number | null;
};

export default async function Page() {
  const supabase = await supabaseServer();
  const { data, error } = await supabase
    .from("products_catalog")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("Supabase error:", error);
  }

  return <FrontParcours produits={(data ?? []) as CatalogRow[]} />;
}
