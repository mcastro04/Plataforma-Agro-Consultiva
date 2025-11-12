import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const evaluation = await db.plotEvaluation.findUnique({
      where: {
        id: params.id
      },
      include: {
        visit: {
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
        media: true
      }
    });

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error fetching evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluation' },
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
    const { 
      phenological_stage, 
      pest_or_disease, 
      infestation_level, 
      weeds, 
      technical_recommendation 
    } = body;

    const evaluation = await db.plotEvaluation.update({
      where: {
        id: params.id
      },
      data: {
        phenological_stage,
        pest_or_disease,
        infestation_level,
        weeds,
        technical_recommendation
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

    return NextResponse.json(evaluation);
  } catch (error: any) {
    console.error('Error updating evaluation:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update evaluation' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.plotEvaluation.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Evaluation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting evaluation:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Evaluation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete evaluation' },
      { status: 500 }
    );
  }
}