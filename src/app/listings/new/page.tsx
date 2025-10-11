"use client";
import { useEffect, useState } from "react";
import { CrudCreate } from "@/components/crud/Crud";
import { supcreateClientabase } from "@/lib/supabase-client";

export default function NewListing(){
  const [productId, setProductId] = useState("");
  useEffect(()=>{ (async()=>{
    const uid = (await createClient.auth.getUser()).data.user?.id;
    if(!uid) return;
    const { data } = await createClient
      .from("products").select("id, company_id, name")
      .in("company_id", (await createClient.from("companies").select("id").eq("owner", uid)).data?.map(c=>c.id) ?? []);
    setProductId(data?.[0]?.id ?? "");
  })(); },[]);
  if(!productId) return <main className="p-6">Crée d’abord un produit.</main>;
  return (
    <main className="p-6">
      <CrudCreate
        table="listings" title="Listing" preset={{ product_id: productId }}
        fields={[
          { name:"moq", label:"MOQ", type:"number"},
          { name:"price_min", label:"Prix min", type:"number"},
          { name:"price_max", label:"Prix max", type:"number"},
          { name:"incoterm", label:"Incoterm"},
          { name:"status", label:"Statut (active/draft/…)"}
        ]}
      />
    </main>
  );
}
