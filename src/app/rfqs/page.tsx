// src/app/rfqs/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type RelatedRFQ = {
  id: string;
  title: string | null;
  status: string;
  created_at: string;
};

type RfqRow = {
  rfq_id: string;
  rfqs: RelatedRFQ | null; // ← on normalise à un seul objet (pas tableau)
};

export default function RfqsPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<RfqRow[] | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Auth
      const { data: du, error: eu } = await supabase.auth.getUser();
      if (!mounted) return;

      if (eu || !du.user) {
        setRows([]);
        toast.warning("Please sign in");
        return;
      }

      // RFQs où je suis participant
      const { data, error } = await supabase
        .from("rfq_participants")
        .select("rfq_id, rfqs(id,title,status,created_at)")
        .eq("user_id", du.user.id)
        .order("created_at", { referencedTable: "rfqs", ascending: false })
        .limit(200);

      if (!mounted) return;

      if (error) {
        toast.error(error.message);
        setRows([]);
        return;
      }

      // ⚙️ Normalisation: rfqs peut être objet OU tableau → on prend le 1er si tableau
      const normalized: RfqRow[] = (data ?? []).map((row: any) => {
        const raw = row?.rfqs;
        const one: RelatedRFQ | null = Array.isArray(raw)
          ? (raw[0] ?? null)
          : (raw ?? null);

        return {
          rfq_id: String(row.rfq_id),
          rfqs: one
            ? {
                id: String(one.id),
                title: one.title ?? null,
                status: String(one.status),
                created_at: String(one.created_at),
              }
            : null,
        };
      });

      setRows(normalized);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My RFQs</h1>
        <Button asChild><Link href="/rfqs/new">New RFQ</Link></Button>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">
          No RFQs yet. <Link href="/rfqs/new" className="underline">Create one</Link>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const rfq = r.rfqs;
                return (
                  <tr key={r.rfq_id} className="border-t">
                    <td className="p-3">{rfq?.title ?? r.rfq_id.slice(0, 8) + "…"}</td>
                    <td className="p-3">{rfq?.status ?? "—"}</td>
                    <td className="p-3">
                      {rfq?.created_at
                        ? new Date(rfq.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
