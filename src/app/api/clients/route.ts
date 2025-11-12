import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const clients = await db.client.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } }
          ]
        })
      },
      orderBy: {
        created_at: 'desc'
      },
      include: {
        properties: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        _count: {
          select: {
            visits: true,
            salesOrders: true
          }
        }
      }
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, cpf_cnpj, phone, email } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const client = await db.client.create({
      data: {
        name,
        cpf_cnpj,
        phone,
        email,
        created_by: 'marconi' // Temporário, até implementarmos autenticação
      }
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'CPF/CNPJ already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}