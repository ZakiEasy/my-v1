"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getCurrentUserId } from "@/lib/supa-helpers";

type Rfq = {
  id: string;
  buyer_company_id: string;
  title: string;
  description: string | null;
  created_at: string;
};

export default function RfqsPage() {
  const [rfqs, setRfqs] = useState<Rfq[] | null>(null);
  const [companyNames, setCompanyNames] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      setRfqs(null);
      const uid = await getCurrentUserId();
      if (!uid) {
        toast.warning("Please sign in first");
        return;
      }

      // 1) get my companies (ids)
      const { data: myCompanies, error: eComp } = await createClient
        .from("companies")
        .select("id,name")
        .eq("owner", uid);
      if (eComp) {
        toast.error(eComp.message);
        setRfqs([]);
        return;
      }
      const ids = (myCompanies ?? []).map((c) => c.id);
      setCompanyNames(
        Object.fromEntries((myCompanies ?? []).map((c) => [c.id, c.name]))
      );

      if (ids.length === 0) {
        setRfqs([]);
        return;
      }

      // 2) list RFQs for my buyer companies
      const { data, error } = await createClient
        .from("rfqs")
        .select("id,buyer_company_id,title,description,created_at")
        .in("buyer_company_id", ids)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error.message);
        setRfqs([]);
        return;
      }
      setRfqs((data ?? []) as Rfq[]);
    })();
  }, []);

  const rows = useMemo(() => rfqs ?? [], [rfqs]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My RFQs</h1>
        <Button asChild>
          <Link href="/rfqs/new">Create RFQ</Link>
        </Button>
      </div>

      {rfqs === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">
          No RFQs yet. <Link className="underline" href="/rfqs/new">Create your first RFQ</Link>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Buyer company</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.title}</td>
                  <td className="p-3">
                    {companyNames[r.buyer_company_id] ?? r.buyer_company_id}
                  </td>
                  <td className="p-3">
                    {new Date(r.created_at).toLocaleDateString()}
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
