"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { getMySupplierCompanies, getMyBuyerRfqs } from "@/lib/supa-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Schema = z.object({
  supplier_id: z.string().uuid("Choose a supplier company"),
  rfq_id: z.string().uuid("Provide a valid RFQ ID"),
  price: z.coerce.number().optional(),
  message: z.string().optional(),
  status: z.string().optional(), // sent|accepted|rejected (default sent)
});

type Company = { id: string; name: string };
type RfqLite = { id: string; title: string };

export default function NewQuotePage() {
  const router = useRouter();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [supplierId, setSupplierId] = useState<string>("");

  const [rfqs, setRfqs] = useState<RfqLite[]>([]);
  const [rfqId, setRfqId] = useState<string>("");        // select option
  const [rfqIdManual, setRfqIdManual] = useState<string>(""); // manual entry

  // mode: "select" (pick from my RFQs) or "manual" (paste known RFQ id)
  const [mode, setMode] = useState<"select" | "manual">("select");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: {
      supplier_id: "",
      rfq_id: "",
      price: undefined,
      message: "",
      status: "sent",
    },
  });

  useEffect(() => {
    (async () => {
      // load my supplier companies
      const myComps = await getMySupplierCompanies();
      if (myComps.length === 0) {
        toast.warning("Create your company first");
        router.replace("/companies/new");
        return;
      }
      setCompanies(myComps);
      setSupplierId(myComps[0].id);
      setValue("supplier_id", myComps[0].id);

      // load my buyer RFQs (useful for testing when same user)
      const myRfqs = await getMyBuyerRfqs();
      setRfqs(myRfqs);
      if (myRfqs[0]) {
        setRfqId(myRfqs[0].id);
        setValue("rfq_id", myRfqs[0].id);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // keep form rfq_id in sync with UI mode/fields
  useEffect(() => {
    if (mode === "select") {
      setValue("rfq_id", rfqId);
    } else {
      setValue("rfq_id", rfqIdManual);
    }
  }, [mode, rfqId, rfqIdManual, setValue]);

  async function onSubmit(values: z.infer<typeof Schema>) {
    const { error } = await createClient.from("quotes").insert(values);
    if (error) return toast.error(error.message);
    toast.success("Quote created ✅");
    router.push("/quotes");
  }

  const hasRfqsToPick = useMemo(() => rfqs.length > 0, [rfqs]);

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">New quote</h1>

      {/* Supplier company */}
      <div className="space-y-1.5">
        <Label>Supplier company</Label>
        <Select
          value={supplierId}
          onValueChange={(val) => {
            setSupplierId(val);
            setValue("supplier_id", val, { shouldValidate: true });
          }}
        >
          <SelectTrigger><SelectValue placeholder="Choose a supplier company" /></SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.supplier_id && (
          <p className="text-xs text-red-600">{errors.supplier_id.message}</p>
        )}
      </div>

      {/* RFQ pick mode */}
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

      {/* RFQ selector or manual input */}
      {mode === "select" ? (
        <div className="space-y-1.5">
          <Label>RFQ</Label>
          <Select
            value={rfqId}
            onValueChange={(val) => {
              setRfqId(val);
              setValue("rfq_id", val, { shouldValidate: true });
            }}
            disabled={!hasRfqsToPick}
          >
            <SelectTrigger><SelectValue placeholder={hasRfqsToPick ? "Choose an RFQ" : "No RFQ available"} /></SelectTrigger>
            <SelectContent>
              {rfqs.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.title} — {r.id.slice(0, 6)}…
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!hasRfqsToPick && (
            <p className="text-xs text-muted-foreground">You have no buyer RFQs. Switch to “Enter RFQ ID”.</p>
          )}
          {errors.rfq_id && <p className="text-xs text-red-600">{errors.rfq_id.message}</p>}
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

      {/* Amount + message */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Price (optional)</Label>
          <Input
            inputMode="decimal"
            placeholder="e.g. 1234.50"
            {...register("price")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Input
            placeholder="sent / accepted / rejected"
            defaultValue="sent"
            {...register("status")}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Message (optional)</Label>
        <Textarea placeholder="Add context or terms…" {...register("message")} />
      </div>

      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Creating…" : "Create"}
      </Button>
    </section>
  );
}
