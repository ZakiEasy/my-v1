"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const login = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/companies/new`,
      },
    });
    if (error) alert(error.message);
    else setSent(true);
  };

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Connexion</h1>
      {sent ? (
        <p>Un lien de connexion a été envoyé à {email}.</p>
      ) : (
        <>
          <input
            className="border p-2 w-full"
            placeholder="ton@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={login}>
            Recevoir le lien
          </button>
        </>
      )}
    </main>
  );
}
