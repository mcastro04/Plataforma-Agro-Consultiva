import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await db.product.findUnique({
      where: {
        id: params.id
      },
      include: {
        _count: {
          select: {
            orderItems: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
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
    const { name, type, active_ingredient } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    const product = await db.product.update({
      where: {
        id: params.id
      },
      data: {
        name,
        type,
        active_ingredient
      }
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Product with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.product.delete({
      where: {
        id: params.id
      }
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}