import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plot = await db.plot.findUnique({
      where: {
        id: params.id
      },
      include: {
        property: {
          include: {
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        plotEvaluations: {
          include: {
            visit: {
              select: {
                id: true,
                scheduled_date: true,
                status: true
              }
            },
            media: true,
            _count: {
              select: {
                media: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          }
        }
      }
    });

    if (!plot) {
      return NextResponse.json(
        { error: 'Plot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(plot);
  } catch (error) {
    console.error('Error fetching plot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plot' },
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
    const { name, crop, area_hectares } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const plot = await db.plot.update({
      where: {
        id: params.id
      },
      data: {
        name,
        crop,
        area_hectares: area_hectares ? parseFloat(area_hectares) : null
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(plot);
  } catch (error: any) {
    console.error('Error updating plot:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Plot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update plot' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.plot.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Plot deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting plot:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Plot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete plot' },
      { status: 500 }
    );
  }
}