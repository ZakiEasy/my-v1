"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { getParticipatingRfqOptions, getCurrentUserId } from "@/lib/supa-helpers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Schema = z.object({
  rfq_id: z.string().uuid("Provide a valid RFQ"),
  body: z.string().min(1, "Message cannot be empty"),
});

type RfqOption = { id: string; label: string };

export default function NewMessagePage() {
  const router = useRouter();
  const [rfqs, setRfqs] = useState<RfqOption[]>([]);
  const [rfqId, setRfqId] = useState("");
  const [sender, setSender] = useState<string | null>(null);

  // optional manual mode if user wants to paste an RFQ id they can participate in
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [rfqIdManual, setRfqIdManual] = useState("");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof Schema>>({
      resolver: zodResolver(Schema),
      defaultValues: { rfq_id: "", body: "" },
    });

  useEffect(() => {
    (async () => {
      const uid = await getCurrentUserId();
      if (!uid) { toast.warning("Please sign in"); router.replace("/login"); return; }
      setSender(uid);

      const list = await getParticipatingRfqOptions();
      setRfqs(list);
      if (list[0]) {
        setRfqId(list[0].id);
        setValue("rfq_id", list[0].id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    // keep form rfq_id in sync with UI mode
    setValue("rfq_id", mode === "select" ? rfqId : rfqIdManual);
  }, [mode, rfqId, rfqIdManual, setValue]);

  async function onSubmit(values: z.infer<typeof Schema>) {
    if (!sender) { toast.error("Not signed in"); return; }
    const { error } = await supabase.from("messages").insert({
      rfq_id: values.rfq_id,
      sender,
      body: values.body,
    });
    if (error) return toast.error(error.message);
    toast.success("Message sent ✅");
    router.push("/messages");
  }

  if (!sender) return <div className="p-6">Loading…</div>;

  const hasRfqs = rfqs.length > 0;

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">New message</h1>

      {/* Mode switch */}
      <div className="space-y-1.5">
        <Label>RFQ source</Label>
        <div className="flex gap-2 text-sm">
          <Button
            type="button"
            variant={mode === "select" ? "default" : "outline"}
            onClick={() => setMode("select")}
          >
            Pick from my RFQs
          </Button>
          <Button
            type="button"
            variant={mode === "manual" ? "default" : "outline"}
            onClick={() => setMode("manual")}
          >
            Enter RFQ ID
          </Button>
        </div>
      </div>

      {/* RFQ selector or manual entry */}
      {mode === "select" ? (
        <div className="space-y-1.5">
          <Label>RFQ</Label>
          <Select
            value={rfqId}
            onValueChange={(v) => { setRfqId(v); setValue("rfq_id", v, { shouldValidate: true }); }}
            disabled={!hasRfqs}
          >
            <SelectTrigger><SelectValue placeholder={hasRfqs ? "Choose RFQ" : "No RFQ available"} /></SelectTrigger>
            <SelectContent>
              {rfqs.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.label} — {r.id.slice(0, 6)}…
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.rfq_id && <p className="text-xs text-red-600">{errors.rfq_id.message}</p>}
          {!hasRfqs && <p className="text-xs text-muted-foreground">You have no RFQs to pick; switch to “Enter RFQ ID”.</p>}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>RFQ ID</Label>
          <Input
            placeholder="paste RFQ UUID"
            value={rfqIdManual}
            onChange={(e) => setRfqIdManual(e.target.value)}
          />
          {errors.rfq_id && <p className="text-xs text-red-600">{errors.rfq_id.message}</p>}
        </div>
      )}

      {/* Body */}
      <div className="space-y-1.5">
        <Label>Message</Label>
        <Textarea placeholder="Write your message…" {...register("body")} />
        {errors.body && <p className="text-xs text-red-600">{errors.body.message}</p>}
      </div>

      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send"}
      </Button>
    </section>
  );
}
