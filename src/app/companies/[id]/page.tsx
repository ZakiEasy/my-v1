// src/app/companies/[id]/page.tsx
import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase-server";

type Company = {
  id: string;
  name: string;
  country: string | null;
  created_at: string | null;
  score: number | null;
  kyc_level: number | null;
  certificates: string[] | null;
  product_families: string[] | null;
};

type RatingStats = {
  company_id: string;
  avg_score: number | null;
  ratings_count: number | null;
};

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase(); // ✅ IMPORTANT: await

  const cid = params.id;

  const [{ data: comp, error: e1 }, { data: stats, error: e2 }] = await Promise.all([
    supabase.from("companies").select("*").eq("id", cid).maybeSingle(),
    supabase.from("company_rating_stats").select("*").eq("company_id", cid).maybeSingle(),
  ]);

  if (e1) {
    return <div className="p-6 text-red-600">Erreur: {e1.message}</div>;
  }

  const c = (comp as Company) ?? null;
  const s = (stats as RatingStats) ?? { company_id: cid, avg_score: null, ratings_count: 0 };

  if (!c) {
    return <div className="p-6">Company introuvable</div>;
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{c.name}</h1>
        <div className="flex gap-2">
          <Link className="underline" href={`/companies/${cid}/rate`}>
            Déposer une note
          </Link>
          <Link className="underline" href={`/companies/${cid}/kyc`}>
            KYC
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Pays</div>
          <div className="text-lg">{c.country ?? "—"}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Score (métier)</div>
          <div className="text-lg">{c.score ?? "—"}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">KYC Level</div>
          <div className="text-lg">{c.kyc_level ?? "—"}</div>
        </div>

        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500">Score moyen (ratings)</div>
          <div className="text-lg">{s.avg_score ?? "—"}</div>
        </div>
        <div className="rounded border bg-white p-4">
          <div className="text-sm text-gray-500"># Avis</div>
          <div className="text-lg">{s.ratings_count ?? 0}</div>
        </div>
      </div>

      <div className="rounded border bg-white p-4">
        <div className="text-sm text-gray-500">Certificats</div>
        <div className="mt-1">{(c.certificates ?? []).join(", ") || "—"}</div>
      </div>
      <div className="rounded border bg-white p-4">
        <div className="text-sm text-gray-500">Familles de produits</div>
        <div className="mt-1">{(c.product_families ?? []).join(", ") || "—"}</div>
      </div>

      <div>
        <Link className="text-sm underline" href="/companies">
          ← Retour à la liste
        </Link>
      </div>
    </section>
  );
}
