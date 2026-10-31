import { NextResponse } from 'next/server';
import { getCategoriesMapped, getGenres, searchSeries } from '@/lib/server/drakor-api';
import type { Drakor } from '@/types/donghua';

export const dynamic = 'force-dynamic';

function slugifyLocal(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-');
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const genre = url.searchParams.get('genre') || 'all';
    const type = url.searchParams.get('type') || 'all';
    const status = url.searchParams.get('status') || 'all';
    const sort = url.searchParams.get('sort') || 'popular';
    const page = Math.max(1, Number(url.searchParams.get('page') || 1) || 1);
    const pageSize = Math.min(40, Math.max(1, Number(url.searchParams.get('pageSize') || 20) || 20));

    let items: Drakor[] = q ? await searchSeries(q) : await getCategoriesMapped();

    if (genre !== 'all') {
      items = items.filter((d) =>
        d.genres.some((g) => slugifyLocal(g) === genre || g.toLowerCase() === genre.toLowerCase()),
      );
    }
    if (type !== 'all') items = items.filter((d) => d.type === type);
    if (status !== 'all') items = items.filter((d) => d.status === status);

    const sorted = [...items];
    if (sort === 'rating') sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === 'latest') sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    else if (sort === 'title-asc') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'title-desc') sorted.sort((a, b) => b.title.localeCompare(a.title));
    else sorted.sort((a, b) => b.views - a.views || b.rating - a.rating);

    const total = sorted.length;
    const paged = sorted.slice((page - 1) * pageSize, page * pageSize);
    const genres = await getGenres().catch(() => []);
    return NextResponse.json({
      items: paged,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      genres,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upstream failed' }, { status: 502 });
  }
}
