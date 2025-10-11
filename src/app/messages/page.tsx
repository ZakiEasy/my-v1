"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase-browser"; // ✅ client-side

type Msg = {
  id: string;
  rfq_id: string;
  sender: string;
  body: string;
  created_at: string;
};

export default function MessagesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [rows, setRows] = useState<Msg[] | null>(null);
  const [me, setMe] = useState<string | null>(null);

  // Helper client-safe pour récupérer l'id utilisateur
  async function getCurrentUserIdClient(): Promise<string | null> {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.warn("auth.getUser error:", error.message);
      return null;
    }
    return data.user?.id ?? null;
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      // 1) Auth
      const uid = await getCurrentUserIdClient();
      if (!mounted) return;

      if (!uid) {
        toast.warning("Please sign in");
        setRows([]); // évite le skeleton infini
        return;
      }
      setMe(uid);

      // 2) Données (RLS doit filtrer côté DB)
      const { data, error } = await supabase
        .from("messages")
        .select("id,rfq_id,sender,body,created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!mounted) return;

      if (error) {
        toast.error(error.message);
        setRows([]);
        return;
      }
      setRows((data ?? []) as Msg[]);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <Button asChild>
          <Link href="/messages/new">New message</Link>
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
          No messages yet.{" "}
          <Link className="underline" href="/messages/new">
            Write one
          </Link>
          .
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">RFQ</th>
                <th className="text-left p-3">From</th>
                <th className="text-left p-3">Message</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3">{m.rfq_id?.slice(0, 8) ?? "—"}…</td>
                  <td className="p-3">
                    {me && m.sender === me ? "You" : (m.sender ?? "").slice(0, 6) + "…"}
                  </td>
                  <td className="p-3">{m.body}</td>
                  <td className="p-3">
                    {m.created_at
                      ? new Date(m.created_at).toLocaleString("fr-FR", {
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
