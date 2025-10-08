"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  const [file, setFile] = useState<File | null>(null);
  const supabase = supabaseBrowser();

  async function upload() {
    if (!file) return;
    const path = `proofs/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("evidence").upload(path, file, { upsert: false });
    alert(error ? `Erreur : ${error.message}` : "Upload OK");
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Uploader une preuve</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <Button onClick={upload}>Envoyer</Button>
        </CardContent>
      </Card>
    </main>
  );
}
