import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getPagination, jsonError, jsonOk, parseJson } from '@/lib/api';
import { visitCreateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const propertyId = searchParams.get('property_id');
    const status = searchParams.get('status');

    const { skip, take } = getPagination(searchParams);
    const usePagination = searchParams.has('page') || searchParams.has('pageSize');

    const visits = await db.visit.findMany({
      where: {
        ...(clientId && { client_id: clientId }),
        ...(propertyId && { property_id: propertyId }),
        ...(status && { status }),
      },
      orderBy: { scheduled_date: 'desc' },
      ...(usePagination ? { skip, take } : {}),
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, name: true, city: true } },
        _count: { select: { plotEvaluations: true } },
      },
    });

    return jsonOk(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return jsonError('Failed to fetch visits', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = visitCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten());
    }

    const visit = await db.visit.create({
      data: {
        client_id: parsed.data.client_id,
        property_id: parsed.data.property_id,
        scheduled_date: parsed.data.scheduled_date,
        objective: parsed.data.objective,
        status: 'AGENDADA',
        created_by: 'marconi',
      },
      include: {
        client: { select: { id: true, name: true } },
        property: { select: { id: true, name: true, city: true } },
      },
    });

    return jsonOk(visit, 201);
  } catch (error: any) {
    console.error('Error creating visit:', error);
    if (error.code === 'P2003') {
      return jsonError('Client or Property not found', 404);
    }
    return jsonError('Failed to create visit', 500);
  }
}
