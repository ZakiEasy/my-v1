"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getCurrentUserId } from "@/lib/supa-helpers";

type Msg = {
  id: string;
  rfq_id: string;
  sender: string;
  body: string;
  created_at: string;
};

export default function MessagesPage() {
  const [rows, setRows] = useState<Msg[] | null>(null);
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const uid = await getCurrentUserId();
      if (!uid) { toast.warning("Please sign in"); return; }
      setMe(uid);

      // RLS will return only messages where you are a participant
      const { data, error } = await supabase
        .from("messages")
        .select("id,rfq_id,sender,body,created_at")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        toast.error(error.message);
        setRows([]);
        return;
      }
      setRows((data ?? []) as Msg[]);
    })();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <Button asChild><Link href="/messages/new">New message</Link></Button>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">
          No messages yet. <Link className="underline" href="/messages/new">Write one</Link>.
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
                  <td className="p-3">{m.rfq_id.slice(0, 8)}…</td>
                  <td className="p-3">{me && m.sender === me ? "You" : m.sender.slice(0, 6) + "…"}</td>
                  <td className="p-3">{m.body}</td>
                  <td className="p-3">{new Date(m.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
