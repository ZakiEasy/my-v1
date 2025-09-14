"use client";
import { useEffect, useState } from "react";
import { CrudCreate } from "@/components/crud/Crud";
import { supabase } from "@/lib/supabase-client";

export default function NewCompany(){
  const [owner, setOwner] = useState<string>("");
  useEffect(()=>{ (async()=>{ setOwner((await supabase.auth.getUser()).data.user?.id ?? ""); })(); },[]);
  if(!owner) return <main className="p-6">Connecte-toi puis reviens ici.</main>;
  return (
    <main className="p-6">
      <CrudCreate
        table="companies"
        title="Company"
        preset={{ owner }}
        fields={[
          { name:"name", label:"Nom"},
          { name:"country", label:"Pays"}
        ]}
      />
    </main>
  );
}
