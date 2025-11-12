import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const property = await db.property.findUnique({
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
        plots: {
          orderBy: {
            created_at: 'desc'
          }
        },
        visits: {
          select: {
            id: true,
            scheduled_date: true,
            status: true,
            objective: true,
            discussion_summary: true
          },
          orderBy: {
            scheduled_date: 'desc'
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

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
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
    const { name, city } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const property = await db.property.update({
      where: {
        id: params.id
      },
      data: {
        name,
        city
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

    return NextResponse.json(property);
  } catch (error: any) {
    console.error('Error updating property:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.property.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting property:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}