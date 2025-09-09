"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  useEffect(() => {
    const next = params.get("next") || "/companies";
    const t = setTimeout(() => router.replace(next), 400);
    return () => clearTimeout(t);
  }, [params, router]);
  return <main className="p-6">Connexion en cours…</main>;
}
