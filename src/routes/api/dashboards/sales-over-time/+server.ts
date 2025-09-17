// src/routes/api/dashboard/sales-over-time/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/prisma';

export async function GET() {
  // Logic to query sales data for the last 7 days
  // This is a simplified example
  const salesData = await db.order.groupBy({
    by: ['createdAt'],
    _sum: {
      total: true,
    },
    where: {
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return json(salesData);
}