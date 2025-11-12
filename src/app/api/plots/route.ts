import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getPagination, jsonError, jsonOk, parseJson } from '@/lib/api';
import { plotCreateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id');

    const { skip, take } = getPagination(searchParams);
    const usePagination = searchParams.has('page') || searchParams.has('pageSize');

    const plots = await db.plot.findMany({
      where: propertyId ? { property_id: propertyId } : undefined,
      orderBy: { created_at: 'desc' },
      ...(usePagination ? { skip, take } : {}),
      include: {
        property: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
        _count: { select: { plotEvaluations: true } },
      },
    });

    return jsonOk(plots);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return jsonError('Failed to fetch plots', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = plotCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten());
    }

    const plot = await db.plot.create({
      data: {
        property_id: parsed.data.property_id,
        name: parsed.data.name,
        crop: parsed.data.crop,
        area_hectares: parsed.data.area_hectares ?? null,
        created_by: 'marconi',
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
    });

    return jsonOk(plot, 201);
  } catch (error: any) {
    console.error('Error creating plot:', error);
    if (error.code === 'P2003') {
      return jsonError('Property not found', 404);
    }
    return jsonError('Failed to create plot', 500);
  }
}
