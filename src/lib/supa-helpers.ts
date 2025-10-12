// Helpers côté client uniquement (pas d'usage de next/headers ici)
"use client";

import { createClient } from "./supabase-browser";

export async function getCurrentUserId(): Promise<string | null> {
  const sb = createClient();
  const { data, error } = await sb.auth.getUser();
  if (error) return null;
  return data.user?.id ?? null;
}

/**
 * Récupère les RFQ où l'utilisateur est participant, pour un select UI.
 * Retourne [{ id, label }]
 */
export async function getParticipatingRfqOptions(): Promise<{ id: string; label: string }[]> {
  const sb = createClient();
  const { data: du } = await sb.auth.getUser();
  const uid = du.user?.id;
  if (!uid) return [];

  const { data: parts, error: e1 } = await sb
    .from("rfq_participants")
    .select("rfq_id")
    .eq("user_id", uid)
    .limit(200);

  if (e1) return [];

  const ids = Array.from(new Set((parts ?? []).map((p: any) => p.rfq_id))).filter(Boolean);
  if (ids.length === 0) return [];

  const { data: rfqs, error: e2 } = await sb
    .from("rfqs")
    .select("id,title,created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });

  if (e2) return [];

  return (rfqs ?? []).map((r: any) => ({ id: r.id, label: r.title ?? r.id }));
}