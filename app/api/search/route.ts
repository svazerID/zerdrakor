import { NextResponse } from 'next/server';
import { getCategoriesMapped, searchSeries } from '@/lib/server/drakor-api';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const q = (new URL(req.url).searchParams.get('q') || '').trim();
    if (!q) return NextResponse.json({ items: [] });
    let items = await searchSeries(q);
    if (items.length === 0) {
      // Fallback: title substring over the full series catalogue.
      const needle = q.toLowerCase();
      const all = await getCategoriesMapped();
      items = all.filter((d) => d.title.toLowerCase().includes(needle)).slice(0, 20);
    }
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upstream failed' }, { status: 502 });
  }
}
