import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('client_id');

    const salesOrders = await db.salesOrder.findMany({
      where: {
        ...(status && { status }),
        ...(clientId && { client_id: clientId })
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        visit: {
          select: {
            id: true,
            scheduled_date: true,
            property: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    // Calculate total values
    const salesOrdersWithTotals = salesOrders.map(order => ({
      ...order,
      total: order.orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0),
      itemsCount: order.orderItems.length
    }));

    return NextResponse.json(salesOrdersWithTotals);
  } catch (error) {
    console.error('Error fetching sales orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, visit_id, status, orderItems } = body;

    if (!client_id || !orderItems || orderItems.length === 0) {
      return NextResponse.json(
        { error: 'Client ID and at least one order item are required' },
        { status: 400 }
      );
    }

    // Validate order items
    for (const item of orderItems) {
      if (!item.product_id || !item.quantity || !item.unit_price) {
        return NextResponse.json(
          { error: 'All order items must have product_id, quantity and unit_price' },
          { status: 400 }
        );
      }
    }

    const salesOrder = await db.salesOrder.create({
      data: {
        client_id,
        visit_id,
        status: status || 'COTAÇÃO',
        created_by: 'marconi',
        orderItems: {
          create: orderItems
        }
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(salesOrder, { status: 201 });
  } catch (error: any) {
    console.error('Error creating sales order:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Client or visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create sales order' },
      { status: 500 }
    );
  }
}