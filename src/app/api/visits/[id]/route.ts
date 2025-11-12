import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const visit = await db.visit.findUnique({
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
        property: {
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
        plotEvaluations: {
          include: {
            plot: {
              select: {
                id: true,
                name: true
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

    if (!visit) {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(visit);
  } catch (error) {
    console.error('Error fetching visit:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visit' },
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
    const { scheduled_date, objective, discussion_summary, status } = body;

    const visit = await db.visit.update({
      where: {
        id: params.id
      },
      data: {
        ...(scheduled_date && { scheduled_date: new Date(scheduled_date) }),
        ...(objective !== undefined && { objective }),
        ...(discussion_summary !== undefined && { discussion_summary }),
        ...(status && { status })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        },
        property: {
          select: {
            id: true,
            name: true,
            city: true
          }
        }
      }
    });

    return NextResponse.json(visit);
  } catch (error: any) {
    console.error('Error updating visit:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update visit' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.visit.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Visit deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting visit:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Visit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete visit' },
      { status: 500 }
    );
  }
}