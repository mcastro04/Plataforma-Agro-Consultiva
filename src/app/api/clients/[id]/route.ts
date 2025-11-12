import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await db.client.findUnique({
      where: {
        id: params.id
      },
      include: {
        properties: {
          include: {
            plots: {
              select: {
                id: true,
                name: true,
                crop: true,
                area_hectares: true
              }
            }
          }
        },
        visits: {
          select: {
            id: true,
            scheduled_date: true,
            status: true,
            objective: true,
            property: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            scheduled_date: 'desc'
          }
        },
        salesOrders: {
          select: {
            id: true,
            status: true,
            created_at: true,
            _count: {
              select: {
                orderItems: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
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
    const { name, cpf_cnpj, phone, email } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const client = await db.client.update({
      where: {
        id: params.id
      },
      data: {
        name,
        cpf_cnpj,
        phone,
        email
      }
    });

    return NextResponse.json(client);
  } catch (error: any) {
    console.error('Error updating client:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'CPF/CNPJ already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.client.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}