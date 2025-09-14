"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { getMyCompanies } from "@/lib/supa-helpers";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Schema = z.object({
  company_id: z.string().uuid("Choose a company"),
  doc_type: z.string().min(2, "Type required"),
  file_url: z.string().url("Must be a valid URL"),
});

type Company = { id:string; name:string };

export default function NewKycPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");

  const { register, handleSubmit, setValue, formState:{ errors, isSubmitting } } =
    useForm<z.infer<typeof Schema>>({
      resolver: zodResolver(Schema),
      defaultValues: { company_id: "", doc_type: "", file_url: "" }
    });

  useEffect(() => {
    (async () => {
      const list = await getMyCompanies();
      if (list.length === 0) { toast.warning("Create a company first"); router.replace("/companies/new"); return; }
      setCompanies(list);
      setCompanyId(list[0].id);
      setValue("company_id", list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function onSubmit(values: z.infer<typeof Schema>) {
    const { error } = await supabase.from("kyc_documents").insert({
      company_id: values.company_id,
      doc_type: values.doc_type,
      file_url: values.file_url,
      status: "pending",
    });
    if (error) return toast.error(error.message);
    toast.success("KYC uploaded ✅");
    router.push("/kyc");
  }

  if (companies.length === 0) return <div className="p-6">Loading…</div>;

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Upload KYC</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Company */}
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Select value={companyId} onValueChange={(v)=>{ setCompanyId(v); setValue("company_id", v, { shouldValidate:true }); }}>
            <SelectTrigger><SelectValue placeholder="Choose a company" /></SelectTrigger>
            <SelectContent>
              {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.company_id && <p className="text-xs text-red-600">{errors.company_id.message}</p>}
        </div>

        {/* Doc type */}
        <div className="space-y-1.5">
          <Label>Document type</Label>
          <Input placeholder="e.g. ISO22000, HACCP, KBIS" {...register("doc_type")} />
          {errors.doc_type && <p className="text-xs text-red-600">{errors.doc_type.message}</p>}
        </div>

        {/* File URL (placeholder MVP) */}
        <div className="space-y-1.5">
          <Label>File URL</Label>
          <Input placeholder="https://…" {...register("file_url")} />
          {errors.file_url && <p className="text-xs text-red-600">{errors.file_url.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Uploading…" : "Upload"}
        </Button>
      </form>
    </section>
  );
}
