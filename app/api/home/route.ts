import { NextResponse } from 'next/server';
import { getCategoriesMapped, getGenres, getLatestSeries, getSchedule } from '@/lib/server/drakor-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [latest, categories, genres, schedule] = await Promise.all([
      getLatestSeries(2),
      getCategoriesMapped(),
      getGenres(),
      getSchedule(),
    ]);
    const byRating = [...categories].sort((a, b) => b.rating - a.rating);
    const featured = byRating.slice(0, 5).map((d) => ({ ...d, featured: true }));
    const editorPicks = byRating.slice(0, 4).map((d) => ({ ...d, isEditorPick: true }));
    const movies = categories.filter((d) => d.type === 'movie').slice(0, 8);
    return NextResponse.json({ featured, editorPicks, latest: latest.slice(0, 8), movies, genres, schedule });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upstream failed' }, { status: 502 });
  }
}
