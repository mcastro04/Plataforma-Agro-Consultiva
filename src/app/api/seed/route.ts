import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(_req: NextRequest) {
  try {
    // 1) Ensure a client exists
    let client = await db.client.findFirst()
    if (!client) {
      client = await db.client.create({
        data: {
          name: 'Cliente Demo',
          cpf_cnpj: '00000000000',
          phone: '0000000000',
          email: 'demo@example.com',
          created_by: 'seed',
        },
      })
    }

    // 2) Ensure a property for that client
    let property = await db.property.findFirst({ where: { client_id: client.id, name: 'Propriedade Demo' } })
    if (!property) {
      property = await db.property.create({
        data: {
          client_id: client.id,
          name: 'Propriedade Demo',
          city: 'Cidade Demo',
          created_by: 'seed',
        },
      })
    }

    // 3) Ensure a plot for that property
    let plot = await db.plot.findFirst({ where: { property_id: property.id, name: 'Talhão 1' } })
    if (!plot) {
      plot = await db.plot.create({
        data: {
          property_id: property.id,
          name: 'Talhão 1',
          crop: 'Milho',
          area_hectares: 10,
          created_by: 'seed',
        },
      })
    }

    // 4) Ensure a product exists
    let product = await db.product.findUnique({ where: { name: 'Produto Demo 1' } })
    if (!product) {
      product = await db.product.create({
        data: {
          name: 'Produto Demo 1',
          type: 'FERTILIZANTE',
          active_ingredient: 'NPK',
          created_by: 'seed',
        },
      })
    }

    // 5) Ensure a visit exists
    let visit = await db.visit.findFirst({ where: { client_id: client.id, property_id: property.id } })
    if (!visit) {
      visit = await db.visit.create({
        data: {
          client_id: client.id,
          property_id: property.id,
          scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          objective: 'Visita de demonstração',
          status: 'AGENDADA',
          created_by: 'seed',
        },
      })
    }

    // 6) Ensure a sales order with one item
    let order = await db.salesOrder.findFirst({ where: { client_id: client.id } })
    if (!order) {
      order = await db.salesOrder.create({
        data: {
          client_id: client.id,
          visit_id: visit.id,
          status: 'COTAÇÃO',
          created_by: 'seed',
          orderItems: {
            create: [{ product_id: product.id, quantity: 1, unit_price: 100 }],
          },
        },
        include: {
          orderItems: true,
        },
      })
    }

    return NextResponse.json({
      ok: true,
      client,
      property,
      plot,
      product,
      visit,
      order,
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ ok: false, error: error?.message || 'Seed failed' }, { status: 500 })
  }
}
