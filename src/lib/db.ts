import { PrismaClient } from '@prisma/client'

function sanitizeUrl(raw?: string) {
  if (!raw) return raw
  let url = raw
    .trim()
    // remove surrounding quotes
    .replace(/^"+|"+$/g, '')
    // remove all whitespace characters
    .replace(/\s+/g, '')
    // remove zero-width and BOM chars
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // remove box-drawing characters that sometimes appear when copying from UI
    .replace(/[\u2500-\u257F]/g, '')
    // remove ASCII pipe if it sneaks in
    .replace(/[|]/g, '')
  return url
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const cleanedUrl = sanitizeUrl(process.env.DATABASE_URL)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    datasources: cleanedUrl ? { db: { url: cleanedUrl } } : undefined,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
