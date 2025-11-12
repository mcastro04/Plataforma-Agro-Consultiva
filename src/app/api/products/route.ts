import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { getPagination, jsonError, jsonOk, parseJson } from '@/lib/api';
import { productCreateSchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const { skip, take } = getPagination(searchParams);
    const usePagination = searchParams.has('page') || searchParams.has('pageSize');

    const products = await db.product.findMany({
      where: {
        ...(type && { type }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { active_ingredient: { contains: search } },
          ],
        }),
      },
      orderBy: { created_at: 'desc' },
      ...(usePagination ? { skip, take } : {}),
    });

    return jsonOk(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return jsonError('Failed to fetch products', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJson(request);
    const parsed = productCreateSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Validation failed', 400, parsed.error.flatten());
    }

    const product = await db.product.create({
      data: { ...parsed.data, created_by: 'marconi' },
    });

    return jsonOk(product, 201);
  } catch (error: any) {
    console.error('Error creating product:', error);
    if (error.code === 'P2002') {
      return jsonError('Product with this name already exists', 409);
    }
    return jsonError('Failed to create product', 500);
  }
}
