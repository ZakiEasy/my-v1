"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { getMyCompanies } from "@/lib/supa-helpers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Schema = z.object({
  buyer_company_id: z.string().uuid("Choose a company"),
  title: z.string().min(3, "Title too short"),
  description: z.string().optional(),
});

export default function NewRfqPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  useEffect(() => {
    (async () => {
      const list = await getMyCompanies();
      if (list.length === 0) {
        toast.warning("Create a company first");
        router.replace("/companies/new");
        return;
      }
      setCompanies(list);
      setSelectedCompany(list[0].id);
      // set default into form
      setValue("buyer_company_id", list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof Schema>>({
    resolver: zodResolver(Schema),
    defaultValues: { buyer_company_id: "", title: "", description: "" },
  });

  async function onSubmit(values: z.infer<typeof Schema>) {
    const { error } = await createClient.from("rfqs").insert(values);
    if (error) return toast.error(error.message);
    toast.success("RFQ created ✅");
    router.push("/rfqs");
  }

  if (companies.length === 0)
    return <div className="p-6">Loading…</div>;

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Create RFQ</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Buyer company */}
        <div className="space-y-1.5">
          <Label>Buyer company</Label>
          <Select
            value={selectedCompany}
            onValueChange={(val) => {
              setSelectedCompany(val);
              setValue("buyer_company_id", val, { shouldValidate: true });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.buyer_company_id && (
            <p className="text-xs text-red-600">
              {errors.buyer_company_id.message}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input placeholder="e.g. 10,000 bottles 1L olive oil" {...register("title")} />
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            placeholder="Specs, quality, packaging, delivery, etc."
            {...register("description")}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create"}
        </Button>
      </form>
    </section>
  );
}
