"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

type Field = { name: string; label: string; type?: "text" | "number"; placeholder?: string };
type Props = {
  table: string;
  title: string;
  fields: Field[];
  preset?: Record<string, any>; // valeurs auto (ex: owner, company_id)
};

export function CrudList({ table, title }: { table: string; title: string }) {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const { data, error } = await supabase.from(table).select("*").order("created_at",{ascending:false});
    if (!error) setRows(data || []);
  })(); }, [table]);
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{title} — Liste</h2>
      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}

export function CrudCreate({ table, title, fields, preset }: Props) {
  const [form, setForm] = useState<Record<string, any>>({});
  useEffect(()=>{ setForm(preset || {}); },[preset]);
  async function submit() {
    const payload = { ...(preset||{}), ...form };
    const { error } = await supabase.from(table).insert(payload);
    if (error) return alert(error.message);
    alert(`${title} créé(e) ✅`);
  }
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">{title} — Nouveau</h2>
      {fields.map(f=>(
        <div key={f.name}>
          <label className="block text-sm mb-1">{f.label}</label>
          <input
            className="border p-2 w-full"
            type={f.type === "number" ? "number" : "text"}
            placeholder={f.placeholder}
            value={form[f.name] ?? ""}
            onChange={e=>setForm(s=>({...s,[f.name]: f.type==="number" ? Number(e.target.value) : e.target.value}))}
          />
        </div>
      ))}
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={submit}>Créer</button>
    </div>
  );
}
