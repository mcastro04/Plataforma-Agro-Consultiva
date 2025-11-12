import { z } from 'zod';

export const clientCreateSchema = z.object({
  name: z.string().min(1),
  cpf_cnpj: z.string().min(1).optional().or(z.literal('').transform(() => undefined)),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});
export const clientUpdateSchema = clientCreateSchema.partial().extend({ name: z.string().min(1) });

export const propertyCreateSchema = z.object({
  client_id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().optional(),
});
export const propertyUpdateSchema = z.object({
  name: z.string().min(1),
  city: z.string().optional(),
});

export const plotCreateSchema = z.object({
  property_id: z.string().min(1),
  name: z.string().min(1),
  crop: z.string().optional(),
  area_hectares: z.union([z.number(), z.string()]).optional().transform((v) => (v === '' || v === undefined ? undefined : Number(v))).refine((v) => v === undefined || !Number.isNaN(v), { message: 'area_hectares must be a number' }),
});
export const plotUpdateSchema = z.object({
  name: z.string().min(1),
  crop: z.string().optional(),
  area_hectares: z.union([z.number(), z.string()]).optional().transform((v) => (v === '' || v === undefined ? undefined : Number(v))).refine((v) => v === undefined || !Number.isNaN(v), { message: 'area_hectares must be a number' }),
});

export const productCreateSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  active_ingredient: z.string().optional(),
});
export const productUpdateSchema = productCreateSchema;

export const visitCreateSchema = z.object({
  client_id: z.string().min(1),
  property_id: z.string().min(1),
  scheduled_date: z.union([z.string(), z.date()]).transform((v) => new Date(v as any)).refine((d) => !Number.isNaN(d.getTime()), { message: 'scheduled_date must be a valid date' }),
  objective: z.string().optional(),
});
export const visitUpdateSchema = z.object({
  scheduled_date: z.union([z.string(), z.date()]).optional().transform((v) => (v ? new Date(v as any) : undefined)).refine((d) => d === undefined || !Number.isNaN((d as Date).getTime()), { message: 'scheduled_date must be a valid date' }),
  objective: z.string().optional(),
  discussion_summary: z.string().optional(),
  status: z.string().optional(),
});

export const orderItemSchema = z.object({
  product_id: z.string().min(1),
  quantity: z.number().or(z.string()).transform((v) => Number(v)).refine((n) => !Number.isNaN(n), { message: 'quantity must be a number' }),
  unit_price: z.number().or(z.string()).transform((v) => Number(v)).refine((n) => !Number.isNaN(n), { message: 'unit_price must be a number' }),
});
export const salesOrderCreateSchema = z.object({
  client_id: z.string().min(1),
  visit_id: z.string().optional(),
  status: z.string().optional(),
  orderItems: z.array(orderItemSchema).min(1),
});
export const salesOrderUpdateSchema = z.object({
  status: z.string().optional(),
  orderItems: z.array(orderItemSchema).optional(),
});
