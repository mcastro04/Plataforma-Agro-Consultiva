import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const visitId = searchParams.get('visit_id');
    const plotId = searchParams.get('plot_id');

    const evaluations = await db.plotEvaluation.findMany({
      where: {
        ...(visitId && { visit_id: visitId }),
        ...(plotId && { plot_id: plotId })
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        visit: {
          select: {
            id: true,
            scheduled_date: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true
              }
            },
            property: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        plot: {
          select: {
            id: true,
            name: true,
            crop: true,
            area_hectares: true
          }
        },
        media: true,
        _count: {
          select: {
            media: true
          }
        }
      }
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      visit_id, 
      plot_id, 
      phenological_stage, 
      pest_or_disease, 
      infestation_level, 
      weeds, 
      technical_recommendation 
    } = body;

    if (!visit_id || !plot_id) {
      return NextResponse.json(
        { error: 'Visit ID and Plot ID are required' },
        { status: 400 }
      );
    }

    const evaluation = await db.plotEvaluation.create({
      data: {
        visit_id,
        plot_id,
        phenological_stage,
        pest_or_disease,
        infestation_level,
        weeds,
        technical_recommendation,
        created_by: 'marconi'
      },
      include: {
        visit: {
          select: {
            id: true,
            scheduled_date: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true
              }
            },
            property: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        plot: {
          select: {
            id: true,
            name: true,
            crop: true,
            area_hectares: true
          }
        }
      }
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating evaluation:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: 'Visit or Plot not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    );
  }
}