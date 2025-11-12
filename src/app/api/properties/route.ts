import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getPagination, jsonError, jsonOk, parseJson } from '@/lib/api';
import { propertyCreateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    const { skip, take } = getPagination(searchParams);
    const usePagination = searchParams.has('page') || searchParams.has('pageSize');

    const properties = await db.property.findMany({
      where: clientId ? { client_id: clientId } : undefined,
      orderBy: { created_at: 'desc' },
      ...(usePagination ? { skip, take } : {}),
      include: {
        client: { select: { id: true, name: true } },
        _count: { select: { plots: true, visits: true } },
      },
    });

    return jsonOk(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return jsonError('Failed to fetch properties', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = propertyCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten());
    }

    const property = await db.property.create({
      data: { ...parsed.data, created_by: 'marconi' },
      include: { client: { select: { id: true, name: true } } },
    });

    return jsonOk(property, 201);
  } catch (error: any) {
    console.error('Error creating property:', error);
    if (error.code === 'P2003') {
      return jsonError('Client not found', 404);
    }
    return jsonError('Failed to create property', 500);
  }
}
