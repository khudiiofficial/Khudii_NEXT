import { NextResponse } from 'next/server';
import db from '@/server/admin-backend/Database/oldDB';

export const dynamic = 'force-dynamic';

export async function GET() {
  let stylesheet = '';
  try {
    const [rows] = await db.promise().query(
      "SELECT content FROM khudii_admin_settings WHERE bucket = 'css' LIMIT 1",
    );
    if (rows[0]?.content) {
      const parsed = JSON.parse(rows[0].content);
      stylesheet = typeof parsed?.stylesheet === 'string' ? parsed.stylesheet : '';
    }
  } catch {
    stylesheet = '';
  }

  return new NextResponse(stylesheet || '/* Khudii CMS Global CSS */', {
    status: 200,
    headers: {
      'Content-Type': 'text/css; charset=utf-8',
      'Cache-Control': 'public, max-age=120, stale-while-revalidate=600',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  });
}
