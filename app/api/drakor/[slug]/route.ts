import { NextResponse } from 'next/server';
import { getSeriesDetail, parseCatId, searchSeries } from '@/lib/server/drakor-api';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    let catId = parseCatId(slug);
    if (!catId) {
      // Old-style slug without an id suffix: try a title search as a fallback.
      const hits = await searchSeries(slug.replace(/-/g, ' ')).catch(() => []);
      const exact = hits.find((h) => h.slug === slug);
      const first = exact || hits[0];
      catId = first ? parseCatId(first.slug) : null;
    }
    if (!catId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const detail = await getSeriesDetail(catId);
    return NextResponse.json(detail);
  } catch (e: any) {
    const status = /not found/i.test(e?.message || '') ? 404 : 502;
    return NextResponse.json({ error: e?.message || 'Upstream failed' }, { status });
  }
}
