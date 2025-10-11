"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser"; // ✅ côté client
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ProductsFilters from "@/components/filters/ProductsFilters";

export const dynamic = "force-dynamic";

type Product = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string | null;
};

function ProductsInner() {
  const sp = useSearchParams();
  const supabase = useMemo(() => createClient(), []); // ✅ instance
  const [rows, setRows] = useState<Product[] | null>(null);

  const q = sp.get("q") ?? "";
  const cat = sp.get("cat") ?? "";
  const sort = sp.get("sort") ?? "created_desc";

  useEffect(() => {
    let mounted = true;

    (async () => {
      setRows(null);

      let query = supabase
        .from("products")
        .select("id,name,category,description,created_at");

      if (q) {
        // recherche sur name OU description
        query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
      }
      if (cat) query = query.eq("category", cat);

      if (sort === "name_asc") query = query.order("name", { ascending: true });
      else if (sort === "name_desc") query = query.order("name", { ascending: false });
      else if (sort === "created_asc") query = query.order("created_at", { ascending: true });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query.limit(200);

      if (!mounted) return;
      setRows(error ? [] : ((data ?? []) as Product[]));
    })();

    return () => {
      mounted = false;
    };
  }, [q, cat, sort, supabase]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button asChild>
          <Link href="/products/new">New product</Link>
        </Button>
      </div>

      {/* TODO: passe une vraie liste de catégories si tu en as une */}
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
              {rows.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category ?? "—"}</td>
                  <td className="p-3">
                    {p.created_at
                      ? new Date(p.created_at).toLocaleDateString("fr-FR", { timeZone: "Europe/Paris" })
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <ProductsInner />
    </Suspense>
  );
}
