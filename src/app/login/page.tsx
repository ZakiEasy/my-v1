// "use client";
// import { useState } from "react";
// import { supabase } from "@/lib/supabase-client";

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);

//   const login = async () => {
//     const { error } = await supabase.auth.signInWithOtp({
//       email,
//       options: {
//         emailRedirectTo: `${window.location.origin}/auth/callback`,
//       },
//     });
//     if (error) alert(error.message);
//     else setSent(true);
//   };

//   return (
//     <main className="max-w-md mx-auto p-6 space-y-4">
//       <h1 className="text-2xl font-bold">Connexion</h1>
//       {sent ? (
//         <p>Un lien de connexion a été envoyé à {email}.</p>
//       ) : (
//         <>
//           <input
//             className="border p-2 w-full"
//             placeholder="ton@email.com"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={login}>
//             Recevoir le lien
//           </button>
//         </>
//       )}
//     </main>
//   );
// }
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    router.replace("/companies");
  }

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    alert("Compte créé. Connecte-toi maintenant.");
  }

  return (
    <main className="max-w-sm mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-bold">Connexion</h1>
      <input className="border p-2 w-full" placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input className="border p-2 w-full" placeholder="mot de passe" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <div className="flex gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={signIn}>Se connecter</button>
        <button className="bg-gray-200 px-4 py-2 rounded" onClick={signUp}>Créer un compte</button>
      </div>
    </main>
  );
}
