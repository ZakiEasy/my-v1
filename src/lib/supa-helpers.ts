"use client";

import { supabase } from "@/lib/supabase-client";

/** Return the current user id or null */
export async function getCurrentUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Return the first company id owned by the current user, or null */
export async function getMyCompanyId() {
  const uid = await getCurrentUserId();
  if (!uid) return null;

  const { data, error } = await supabase
    .from("companies")
    .select("id")
    .eq("owner", uid)
    .limit(1);

  if (error) {
    console.error("getMyCompanyId error", error);
    return null;
  }

  return data?.[0]?.id ?? null;
}
export async function getMyCompanies() {
  const uid = await getCurrentUserId();
  if (!uid) return [];
  const { data, error } = await supabase
    .from("companies")
    .select("id,name")
    .eq("owner", uid);
  if (error) {
    console.error("getMyCompanies error", error);
    return [];
  }
  return (data ?? []) as { id: string; name: string }[];
}
export async function getMyCompanyMap() {
  const list = await getMyCompanies();
  return Object.fromEntries(list.map(c => [c.id, c.name]));
}

export async function getMySupplierCompanies() {
  // same as getMyCompanies but explicit naming for supplier flows
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("companies")
    .select("id,name")
    .eq("owner", user.id);
  if (error) return [];
  return (data ?? []) as { id: string; name: string }[];
}

export async function getMyBuyerRfqs() {
  // RFQs where my companies are the buyer (works with our current RLS)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: myCompanies } = await supabase
    .from("companies")
    .select("id")
    .eq("owner", user.id);
  const ids = (myCompanies ?? []).map((c) => c.id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("rfqs")
    .select("id,title")
    .in("buyer_company_id", ids)
    .order("created_at", { ascending: false });
  return (data ?? []) as { id: string; title: string }[];
}
// RFQs where I'm the buyer (already have getMyBuyerRfqs, keeping it)
// RFQs where I'm participating as a supplier (because I posted at least one quote)
export async function getSupplierRfqsByQuotes() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [] as { id: string; title?: string }[];

  // My supplier companies
  const { data: comps } = await supabase.from("companies").select("id").eq("owner", user.id);
  const companyIds = (comps ?? []).map((c) => c.id);
  if (companyIds.length === 0) return [];

  // Distinct RFQs from my quotes
  const { data: q } = await supabase
    .from("quotes")
    .select("rfq_id")
    .in("supplier_id", companyIds);

  const rfqIds = Array.from(new Set((q ?? []).map((x) => x.rfq_id)));

  // Try to fetch titles (RLS may prevent it, that’s fine — we’ll fallback to the id)
  if (rfqIds.length === 0) return [];
  const { data: rfqRows } = await supabase
    .from("rfqs")
    .select("id,title")
    .in("id", rfqIds);

  const withTitles = new Map(rfqRows?.map((r) => [r.id, r.title]) ?? []);
  return rfqIds.map((id) => ({ id, title: withTitles.get(id) }));
}

export async function getParticipatingRfqOptions() {
  // Merge buyer RFQs (titles available) + supplier RFQs via quotes (title if readable)
  const [buyer, supplier] = await Promise.all([
    getMyBuyerRfqs(),          // {id,title}[]
    getSupplierRfqsByQuotes()  // {id,title?}[]
  ]);

  const seen = new Set<string>();
  const all = [...buyer, ...supplier].filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });

  // Normalize: always expose {id, label}
  return all.map((r) => ({ id: r.id, label: r.title ?? `${r.id.slice(0, 8)}…` }));
}

