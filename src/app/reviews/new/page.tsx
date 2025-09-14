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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star } from "lucide-react";
import { toast } from "sonner";

const Schema = z.object({
  company_id: z.string().uuid("Choose a company or paste an ID"),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

type Company = { id:string; name:string };

export default function NewReviewPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [mode, setMode] = useState<"select"|"manual">("manual"); // reviews are typically for others → manual default
  const [manualCompanyId, setManualCompanyId] = useState("");

  const { register, handleSubmit, setValue, formState:{ errors, isSubmitting } } =
    useForm<z.infer<typeof Schema>>({
      resolver: zodResolver(Schema),
      defaultValues: { company_id: "", rating: 5, comment: "" }
    });

  useEffect(() => {
    (async () => {
      const list = await getMyCompanies(); // convenience: if you want to review your partners you own, else leave manual
      setCompanies(list);
      if (list[0]) {
        setCompanyId(list[0].id);
      }
      // default to manual empty; user can switch to Select mode
      setValue("company_id", "");
      setValue("rating", 5);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setValue("rating", rating);
    if (mode === "select") setValue("company_id", companyId);
    else setValue("company_id", manualCompanyId);
  }, [mode, companyId, manualCompanyId, rating, setValue]);

  async function onSubmit(values: z.infer<typeof Schema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.warning("Please sign in"); router.replace("/login"); return; }
    const { error } = await supabase.from("reviews").insert({
      company_id: values.company_id,
      rating: values.rating,
      comment: values.comment,
      author: user.id, // required by RLS
    });
    if (error) return toast.error(error.message);
    toast.success("Review submitted ✅");
    router.push("/reviews");
  }

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">New review</h1>

      {/* Mode */}
      <div className="flex gap-2 text-sm">
        <Button type="button" variant={mode==="manual"?"default":"outline"} onClick={()=>setMode("manual")}>Enter company ID</Button>
        <Button type="button" variant={mode==="select"?"default":"outline"} onClick={()=>setMode("select")}>Pick my company</Button>
      </div>

      {/* Company input */}
      {mode === "select" ? (
        <div className="space-y-1.5">
          <Label>Company</Label>
          <Select value={companyId} onValueChange={(v)=>{ setCompanyId(v); setValue("company_id", v); }}>
            <SelectTrigger><SelectValue placeholder="Choose a company" /></SelectTrigger>
            <SelectContent>
              {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.company_id && <p className="text-xs text-red-600">{errors.company_id.message}</p>}
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label>Company ID</Label>
          <Input placeholder="paste target company UUID" value={manualCompanyId} onChange={e=>setManualCompanyId(e.target.value)} />
          {errors.company_id && <p className="text-xs text-red-600">{errors.company_id.message}</p>}
        </div>
      )}

      {/* Star rating */}
      <div className="space-y-1.5">
        <Label>Rating</Label>
        <div className="flex items-center gap-2">
          {Array.from({length:5}).map((_,i)=>{
            const n = i+1;
            const filled = n <= rating;
            return (
              <button
                key={n}
                type="button"
                onClick={()=>setRating(n)}
                className="p-1"
                aria-label={`Rate ${n}`}
                title={`${n} stars`}
              >
                <Star className={`h-6 w-6 ${filled ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
              </button>
            );
          })}
          <span className="text-sm text-muted-foreground">{rating}/5</span>
        </div>
        {errors.rating && <p className="text-xs text-red-600">{errors.rating.message}</p>}
      </div>

      {/* Comment */}
      <div className="space-y-1.5">
        <Label>Comment (optional)</Label>
        <Textarea rows={4} placeholder="Add details…" {...register("comment")} />
      </div>

      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Submitting…" : "Submit review"}
      </Button>
    </section>
  );
}
