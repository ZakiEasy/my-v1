"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Schema = z.object({
  name: z.string().min(2, "Name too short"),
  country: z.string().optional(),
});

export default function NewCompanyPage() {
  const router = useRouter();
  const [owner, setOwner] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await createClient.auth.getUser();
      if (!user) { toast.warning("Please sign in"); router.replace("/login"); return; }
      setOwner(user.id);
    })();
  }, [router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<z.infer<typeof Schema>>({ resolver: zodResolver(Schema) });

  async function onSubmit(values: z.infer<typeof Schema>) {
    const { error } = await createClient.from("companies").insert({ ...values, owner });
    if (error) return toast.error(error.message);
    toast.success("Company created ✅");
    router.push("/companies");
  }

  if (!owner) return <div className="p-6">Loading…</div>;

  return (
    <section className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">New company</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Country</Label>
          <Input {...register("country")} placeholder="France" />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Create"}
        </Button>
      </form>
    </section>
  );
}
