// "use client";
// import { useEffect, useState } from "react";
// import { CrudCreate } from "@/components/crud/Crud";
// import { supabase } from "@/lib/supabase-client";

// export default function NewProduct(){
//   const [companyId, setCompanyId] = useState("");
//   useEffect(()=>{ (async()=>{
//     const uid = (await supabase.auth.getUser()).data.user?.id;
//     if(!uid) return;
//     const { data } = await supabase.from("companies").select("id").eq("owner", uid).limit(1);
//     setCompanyId(data?.[0]?.id ?? "");
//   })(); },[]);
//   if(!companyId) return <main className="p-6">Crée d’abord une company.</main>;
//   return (
//     <main className="p-6">
//       <CrudCreate
//         table="products" title="Product" preset={{ company_id: companyId }}
//         fields={[
//           { name:"name", label:"Nom"},
//           { name:"category", label:"Catégorie"},
//           { name:"description", label:"Description"}
//         ]}
//       />
//     </main>
//   );
// }
"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { getMyCompanyId } from "@/lib/supa-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Schema = z.object({
  name: z.string().min(2, "Too short"),
  category: z.string().optional(),
  description: z.string().optional(),
});

export default function NewProductPage() {
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const c = await getMyCompanyId();
      if (!c) { toast.warning("Create your company first."); router.replace("/companies/new"); return; }
      setCompanyId(c);
    })();
  }, [router]);

  const { register, handleSubmit, formState:{ errors, isSubmitting } } =
    useForm<z.infer<typeof Schema>>({ resolver: zodResolver(Schema) });

  async function onSubmit(values: z.infer<typeof Schema>) {
    const { error } = await supabase.from("products").insert({ ...values, company_id: companyId });
    if (error) return toast.error(error.message);
    toast.success("Product created ✅");
    router.push("/products");
  }

  if (!companyId) return <div className="p-6">Loading…</div>;

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">New product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Input {...register("category")} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea {...register("description")} />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create"}
        </Button>
      </form>
    </section>
  );
}
