import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getPagination, jsonError, jsonOk, parseJson } from '@/lib/api';
import { clientCreateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const { skip, take } = getPagination(searchParams);
    const usePagination = searchParams.has('page') || searchParams.has('pageSize');

    const clients = await db.client.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
          ],
        }),
      },
      orderBy: { created_at: 'desc' },
      ...(usePagination ? { skip, take } : {}),
      include: {
        properties: { select: { id: true, name: true, city: true } },
        _count: { select: { visits: true, salesOrders: true } },
      },
    });

    return jsonOk(clients);
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    return jsonError('Failed to fetch clients', 500, { code: error?.code, message: error?.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = clientCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten());
    }

    const cleaned = {
      name: parsed.data.name.trim(),
      cpf_cnpj: parsed.data.cpf_cnpj?.trim(),
      phone: parsed.data.phone?.trim(),
      email: parsed.data.email?.trim(),
    };

    const client = await db.client.create({
      data: {
        ...cleaned,
        created_by: 'marconi',
      },
    });

    return jsonOk(client, 201);
  } catch (error: any) {
    console.error('Error creating client:', error);
    if (error.code === 'P2002') {
      return jsonError('CPF/CNPJ already exists', 409, { code: error.code, message: error.message });
    }
    return jsonError('Failed to create client', 500, { code: error?.code, message: error?.message });
  }
}
