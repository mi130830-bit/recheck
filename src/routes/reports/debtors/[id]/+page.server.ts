// File: src/routes/reports/debtors/[id]/+page.server.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function load({ params }) {
  const customerId = Number(params.id);
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const creditOrders = await prisma.order.findMany({
    where: { customerId: customerId, status: 'CREDIT' },
    orderBy: { createdAt: 'desc' },
  });
  return { customer, creditOrders };
}