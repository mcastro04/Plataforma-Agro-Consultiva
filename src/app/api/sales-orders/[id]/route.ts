import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const salesOrder = await db.salesOrder.findUnique({
      where: {
        id: params.id
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        visit: {
          select: {
            id: true,
            scheduled_date: true,
            status: true,
            discussion_summary: true,
            property: {
              select: {
                id: true,
                name: true,
                city: true
              }
            }
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    });

    if (!salesOrder) {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      );
    }

    // Calculate total
    const total = salesOrder.orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return NextResponse.json({
      ...salesOrder,
      total
    });
  } catch (error) {
    console.error('Error fetching sales order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, orderItems } = body;

    const salesOrder = await db.salesOrder.update({
      where: {
        id: params.id
      },
      data: {
        ...(status && { status }),
        ...(orderItems && {
          orderItems: {
            deleteMany: {},
            create: orderItems
          }
        })
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
            product: true
          }
        }
      }
    });

    // Calculate total
    const total = salesOrder.orderItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    return NextResponse.json({
      ...salesOrder,
      total
    });
  } catch (error: any) {
    console.error('Error updating sales order:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update sales order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.salesOrder.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Sales order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting sales order:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Sales order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete sales order' },
      { status: 500 }
    );
  }
}