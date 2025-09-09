"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data } = await supabase.from("companies").select("*");
      setCompanies(data || []);
    };
    fetchCompanies();
  }, []);

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Mes Companies</h1>
      <ul>
        {companies.map((c) => (
          <li key={c.id} className="border p-2 rounded">
            <strong>{c.name}</strong> — {c.country}
          </li>
        ))}
      </ul>
    </div>
  );
}
