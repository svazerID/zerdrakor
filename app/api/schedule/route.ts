import { NextResponse } from 'next/server';
import { getSchedule } from '@/lib/server/drakor-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const items = await getSchedule();
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Upstream failed' }, { status: 502 });
  }
}
