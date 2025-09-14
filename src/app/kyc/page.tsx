"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyCompanies } from "@/lib/supa-helpers";

type Kyc = {
  id: string;
  company_id: string;
  doc_type: string;
  file_url: string;
  status: string | null;
  created_at: string;
};

export default function KycPage() {
  const [rows, setRows] = useState<Kyc[] | null>(null);

  useEffect(() => {
    (async () => {
      setRows(null);
      const comps = await getMyCompanies();
      const ids = comps.map(c => c.id);
      if (ids.length === 0) { setRows([]); return; }
      const { data, error } = await supabase
        .from("kyc_documents")
        .select("id,company_id,doc_type,file_url,status,created_at")
        .in("company_id", ids)
        .order("created_at", { ascending: false });
      setRows(error ? [] : (data ?? []));
    })();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">KYC documents</h1>
        <Button asChild><Link href="/kyc/new">Upload</Link></Button>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">No KYC docs yet.</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Type</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">File</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(d=>(
                <tr key={d.id} className="border-t">
                  <td className="p-3">{d.company_id.slice(0,8)}…</td>
                  <td className="p-3">{d.doc_type}</td>
                  <td className="p-3">{d.status ?? "pending"}</td>
                  <td className="p-3">
                    {d.file_url ? <a className="underline" href={d.file_url} target="_blank">Open</a> : "—"}
                  </td>
                  <td className="p-3">{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
