import { NextResponse } from 'next/server';
import { getRankings } from '@/lib/server/drakor-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const period = new URL(req.url).searchParams.get('period') || 'weekly';
    const items = await getRankings(period);
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upstream failed' }, { status: 502 });
  }
}
