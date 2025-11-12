import { NextRequest, NextResponse } from 'next/server';

export type ApiError = {
  error: string;
  details?: any;
};

export function jsonOk<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data as any, init);
}

export function jsonError(error: string, status: number = 400, details?: any) {
  const body: ApiError = { error, ...(details ? { details } : {}) };
  return NextResponse.json(body, { status });
}

export async function parseJson<T>(request: NextRequest): Promise<T> {
  try {
    return await request.json();
  } catch {
    throw new Error('Invalid JSON body');
  }
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') ?? '20') || 20));
  const skip = (page - 1) * pageSize;
  const take = pageSize;
  return { page, pageSize, skip, take };
}
