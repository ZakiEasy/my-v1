"use client";

import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductsFilters from "@/components/filters/ProductsFilters";
import { useSearchParams } from "next/navigation";

type Product = { id:string; name:string; category:string|null; description:string|null; created_at:string };

export default function ProductsPage() {
  const sp = useSearchParams();
  //const [rows, setRows] = useState<Product[] | null>(null);

  const q = sp.get("q") ?? "";
  const cat = sp.get("cat") ?? "";
  const sort = sp.get("sort") ?? "created_desc";
/*
  useEffect(() => {
    (async () => {
      setRows(null);
      let query = supabase.from("products")
        .select("id,name,category,description,created_at");

      // text search across name + description
      if (q) {
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }
      // category
      if (cat) query = query.eq("category", cat);

      // sorting
      if (sort === "name_asc") query = query.order("name", { ascending: true });
      else if (sort === "name_desc") query = query.order("name", { ascending: false });
      else if (sort === "created_asc") query = query.order("created_at", { ascending: true });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query.limit(200);
      setRows(error ? [] : (data as Product[]));
    })();
  }, [q, cat, sort]);
  */

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild><Link href="/products/new">New product</Link></Button>
      </div>

      <ProductsFilters className="mt-2" categories={[]} />

      {rows === null ? (
        <Skeleton className="h-28 w-full" />
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">No results.</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category ?? "—"}</td>
                  <td className="p-3">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
