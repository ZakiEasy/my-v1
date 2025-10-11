"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";
import { getMyCompanyMap } from "@/lib/supa-helpers";

type Review = {
  id: string;
  company_id: string;
  author: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[] | null>(null);
  const [myCompanies, setMyCompanies] = useState<Record<string,string>>({});

  useEffect(() => {
    (async () => {
      setRows(null);
      setMyCompanies(await getMyCompanyMap());
      const { data, error } = await createClient
        .from("reviews")
        .select("id,company_id,author,rating,comment,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows(error ? [] : (data ?? []));
    })();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reviews</h1>
        <Button asChild><Link href="/reviews/new">New review</Link></Button>
      </div>

      {rows === null ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded border p-6 text-center text-sm">
          No reviews yet. <Link className="underline" href="/reviews/new">Create one</Link>.
        </div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Rating</th>
                <th className="text-left p-3">Comment</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{myCompanies[r.company_id] ?? r.company_id.slice(0,8)+"…"}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1">
                      {Array.from({length:5}).map((_,i)=>(
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  </td>
                  <td className="p-3">{r.comment ?? "—"}</td>
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
