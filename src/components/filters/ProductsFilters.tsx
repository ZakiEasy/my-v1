"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  categories?: string[]; // optional: pass known categories
};

export default function ProductsFilters({ className, categories = [] }: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // local state from URL
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [cat, setCat] = useState(sp.get("cat") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "created_desc");

  const debouncedQ = useDebounce(q, 350);

  // sync URL when state changes
  useEffect(() => {
    const params = new URLSearchParams(sp.toString());
    if (debouncedQ) params.set("q", debouncedQ); else params.delete("q");
    if (cat) params.set("cat", cat); else params.delete("cat");
    if (sort) params.set("sort", sort); else params.delete("sort");
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, cat, sort]);

  function clearAll() {
    setQ(""); setCat(""); setSort("created_desc");
    router.replace(pathname);
  }

  const sortOptions = useMemo(() => ([
    { v: "created_desc", label: "Newest" },
    { v: "created_asc",  label: "Oldest" },
    { v: "name_asc",     label: "Name A→Z" },
    { v: "name_desc",    label: "Name Z→A" },
  ]), []);

  return (
    <div className={cn("grid md:grid-cols-4 gap-3", className)}>
      <div className="space-y-1.5 md:col-span-2">
        <Label>Search</Label>
        <Input placeholder="name or description…" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Category</Label>
        <Select value={cat} onValueChange={setCat}>
          <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All</SelectItem>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Sort</Label>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {sortOptions.map(o => <SelectItem key={o.v} value={o.v}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-4 flex justify-end">
        <Button variant="outline" onClick={clearAll}>Clear</Button>
      </div>
    </div>
  );
}
