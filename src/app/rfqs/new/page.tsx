"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Schema = z.object({
  title: z.string().min(3, "Title is too short"),
});

export default function NewRfqPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [me, setMe] = useState<string | null>(null);

  // charge l'id user au premier submit si pas déjà fait (évite un useEffect)
  async function ensureUser(): Promise<string | null> {
    if (me) return me;
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    const uid = data.user?.id ?? null;
    setMe(uid);
    return uid;
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { title: "" },
  });

  async function onSubmit(values: z.infer<typeof Schema>) {
    const uid = await ensureUser();
    if (!uid) {
      toast.warning("Please sign in");
      router.replace("/login");
      return;
    }

    // 1) créer RFQ
    const { data, error } = await supabase
      .from("rfqs")
      .insert({ title: values.title, buyer_id: uid })
      .select("id")
      .single();

    if (error) {
      toast.error(error.message);
      return;
    }

    // 2) s'ajouter comme participant (role buyer) — idempotent côté UI
    const { error: e2 } = await supabase
      .from("rfq_participants")
      .insert({ rfq_id: data.id, user_id: uid, role: "buyer" });

    if (e2) {
      // non bloquant : le RLS messages dépendra aussi de cette ligne
      toast.warning("RFQ created but participant insert failed: " + e2.message);
    } else {
      toast.success("RFQ created ✅");
    }

    router.push("/rfqs");
  }

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Create RFQ</h1>

      <div className="space-y-1.5">
        <Label>Title</Label>
        <Input placeholder="e.g., Organic Olive Oil 20L" {...register("title")} />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create"}
      </Button>
    </section>
  );
}
