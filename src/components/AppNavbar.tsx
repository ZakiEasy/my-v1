// src/components/AppNavbar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type UserProfile = {
  user_id: string;
  display_name: string | null;
  role_current: "buyer" | "supplier";
};

export default function AppNavbar() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user ?? null;
    setEmail(user?.email ?? null);

    if (user) {
      const { data } = await supabase
        .from("user_profiles")
        .select("user_id,display_name,role_current")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setProfile(data as UserProfile);
      else {
        // bootstrap profile si absent
        const res = await supabase.from("user_profiles").insert({
          user_id: user.id,
          display_name: user.email,
          role_current: "buyer",
        }).select("*").maybeSingle();
        if (!res.error && res.data) setProfile(res.data as UserProfile);
      }
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    setEmail(null);
    setProfile(null);
    toast.success("Déconnecté");
  }

  async function toggleRole() {
    if (!profile) return;
    const next = profile.role_current === "buyer" ? "supplier" : "buyer";
    const { error, data } = await supabase
      .from("user_profiles")
      .update({ role_current: next })
      .eq("user_id", profile.user_id)
      .select("*")
      .maybeSingle();
    if (error) return toast.error(error.message);
    setProfile(data as UserProfile);
    toast.success(`Rôle : ${next === "buyer" ? "Acheteur" : "Fournisseur"}`);
  }

  return (
    <nav className="w-full border-b bg-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        <Link href="/" className="font-semibold">Fournisseurs ↔ Importateurs</Link>
        <div className="ml-auto flex items-center gap-2">
          <Link className="text-sm" href="/companies">Companies</Link>
          <Link className="text-sm" href="/products">Products</Link>
          <Link className="text-sm" href="/messages">Messages</Link>
          <Link className="text-sm" href="/evidence/upload">Evidence</Link>

          {email ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">({email})</span>
              <Button variant="outline" size="sm" onClick={toggleRole} disabled={loading}>
                {profile?.role_current === "supplier" ? "Fournisseur" : "Acheteur"}
              </Button>
              <Button size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <Button asChild size="sm"><Link href="/login">Login</Link></Button>
          )}
        </div>
      </div>
    </nav>
  );
}
