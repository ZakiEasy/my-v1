"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
// si tu utilises Supabase ici, importe ton client côté client
import { createClient } from "@/lib/supabase-client";

// Empêche le prerender/SSG de cette page pendant le build
export const dynamic = "force-dynamic";

function CallbackInner() {
  const sp = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // lis ce dont tu as besoin dans l’URL
    const redirect = sp.get("redirect_to") || "/";
    // 👉 si tu fais un échange de code (OAuth / PKCE), fais-le ici:
    // const code = sp.get("code");
    // if (code) {
    //   supabase.auth.exchangeCodeForSession({ code })
    //     .then(({ error }) => {
    //       if (error) toast.error(error.message);
    //       router.replace(redirect);
    //     });
    //   return;
    // }

    // pour l’OTP email classique, Supabase gère la session via le lien.
    // On redirige juste proprement :
    router.replace(redirect);
  }, [sp, router]);

  return <div className="p-6">Signing you in…</div>;
}

export default function Page() {
  // ⚠️ useSearchParams doit être sous <Suspense>
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
