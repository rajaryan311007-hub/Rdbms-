import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const rows = await query<any[]>('SELECT publisher_id, publisher_name FROM Publishers ORDER BY publisher_name ASC').catch(() => []);
    return NextResponse.json({ publishers: rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch publishers' }, { status: 500 });
  }
}
