import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('property_id');

    const plots = await db.plot.findMany({
      where: propertyId ? { property_id: propertyId } : undefined,
      orderBy: {
        created_at: 'desc'
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
        },
        _count: {
          select: {
            plotEvaluations: true
          }
        }
      }
    });

    return NextResponse.json(plots);
  } catch (error) {
    console.error('Error fetching plots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { property_id, name, crop, area_hectares } = body;

    if (!property_id || !name) {
      return NextResponse.json(
        { error: 'Property ID and name are required' },
        { status: 400 }
      );
    }

    const plot = await db.plot.create({
      data: {
        property_id,
        name,
        crop,
        area_hectares: area_hectares ? parseFloat(area_hectares) : null,
        created_by: 'marconi'
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

    return NextResponse.json(plot, { status: 201 });
  } catch (error: any) {
    console.error('Error creating plot:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create plot' },
      { status: 500 }
    );
  }
}