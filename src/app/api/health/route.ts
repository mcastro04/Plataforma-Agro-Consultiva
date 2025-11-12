import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { jsonOk, jsonError } from '@/lib/api';

export async function GET(_req: NextRequest) {
  try {
    const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

    // Try a lightweight DB call
    let dbOk = false;
    try {
      await db.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch (e) {
      dbOk = false;
    }

    return jsonOk({ ok: true, hasDatabaseUrl, dbOk });
  } catch (error: any) {
    console.error('Healthcheck error:', error);
    return jsonError('Healthcheck failed', 500, { code: error?.code, message: error?.message });
  }
}
