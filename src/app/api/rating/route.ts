// app/api/ratings/route.ts
import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  const body = await req.json();
  const supabase = await supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'UNAUTHENTICATED' }, { status: 401 });

  const {
    rater_id, target_id, overall,
    importer_disputes = [], supplier_issues = [],
    evidence_urls = [], comment,
    quality, timeliness, compliance, communication
  } = body;

  if (!rater_id || !target_id || !overall || !comment || comment.length < 140) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
  }

  const { data: rater } = await supabase.from('companies').select('id,role').eq('id', rater_id).single();
  const { data: target } = await supabase.from('companies').select('id,role').eq('id', target_id).single();

  if (!rater || !target) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 });
  if (rater.id === target.id) return NextResponse.json({ error: 'SELF_RATING' }, { status: 400 });
  if (rater.role !== 'supplier' || target.role !== 'importer') {
    return NextResponse.json({ error: 'ROLE_MISMATCH' }, { status: 400 });
  }

  const { data, error } = await supabase.from('ratings').insert([{
    rater_id, target_id, overall,
    quality, timeliness, compliance, communication,
    importer_disputes, supplier_issues, evidence_urls, comment
  }]).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
