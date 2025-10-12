"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// simple ASCII key helper (évite accents & espaces)
function makeSafeKey(filename: string) {
  const base = filename.normalize("NFKD").replace(/[^\x00-\x7F]/g, "");
  const safe = base.replace(/[^\w.\-]+/g, "_");
  return `${Date.now()}_${safe}`;
}

type KycDoc = {
  id: string;
  doc_type: string;
  storage_path: string;
  status: string;
  created_at: string;
};

export default function CompanyKycPage() {
  const params = useParams<{ id: string }>();
  const companyId = params?.id;
  const supabase = useMemo(() => createClient(), []);

  const [userId, setUserId] = useState<string | null>(null);
  const [docType, setDocType] = useState<string>("passport");
  const [file, setFile] = useState<File | null>(null);
  const [docs, setDocs] = useState<KycDoc[] | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!mounted) return;
      if (error || !data.user) {
        toast.warning("Please sign in");
        return;
      }
      setUserId(data.user.id);

      await refreshList();
    })();
    return () => { mounted = false; };
  }, [supabase]);

  async function refreshList() {
    if (!companyId) return;
    const { data, error } = await supabase
      .from("kyc_documents")
      .select("id,doc_type,storage_path,status,created_at")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(200);

    setDocs(error ? [] : (data as KycDoc[]));
  }

  async function onUpload() {
    if (!userId) { toast.warning("Please sign in"); return; }
    if (!companyId) { toast.error("Missing company id"); return; }
    if (!file) { toast.error("Choose a file"); return; }

    const key = makeSafeKey(file.name);

    // 1) upload privé vers bucket "kyc"
    const { error: upErr } = await supabase.storage.from("kyc").upload(key, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (upErr) { toast.error(upErr.message); return; }

    // 2) log en base
    const { error: dbErr } = await supabase.from("kyc_documents").insert({
      company_id: companyId,
      uploaded_by: userId,
      doc_type: docType,
      storage_path: key,
    });
    if (dbErr) { toast.error(dbErr.message); return; }

    toast.success("Document uploaded ✅");
    setFile(null);
    await refreshList();
  }

  async function getSignedUrl(path: string) {
    const { data, error } = await supabase.storage.from("kyc").createSignedUrl(path, 60 * 5);
    if (error || !data?.signedUrl) { toast.error(error?.message ?? "Cannot sign URL"); return; }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">KYC documents</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Document type</Label>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="license">License</SelectItem>
              <SelectItem value="tax">Tax</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>File</Label>
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>

        <div className="flex items-end">
          <Button onClick={onUpload} disabled={!file}>Upload</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Path</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Created</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {docs?.map((d) => (
              <tr key={d.id} className="border-t">
                <td className="p-3">{d.doc_type}</td>
                <td className="p-3">{d.storage_path}</td>
                <td className="p-3">{d.status}</td>
                <td className="p-3">
                  {new Date(d.created_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}
                </td>
                <td className="p-3">
                  <Button variant="outline" size="sm" onClick={() => getSignedUrl(d.storage_path)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
            {!docs?.length && (
              <tr><td className="p-3" colSpan={5}>No documents.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
