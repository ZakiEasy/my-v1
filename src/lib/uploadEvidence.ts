// lib/uploadEvidence.ts
import { supabaseBrowser } from "@/lib/supabase";

export async function uploadEvidence(files: File[]) {
  const supabase = supabaseBrowser();
  const urls: string[] = [];

  for (const f of files) {
    const path = `bl-po-lc/${Date.now()}-${crypto.randomUUID()}-${f.name}`;
    const { error } = await supabase.storage.from("evidence").upload(path, f, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;

    // Si BUCKET PUBLIC:
    const { data: pub } = supabase.storage.from("evidence").getPublicUrl(path);
    urls.push(pub.publicUrl);

    // Si BUCKET PRIVÉ (remplace les 2 lignes ci-dessus par celles-ci):
    // const { data, error: signErr } = await supabase.storage.from("evidence").createSignedUrl(path, 60 * 60);
    // if (signErr) throw signErr;
    // urls.push(data.signedUrl);
  }

  return urls;
}
