"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function NavBar() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setEmail(user?.email ?? null);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  return (
    <nav className="flex items-center gap-4 p-3 border-b">
      <Link href="/" className="font-semibold">Accueil</Link>
      <Link href="/companies">Companies</Link>
      <Link href="/companies/new" className="underline">Créer une company</Link>
      <div className="ml-auto">
        {email ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">Connecté : {email}</span>
            <button
              className="px-3 py-1 rounded bg-gray-200"
              onClick={() => supabase.auth.signOut()}
            >
              Se déconnecter
            </button>
          </div>
        ) : (
          <Link href="/login" className="px-3 py-1 rounded bg-blue-600 text-white">
            Se connecter
          </Link>
        )}
      </div>
    </nav>
  );
}
