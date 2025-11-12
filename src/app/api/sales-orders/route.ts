import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getPagination, jsonError, jsonOk, parseJson } from '@/lib/api';
import { salesOrderCreateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');

    const { skip, take } = getPagination(searchParams);
    const usePagination = searchParams.has('page') || searchParams.has('pageSize');

    const salesOrders = await db.salesOrder.findMany({
      where: {
        ...(status && { status }),
        ...(clientId && { client_id: clientId }),
      },
      orderBy: { created_at: 'desc' },
      ...(usePagination ? { skip, take } : {}),
      include: {
        client: { select: { id: true, name: true } },
        visit: {
          select: {
            id: true,
            scheduled_date: true,
            property: { select: { id: true, name: true } },
          },
        },
        orderItems: {
          include: { product: { select: { id: true, name: true, type: true } } },
        },
      },
    });

    const salesOrdersWithTotals = salesOrders.map((order) => ({
      ...order,
      total: order.orderItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0),
      itemsCount: order.orderItems.length,
    }));

    return jsonOk(salesOrdersWithTotals);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return jsonError('Failed to fetch sales orders', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = salesOrderCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten());
    }

    const salesOrder = await db.salesOrder.create({
      data: {
        client_id: parsed.data.client_id,
        visit_id: parsed.data.visit_id,
        status: parsed.data.status || 'COTAÇÃO',
        created_by: 'marconi',
        orderItems: { create: parsed.data.orderItems },
      },
      include: {
        client: { select: { id: true, name: true } },
        orderItems: { include: { product: { select: { id: true, name: true, type: true } } } },
      },
    });

    return jsonOk(salesOrder, 201);
  } catch (error: any) {
    console.error('Error creating sales order:', error);
    if (error.code === 'P2003') {
      return jsonError('Client or visit not found', 404);
    }
    return jsonError('Failed to create sales order', 500);
  }
}
