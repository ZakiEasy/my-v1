"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function NavBar() {
  const [email, setEmail] = useState<string|null>(null);
  useEffect(() => {
    (async () => setEmail((await supabase.auth.getUser()).data.user?.email ?? null))();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setEmail(s?.user?.email ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav className="flex flex-wrap gap-3 items-center p-3 border-b">
      <Link href="/">Accueil</Link>

      <Link href="/companies">Companies</Link>
      <Link href="/companies/new">New</Link>

      <Link href="/products">Products</Link>
      <Link href="/products/new">New</Link>

      <Link href="/listings">Listings</Link>
      <Link href="/listings/new">New</Link>

      <Link href="/rfqs">RFQs</Link>
      <Link href="/rfqs/new">New</Link>

      <Link href="/quotes">Quotes</Link>
      <Link href="/quotes/new">New</Link>

      <Link href="/messages">Messages</Link>
      <Link href="/messages/new">New</Link>

      <Link href="/reviews">Reviews</Link>
      <Link href="/reviews/new">New</Link>

      <Link href="/kyc">KYC</Link>
      <Link href="/kyc/new">New</Link>

      <div className="ml-auto">
        {email ? (
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => supabase.auth.signOut()}>
            Logout ({email})
          </button>
        ) : (
          <Link href="/login" className="px-3 py-1 bg-blue-600 text-white rounded">Login</Link>
        )}
      </div>
    </nav>
  );
}
