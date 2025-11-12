import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('client_id');
    const propertyId = searchParams.get('property_id');
    const status = searchParams.get('status');

    const visits = await db.visit.findMany({
      where: {
        ...(clientId && { client_id: clientId }),
        ...(propertyId && { property_id: propertyId }),
        ...(status && { status })
      },
      orderBy: {
        scheduled_date: 'desc'
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
        },
        _count: {
          select: {
            plotEvaluations: true
          }
        }
      }
    });

    return NextResponse.json(visits);
  } catch (error) {
    console.error('Error fetching visits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visits' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { client_id, property_id, scheduled_date, objective } = body;

    if (!client_id || !property_id || !scheduled_date) {
      return NextResponse.json(
        { error: 'Client ID, Property ID and scheduled date are required' },
        { status: 400 }
      );
    }

    const visit = await db.visit.create({
      data: {
        client_id,
        property_id,
        scheduled_date: new Date(scheduled_date),
        objective,
        status: 'AGENDADA',
        created_by: 'marconi'
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

    return NextResponse.json(visit, { status: 201 });
  } catch (error: any) {
    console.error('Error creating visit:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Client or Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create visit' },
      { status: 500 }
    );
  }
}