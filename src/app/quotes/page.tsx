"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getMySupplierCompanies } from "@/lib/supa-helpers";

type QuoteRow = {
  id: string;
  rfq_id: string;
  supplier_id: string;
  price: number | null;
  message: string | null;
  status: string | null;
  created_at: string;
};

export default function QuotesPage() {
  const [rows, setRows] = useState<QuoteRow[] | null>(null);

  useEffect(() => {
    (async () => {
      setRows(null);
      const companies = await getMySupplierCompanies();
      if (companies.length === 0) {
        setRows([]);
        return;
      }
      const ids = companies.map((c) => c.id);
      const { data, error } = await supabase
        .from("quotes")
        .select("id,rfq_id,supplier_id,price,message,status,created_at")
        .in("supplier_id", ids)
        .order("created_at", { ascending: false });
      if (error) {
        toast.error(error.message);
        setRows([]);
        return;
      }
      setRows((data ?? []) as QuoteRow[]);
    })();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Quotes</h1>
        <Button asChild><Link href="/quotes/new">New quote</Link></Button>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">
          No quotes yet. <Link className="underline" href="/quotes/new">Create your first quote</Link>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">RFQ</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((q) => (
                <tr key={q.id} className="border-t">
                  <td className="p-3">{q.rfq_id}</td>
                  <td className="p-3">{q.price ?? "—"}</td>
                  <td className="p-3">{q.status ?? "sent"}</td>
                  <td className="p-3">{new Date(q.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
