"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser"; // ✅ côté client
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Company = {
  id: string;
  name: string;
  country: string | null;
  created_at: string | null;
};

export default function CompaniesPage() {
  const supabase = useMemo(() => createClient(), []); // ✅ instance
  const [rows, setRows] = useState<Company[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setRows(null);

      const { data, error } = await supabase
        .from("companies")
        .select("id,name,country,created_at")
        .order("created_at", { ascending: false });

      if (!mounted) return;
      setRows(error ? [] : ((data ?? []) as Company[]));
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <Button asChild>
          <Link href="/companies/new">New company</Link>
        </Button>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">
          No companies yet.{" "}
          <Link className="underline" href="/companies/new">
            Create one
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Country</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.country ?? "—"}</td>
                  <td className="p-3">
                    {c.created_at
                      ? new Date(c.created_at).toLocaleDateString("fr-FR", {
                          timeZone: "Europe/Paris",
                        })
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
