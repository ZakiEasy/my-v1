"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    router.replace("/");
  }
  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    alert("Compte créé. Connecte-toi.");
  }

  return (
    <main className="p-6 max-w-sm mx-auto space-y-2">
      <h1 className="text-xl font-semibold">Connexion</h1>
      <input className="border p-2 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full" type="password" placeholder="mot de passe" value={password} onChange={e=>setPassword(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={signIn}>Se connecter</button>
        <button className="bg-gray-200 px-4 py-2 rounded" onClick={signUp}>Créer un compte</button>
      </div>
    </main>
  );
}
