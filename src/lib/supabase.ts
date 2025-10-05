// src/lib/supabase.ts
import { cookies } from "next/headers";
import {
  createBrowserClient as createBrowserClientSSR,
  createServerClient as createServerClientSSR,
} from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Client (navigateur) — pour composants client */
export function supabaseBrowser() {
  return createBrowserClientSSR(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/** Server (App Router) — Next 15+: cookies() est async */
export async function supabaseServer() {
  const cookieStore = await cookies(); // <-- IMPORTANT

  return createServerClientSSR(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options });
      },
    },
  });
}
