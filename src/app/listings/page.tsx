"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ListingsFilters from "@/components/filters/ListingsFilters";
import { useSearchParams } from "next/navigation";

type Row = {
  id: string;
  product_id: string;
  moq: number | null;
  price_min: number | null;
  price_max: number | null;
  incoterm: string | null;
  status: string | null;
  created_at: string;
  products?: { name: string | null } | null;
};

export default function ListingsPage() {
  const sp = useSearchParams();
  const [rows, setRows] = useState<Row[] | null>(null);

  const q = sp.get("q") ?? "";
  const inc = sp.get("inc") ?? "";
  const pmin = sp.get("pmin") ? Number(sp.get("pmin")) : null;
  const pmax = sp.get("pmax") ? Number(sp.get("pmax")) : null;
  const moq = sp.get("moq") ? Number(sp.get("moq")) : null;
  const sort = sp.get("sort") ?? "created_desc";

  useEffect(() => {
    (async () => {
      setRows(null);
      // join product name (if you created a FK products->listings)
      let query = supabase
        .from("listings")
        .select("id,product_id,moq,price_min,price_max,incoterm,status,created_at,products(name)")
        .limit(200);

      // text search on listing or product name (requires PostgREST or filter on joined columns)
      if (q) {
        query = query.or(
          `incoterm.ilike.%${q}%,status.ilike.%${q}%,products.name.ilike.%${q}%`
        );
      }
      if (inc) query = query.eq("incoterm", inc);
      if (pmin != null) query = query.gte("price_min", pmin);
      if (pmax != null) query = query.lte("price_max", pmax);
      if (moq != null) query = query.gte("moq", moq);

      // sort
      if (sort === "price_asc") query = query.order("price_min", { ascending: true, nullsFirst: true });
      else if (sort === "price_desc") query = query.order("price_min", { ascending: false, nullsFirst: true });
      else if (sort === "moq_asc") query = query.order("moq", { ascending: true, nullsFirst: true });
      else if (sort === "moq_desc") query = query.order("moq", { ascending: false, nullsFirst: true });
      else if (sort === "created_asc") query = query.order("created_at", { ascending: true });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      setRows(error ? [] : (data as Row[]));
    })();
  }, [q, inc, pmin, pmax, moq, sort]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Listings</h1>
        <Button asChild><Link href="/listings/new">New listing</Link></Button>
      </div>

      <ListingsFilters className="mt-2" />

      {rows === null ? (
        <Skeleton className="h-28 w-full" />
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">No results.</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Incoterm</th>
                <th className="text-left p-3">MOQ</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.products?.name ?? r.product_id.slice(0,8)+"…"}</td>
                  <td className="p-3">{r.incoterm ?? "—"}</td>
                  <td className="p-3">{r.moq ?? "—"}</td>
                  <td className="p-3">
                    {r.price_min != null || r.price_max != null
                      ? `${r.price_min ?? "?"} – ${r.price_max ?? "?"}`
                      : "—"}
                  </td>
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
