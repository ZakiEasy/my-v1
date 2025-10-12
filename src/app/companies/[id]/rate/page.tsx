"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getParticipatingRfqOptions } from "@/lib/supa-helpers";

const Schema = z.object({
  score: z.number().min(1).max(5),
  comment: z.string().optional(),
  rfq_id: z.string().uuid().nullable().optional(),
});

type RfqOption = { id: string; label: string };

export default function CompanyRatePage() {
  const params = useParams<{ id: string }>();
  const companyId = params?.id;
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [rfqs, setRfqs] = useState<RfqOption[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [rfqId, setRfqId] = useState<string>("");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof Schema>>({
      resolver: zodResolver(Schema),
      defaultValues: { score: 5, comment: "", rfq_id: null },
    });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;

      if (error || !data.user) {
        toast.warning("Please sign in");
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);

      const list = await getParticipatingRfqOptions();
      if (!mounted) return;
      setRfqs(list);
    })();

    return () => { mounted = false; };
  }, [supabase, router]);

  async function onSubmit(values: z.infer<typeof Schema>) {
    if (!userId || !companyId) return;

    const payload = {
      rater_id: userId,
      company_id: companyId,
      score: Number(values.score),
      comment: values.comment?.trim() || null,
      rfq_id: rfqId || null,
    };

    const { error } = await supabase.from("ratings").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Thanks for your rating ✅");
    router.push(`/companies/${companyId}`);
  }

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Rate company</h1>

      <div className="space-y-1.5">
        <Label>Score (1–5)</Label>
        <Input
          type="number"
          min={1}
          max={5}
          defaultValue={5}
          {...register("score", { valueAsNumber: true })}
        />
        {errors.score && <p className="text-xs text-red-600">Invalid score</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Related RFQ (optional)</Label>
        <Select
          value={rfqId}
          onValueChange={(v) => { setRfqId(v); setValue("rfq_id", v as any, { shouldValidate: true }); }}
        >
          <SelectTrigger><SelectValue placeholder="No RFQ" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">No RFQ</SelectItem>
            {rfqs.map(r => (
              <SelectItem key={r.id} value={r.id}>{r.label} — {r.id.slice(0,6)}…</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Comment (optional)</Label>
        <Textarea placeholder="Share some details…" {...register("comment")} />
      </div>

      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit"}
      </Button>
    </section>
  );
}
