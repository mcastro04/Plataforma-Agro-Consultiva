import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');

    const properties = await db.property.findMany({
      where: clientId ? { client_id: clientId } : undefined,
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
        _count: {
          select: {
            plots: true,
            visits: true
          }
        }
      }
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, name, city } = body;

    if (!client_id || !name) {
      return NextResponse.json(
        { error: 'Client ID and name are required' },
        { status: 400 }
      );
    }

    const property = await db.property.create({
      data: {
        client_id,
        name,
        city,
        created_by: 'marconi'
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(property, { status: 201 });
  } catch (error: any) {
    console.error('Error creating property:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}