"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/lib/use-debounce";
import { cn } from "@/lib/utils";

type Props = { className?: string; incoterms?: string[] };

export default function ListingsFilters({ className, incoterms = ["EXW","FOB","CIF","DAP","DDP"] }: Props) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const [inc, setInc] = useState(sp.get("inc") ?? "");
  const [minPrice, setMinPrice] = useState(sp.get("pmin") ?? "");
  const [maxPrice, setMaxPrice] = useState(sp.get("pmax") ?? "");
  const [moq, setMoq] = useState(sp.get("moq") ?? "");
  const [sort, setSort] = useState(sp.get("sort") ?? "created_desc");

  const debouncedQ = useDebounce(q, 350);

  useEffect(() => {
    const params = new URLSearchParams(sp.toString());
    const setOrDel = (key: string, val: string) => val ? params.set(key, val) : params.delete(key);

    setOrDel("q", debouncedQ);
    setOrDel("inc", inc);
    setOrDel("pmin", minPrice);
    setOrDel("pmax", maxPrice);
    setOrDel("moq", moq);
    setOrDel("sort", sort);
    router.replace(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, inc, minPrice, maxPrice, moq, sort]);

  function clearAll() {
    setQ(""); setInc(""); setMinPrice(""); setMaxPrice(""); setMoq(""); setSort("created_desc");
    router.replace(pathname);
  }

  const sortOptions = useMemo(() => ([
    { v: "created_desc", label: "Newest" },
    { v: "created_asc",  label: "Oldest" },
    { v: "price_asc",    label: "Price ↑" },
    { v: "price_desc",   label: "Price ↓" },
    { v: "moq_asc",      label: "MOQ ↑" },
    { v: "moq_desc",     label: "MOQ ↓" },
  ]), []);

  return (
    <div className={cn("grid md:grid-cols-6 gap-3", className)}>
      <div className="space-y-1.5 md:col-span-2">
        <Label>Search (product/listing)</Label>
        <Input placeholder="name, description…" value={q} onChange={(e)=>setQ(e.target.value)} />
      </div>

      <div className="space-y-1.5">
<Label>Incoterm</Label>
<Select
  value={inc || "all"}
  onValueChange={(v) => setInc(v === "all" ? "" : v)}
>
  <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
  <SelectContent>
    {/* use "all" instead of "" */}
    <SelectItem value="all">All</SelectItem>
    {incoterms.map((i) => (
      <SelectItem key={i} value={i}>{i}</SelectItem>
    ))}
  </SelectContent>
</Select>
 </div>
      <div className="space-y-1.5">
        <Label>Price min</Label>
        <Input inputMode="decimal" value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>Price max</Label>
        <Input inputMode="decimal" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label>MOQ ≥</Label>
        <Input inputMode="numeric" value={moq} onChange={(e)=>setMoq(e.target.value)} />
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

      <div className="md:col-span-6 flex justify-end">
        <Button variant="outline" onClick={clearAll}>Clear</Button>
      </div>
    </div>
  );
}
