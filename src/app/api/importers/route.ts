// app/api/importers/search/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const supabase = await supabaseServer();

  let query = supabase.from('companies').select('id,name,country,kyc_level,score').eq('role','importer').eq('country','DZ');
  if (q) query = query.ilike('name', `%${q}%`);

  const { data, error } = await query.limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
