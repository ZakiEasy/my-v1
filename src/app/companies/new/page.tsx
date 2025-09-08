"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase-client";

export default function NewCompanyPage() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const createCompany = async () => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert("Tu dois être connecté");
      return;
    }

    const { error } = await supabase.from("companies").insert({
      name,
      country,
      owner: user.id,
    });
    if (error) {
      alert(error.message);
    } else {
      alert("Company créée !");
      setName("");
      setCountry("");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-xl font-bold">Créer une Company</h1>
      <input
        className="border w-full p-2"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border w-full p-2"
        placeholder="Pays"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={createCompany}
      >
        Créer
      </button>
    </div>
  );
}
