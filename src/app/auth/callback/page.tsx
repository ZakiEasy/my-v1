"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    // Supabase gère la session via le hash de l’URL, on peut rediriger après quelques ms
    const t = setTimeout(() => router.replace("/companies"), 300);
    return () => clearTimeout(t);
  }, [router]);
  return <main className="p-6">Connexion en cours…</main>;
}
