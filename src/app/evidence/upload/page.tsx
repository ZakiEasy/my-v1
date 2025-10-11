"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function EvidenceUploadPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rfqId, setRfqId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);

  /**
   * Convertit en ASCII sûr pour Storage:
   * - NFKD + suppression des diacritiques (é -> e)
   * - remplace tout sauf [a-zA-Z0-9._-] par "-"
   * - compresse les séparateurs multiples
   * - trim des "-" en début/fin
   * - limite la longueur (facultatif)
   */
  function sanitizeForStorageKey(input: string, maxLen = 120) {
    const withoutDiacritics = input
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, ""); // enlève diacritiques combinés

    const ascii = withoutDiacritics
      .replace(/['’`“”"«»]/g, "")      // guillemets/apostrophes typographiques
      .replace(/\s+/g, "-")            // espaces -> tirets
      .replace(/[^a-zA-Z0-9._-]/g, "-")// caractères non sûrs -> tirets
      .replace(/-+/g, "-")             // compresse
      .replace(/^\.+/, "")             // évite clé commençant par .
      .replace(/^-+|-+$/g, "");        // trim tirets

    const trimmed = ascii.slice(0, maxLen) || "file";
    // évite fin par point/espace
    return trimmed.replace(/[.\s]+$/, "");
  }

  function buildObjectKey(rfq: string, f: File) {
    const ts = Date.now();
    const ext = (() => {
      const m = (f.name || "").match(/\.([a-zA-Z0-9]+)$/);
      return m ? `.${m[1].toLowerCase()}` : "";
    })();

    const baseName = (f.name || "upload").replace(/\.[^.]+$/, ""); // sans extension
    const safeBase = sanitizeForStorageKey(baseName);
    const safeFile = `${safeBase}${ext || ""}` || `evidence${ext || ""}`;

    // ✅ clé complète: dossier + fichier
    // ajoute toujours un segment RFQ si tu veux le ranger par RFQ
    const safeRfq = sanitizeForStorageKey(rfq || "misc", 60);
    return `proofs/${safeRfq}/${ts}-${safeFile}`;
  }

  async function onUpload() {
    if (!rfqId) {
      toast.warning("Renseigne un RFQ ID");
      return;
    }
    if (!file) {
      toast.warning("Choisis un fichier à envoyer");
      return;
    }

    setPending(true);
    try {
      const { data: authData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !authData.user) {
        toast.error("Veuillez vous connecter.");
        return;
      }

      const key = buildObjectKey(rfqId, file);

      const { error } = await supabase.storage
        .from("evidence") // nom du bucket
        .upload(key, file, {
          upsert: false,
          cacheControl: "3600",
          contentType: file.type || "application/octet-stream",
        });

      if (error) {
        toast.error(error.message);
        return;
      }

      const { data: pub } = supabase.storage.from("evidence").getPublicUrl(key);
      toast.success("Fichier envoyé ✅");
      if (pub?.publicUrl) {
        console.log("Public URL:", pub.publicUrl);
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Erreur lors de l'upload");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Déposer des preuves (BL/PO/LC)</h1>

      <div className="space-y-2">
        <label className="text-sm">RFQ ID</label>
        <input
          className="border rounded p-2 w-full"
          placeholder="uuid du RFQ"
          value={rfqId}
          onChange={(e) => setRfqId(e.target.value)}
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm">Fichier</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          disabled={pending}
        />
        <p className="text-xs text-muted-foreground">
          Évite les noms avec apostrophes typographiques, accents, etc. Ils seront normalisés automatiquement.
        </p>
      </div>

      <Button onClick={onUpload} disabled={pending}>
        {pending ? "Envoi…" : "Envoyer"}
      </Button>
    </main>
  );
}
