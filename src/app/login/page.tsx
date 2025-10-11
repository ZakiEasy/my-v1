"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser"; // ⬅️ remplace -client par -browser

export default function LoginPage() {
  const router = useRouter();

  // Instancie le client une seule fois côté client
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Optionnel: si déjà connecté, redirige
  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (mounted && data.user) router.replace("/");
    })();
    return () => {
      mounted = false;
    };
  }, [supabase, router]);

  async function signIn() {
    setMsg(null);
    if (!email || !password) {
      setMsg("Email et mot de passe requis.");
      return;
    }
    try {
      setPending(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setMsg(error.message);
      router.replace("/");
    } catch (e: any) {
      setMsg(e?.message ?? "Erreur de connexion.");
    } finally {
      setPending(false);
    }
  }

  async function signUp() {
    setMsg(null);
    if (!email || !password) {
      setMsg("Email et mot de passe requis.");
      return;
    }
    try {
      setPending(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) return setMsg(error.message);
      setMsg("Compte créé. Vérifie tes emails pour valider ton compte, puis connecte-toi.");
    } catch (e: any) {
      setMsg(e?.message ?? "Erreur lors de la création du compte.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-3">
      <h1 className="text-xl font-semibold">Connexion</h1>

      {msg && (
        <div className="rounded border border-amber-200 bg-amber-50 text-amber-900 p-2 text-sm">
          {msg}
        </div>
      )}

      <input
        className="border p-2 w-full rounded"
        placeholder="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={pending}
      />

      <input
        className="border p-2 w-full rounded"
        type="password"
        placeholder="mot de passe"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={pending}
      />

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={signIn}
          disabled={pending}
        >
          {pending ? "Connexion..." : "Se connecter"}
        </button>
        <button
          className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
          onClick={signUp}
          disabled={pending}
        >
          {pending ? "Création..." : "Créer un compte"}
        </button>
      </div>
    </main>
  );
}
