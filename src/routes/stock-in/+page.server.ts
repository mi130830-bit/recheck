import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export async function load() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  return { suppliers, products };
}