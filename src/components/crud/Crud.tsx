"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type RowRecord = Record<string, unknown>;
type FieldType = "text" | "number" | "textarea";

export type Field<T extends RowRecord> = {
  name: keyof T & string;
  label: string;
  type?: FieldType;
  placeholder?: string;
};

export function CrudList<T extends RowRecord>({
  table,
  title,
}: {
  table: string;
  title: string;
}) {
  const [rows, setRows] = useState<T[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from(table)
        .select<string, T>("*")
        .order("created_at", { ascending: false });
      if (error) {
        toast.error(error.message);
        setRows([]);
        return;
      }
      setRows(data ?? []);
    })();
  }, [table]);

  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{title} — List</h2>
      {rows.length === 0 ? (
        <div className="rounded border p-4 text-sm">No data yet.</div>
      ) : (
        <div className="rounded border p-3">
          <pre className="text-xs bg-muted/40 p-2 rounded overflow-auto">
            {JSON.stringify(rows, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}

export function CrudCreate<T extends RowRecord>({
  table,
  title,
  fields,
  preset,
  onCreated,
}: {
  table: string;
  title: string;
  fields: Field<T>[];
  preset?: Partial<T>;
  onCreated?: (inserted: T) => void;
}) {
  const [form, setForm] = useState<Partial<T>>({});

  useEffect(() => {
    setForm(preset ?? {});
  }, [preset]);

  function stringify(val: unknown): string {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    return JSON.stringify(val);
  }

  async function submit() {
    const payload = { ...(preset ?? {}), ...(form as T) };
    const { data, error } = await supabase
      .from(table)
      .insert(payload)
      .select()
      .single<T>();
    if (error) return toast.error(error.message);
    toast.success(`${title} created ✅`);
    if (data && onCreated) onCreated(data);
  }

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold">{title} — New</h2>
      <div className="space-y-3">
        {fields.map((f) => {
          const val = form[f.name];
          const common = {
            id: `field-${String(f.name)}`,
            value: stringify(val),
            placeholder: f.placeholder,
            onChange: (
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) =>
              setForm((s) => {
                const raw = e.target.value;
                let next: string | number | null = raw;
                if (f.type === "number") {
                  next = raw === "" ? null : Number(raw);
                }
                return { ...s, [f.name]: next } as Partial<T>;
              }),
          };

          return (
            <div key={String(f.name)} className="space-y-1.5">
              <Label htmlFor={common.id}>{f.label}</Label>
              {f.type === "textarea" ? (
                <Textarea {...common} />
              ) : (
                <Input
                  {...common}
                  inputMode={f.type === "number" ? "decimal" : undefined}
                  type={f.type === "number" ? "number" : "text"}
                />
              )}
            </div>
          );
        })}
      </div>
      <Button onClick={submit}>Create</Button>
    </section>
  );
}
